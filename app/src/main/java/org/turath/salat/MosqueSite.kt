package org.turath.salat

import java.net.HttpURLConnection
import java.net.URI
import java.net.URL

/** Reads a masjid's congregation (iqamah) times from the masjid's own web page. Best effort: it understands a plain timetable
 *  (a table or lines such as «Fajr 06:28 AM 06:40 AM»); a page that draws its times with a script cannot be read. */
object MosqueSite {
    data class Times(val iq: Map<String, Int>, val jumuah: List<Int>) { val found get() = iq.size + jumuah.size }

    private val KEYS = listOf(
        "FAJR" to Regex("fajr|fajar|subh|sobh|الفجر|فجر", RegexOption.IGNORE_CASE),
        "DHUHR" to Regex("dhuhr|zuhr|zohr|dhur|duhr|zuhar|dhohr|الظهر|ظهر|ظہر", RegexOption.IGNORE_CASE),
        "ASR" to Regex("\\basr\\b|\\basar\\b|العصر|عصر", RegexOption.IGNORE_CASE),
        "MAGHRIB" to Regex("maghrib|magrib|maghreb|المغرب|مغرب", RegexOption.IGNORE_CASE),
        "ISHA" to Regex("\\bisha\\b|\\besha\\b|ishaa|isha'a|العشاء|عشاء|عشا", RegexOption.IGNORE_CASE),
        "JUM" to Regex("jumu|jumm|jum'a|jumah|friday|الجمعة|جمعة|جمعہ", RegexOption.IGNORE_CASE))
    private val TIME = Regex("(?<![\\d:.])(\\d{1,2})([:.])(\\d{2})(?!\\d)\\s*(a\\.?\\s?m\\.?|p\\.?\\s?m\\.?)?", RegexOption.IGNORE_CASE)

    /** the page as lines of text; the cells of a table row stay on one line */
    fun lines(html: String): List<String> {
        var s = html.replace(Regex("(?is)<(script|style|noscript)[^>]*>.*?</\\1>"), " ")
        s = s.replace(Regex("(?i)</t[dh]\\s*>"), " | ").replace(Regex("(?i)</(tr|p|div|li|h[1-6]|table|section)\\s*>|<br\\s*/?>"), "\n")
        s = s.replace(Regex("(?s)<[^>]*>"), " ")
        s = s.replace("&nbsp;", " ").replace("&amp;", "&").replace("&#8217;", "'").replace("&#039;", "'").replace("&apos;", "'").replace("&rsquo;", "'").replace("\u00a0", " ")
        return s.split('\n').map { it.replace(Regex("[ \\t]+"), " ").trim() }.filter { it.isNotEmpty() }
    }

    private fun minutes(key: String, h: Int, sep: String, m: Int, ap: String?): Int? {
        if (h > 23 || m > 59) return null
        val a = ap?.lowercase()?.firstOrNull()
        if (sep == "." && a == null) return null
        var hh = h
        if (a == 'p' && hh < 12) hh += 12
        if (a == 'a' && hh == 12) hh = 0
        if (a == null) when (key) {
            "DHUHR", "JUM" -> if (hh in 1..6) hh += 12
            "ASR", "MAGHRIB", "ISHA" -> if (hh < 12) hh += 12
        }
        return hh * 60 + m
    }

    fun parse(html: String): Times {
        val text = lines(html)
        val all = text.joinToString(" ")
        // a page that shows only one column of times, headed «Iqamah» / «Jamaat», has the congregation times in it
        val onlyIqamah = Regex("iqama|iqamah|jama'?at|jamaah|congregation", RegexOption.IGNORE_CASE).containsMatchIn(all) &&
            !Regex("begin|start|adhan|azan|athan", RegexOption.IGNORE_CASE).containsMatchIn(all)
        val iq = linkedMapOf<String, Int>()
        val jum = mutableListOf<Int>()
        for (line in text) {
            // the places in the line where a prayer's name stands; the text up to the next name belongs to it
            val hits = KEYS.flatMap { (k, re) -> re.findAll(line).map { Triple(it.range.first, it.range.last + 1, k) }.toList() }.sortedBy { it.first }
            for ((i, h) in hits.withIndex()) {
                val end = hits.getOrNull(i + 1)?.first ?: line.length
                val seg = line.substring(h.second, end)
                val t = TIME.findAll(seg).toList()
                if (t.isEmpty()) continue
                // the name must be followed closely by its first time (otherwise it is a sentence)
                if (t.first().range.first > 40) continue
                val ms = t.mapNotNull { minutes(h.third, it.groupValues[1].toInt(), it.groupValues[2], it.groupValues[3].toInt(), it.groupValues[4].ifEmpty { null }) }
                if (ms.isEmpty()) continue
                if (h.third == "JUM") { jum += ms.last(); continue }
                if (h.third in iq) continue
                if (ms.size >= 2) iq[h.third] = ms.last() else if (onlyIqamah) iq[h.third] = ms.first()
            }
        }
        return Times(iq, jum.distinct().sorted().take(3))
    }

    private fun get(u: String): String? {
        var url = u
        repeat(4) {
            val c = URL(url).openConnection() as HttpURLConnection
            c.instanceFollowRedirects = false; c.connectTimeout = 10_000; c.readTimeout = 15_000
            c.setRequestProperty("User-Agent", "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36")
            c.setRequestProperty("Accept-Language", "en")
            val code = c.responseCode
            if (code in 300..399) { url = URI(url).resolve(c.getHeaderField("Location") ?: return null).toString(); return@repeat }
            if (code != 200) return null
            return c.inputStream.use { it.readNBytes(1_500_000) }.toString(Charsets.UTF_8)
        }
        return null
    }

    /** the times from a masjid's page; if its first page has none, the pages it links to as «prayer times» / «iqamah» / «timetable» */
    fun fetch(site: String): Times? {
        val start = site.trim().let { if (it.startsWith("http")) it else "https://$it" }
        val html = runCatching { get(start) }.getOrNull() ?: return null
        var best = parse(html)
        if (best.iq.size >= 3) return best
        val host = runCatching { URI(start).host }.getOrNull()
        val links = Regex("href\\s*=\\s*[\"']([^\"'#]+)[\"']", RegexOption.IGNORE_CASE).findAll(html).map { it.groupValues[1] }
            .filter { Regex("prayer|salah|salat|namaz|timing|timetable|iqamah|iqama|schedule", RegexOption.IGNORE_CASE).containsMatchIn(it) }
            .mapNotNull { runCatching { URI(start).resolve(it.replace(" ", "%20")).toString() }.getOrNull() }
            .filter { runCatching { URI(it).host }.getOrNull() == host && !it.endsWith(".pdf", true) && !it.contains(Regex("\\.(jpg|png|css|js)$", RegexOption.IGNORE_CASE)) }
            .distinct().take(3).toList()
        for (l in links) {
            val p = runCatching { get(l) }.getOrNull()?.let { parse(it) } ?: continue
            if (p.found > best.found) best = p
            if (best.iq.size >= 4) break
        }
        return if (best.found > 0) best else null
    }
}
