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

/** finding a masjid by its name: OpenStreetMap's place search (Nominatim), and the masjid's website by an ordinary web search */
object MosqueSearch {
    data class Hit(val name: String, val address: String, val city: String, val km: Double, val website: String)

    private fun httpGet(u: String, ms: Int = 12_000): String? = runCatching {
        val c = URL(u).openConnection() as HttpURLConnection
        c.connectTimeout = ms; c.readTimeout = ms
        c.setRequestProperty("User-Agent", "SalatKhairAlQuroon/1.0 (https://turathkhairalquroon.com)")
        c.setRequestProperty("Accept-Language", "en")
        if (c.responseCode == 200) c.inputStream.use { it.readNBytes(2_000_000) }.toString(Charsets.UTF_8) else null
    }.getOrNull()

    /** masjids with this name, those near (lat, lng) first */
    fun byName(q: String, lat: Double, lng: Double): List<Hit> {
        fun ask(text: String): List<Hit> {
            val box = "%.3f,%.3f,%.3f,%.3f".format(java.util.Locale.US, lng - 0.8, lat + 0.6, lng + 0.8, lat - 0.6)
            val u = "https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&extratags=1&limit=15&viewbox=$box&q=" + java.net.URLEncoder.encode(text, "UTF-8")
            val body = httpGet(u) ?: return emptyList()
            val arr = runCatching { org.json.JSONArray(body) }.getOrNull() ?: return emptyList()
            val out = mutableListOf<Hit>()
            for (i in 0 until arr.length()) {
                val o = arr.getJSONObject(i)
                val a = o.optJSONObject("address"); val x = o.optJSONObject("extratags")
                val name = o.optString("name").ifEmpty { o.optString("display_name").substringBefore(",") }
                val city = listOf("city", "town", "village", "suburb", "hamlet", "county").firstNotNullOfOrNull { k -> a?.optString(k)?.takeIf { it.isNotEmpty() } } ?: ""
                val road = listOfNotNull(a?.optString("house_number")?.takeIf { it.isNotEmpty() }, a?.optString("road")?.takeIf { it.isNotEmpty() }).joinToString(" ")
                val km = Cities.dist(lat, lng, o.optDouble("lat"), o.optDouble("lon"))
                out += Hit(name, listOf(road, city).filter { it.isNotEmpty() }.joinToString(", "), city, km,
                    (x?.optString("website") ?: "").ifEmpty { x?.optString("contact:website") ?: "" }.ifEmpty { x?.optString("url") ?: "" })
            }
            return out
        }
        val first = ask(q).ifEmpty { if (Regex("masjid|mosque|islamic|centre|center|musall|jami", RegexOption.IGNORE_CASE).containsMatchIn(q)) emptyList() else ask("$q masjid") }
        return first.distinctBy { it.name + it.address }.sortedBy { it.km }.take(8)
    }

    private val SKIP = Regex("facebook|instagram|twitter|x\\.com|youtube|yelp|google|wikipedia|tripadvisor|mapquest|bing|linkedin|pinterest|tiktok|salatomatic|islamicfinder|muslimpro|waze|foursquare|yellowpages|maps\\.apple", RegexOption.IGNORE_CASE)

    /** the masjid's own website and its times: the first results of a web search are tried one after another */
    fun viaWeb(name: String, city: String): Pair<String, MosqueSite.Times>? {
        val q = java.net.URLEncoder.encode("$name $city prayer times iqamah", "UTF-8")
        val html = httpGet("https://html.duckduckgo.com/html/?q=$q", 15_000) ?: return null
        val urls = Regex("uddg=([^&\"']+)").findAll(html).map { runCatching { java.net.URLDecoder.decode(it.groupValues[1], "UTF-8") }.getOrDefault("") }
            .filter { it.startsWith("http") && !SKIP.containsMatchIn(runCatching { URI(it).host }.getOrNull() ?: "") }
            .distinctBy { runCatching { URI(it).host }.getOrNull() }.take(4).toList()
        var best: Pair<String, MosqueSite.Times>? = null
        for (u in urls) {
            val t = runCatching { MosqueSite.fetch(u) }.getOrNull() ?: continue
            if (best == null || t.found > best.second.found) best = u to t
            if (t.iq.size >= 4) break
        }
        return best?.takeIf { it.second.found >= 3 }
    }
}
