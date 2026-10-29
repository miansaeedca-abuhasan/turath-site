package org.turath.salat

import java.net.HttpURLConnection
import java.net.URI
import java.net.URL

/** Reads a masjid's congregation (iqamah) times from the masjid's own web page. Best effort: it understands a plain timetable
 *  (a table or lines such as «Fajr 06:28 AM 06:40 AM»); a page that draws its times with a script cannot be read. */
object MosqueSite {
    data class Times(val iq: Map<String, Int>, val jumuah: List<Int>, val maghribAtSunset: Boolean = false, val maghribAfter: Int = 0) { val found get() = iq.size + jumuah.size + (if (maghribAtSunset && "MAGHRIB" !in iq) 1 else 0) }

    private val KEYS = listOf(
        "FAJR" to Regex("fajr|fajar|fajer|subh|sobh|imsak|الفجر|فجر", RegexOption.IGNORE_CASE),
        "DHUHR" to Regex("dhuhr|zuhr|zuhur|zohr|zohar|dhur|duhr|duhur|duhar|zuhar|dhohr|öğle|ogle|الظهر|ظهر|ظہر", RegexOption.IGNORE_CASE),
        "ASR" to Regex("\\basr\\b|\\basar\\b|ikindi|العصر|عصر", RegexOption.IGNORE_CASE),
        "MAGHRIB" to Regex("maghrib|magrib|maghreb|akşam|المغرب|مغرب", RegexOption.IGNORE_CASE),
        "ISHA" to Regex("\\bisha\\b|\\besha\\b|ishaa|ish'aa|isha'a|yatsı|العشاء|عشاء|عشا", RegexOption.IGNORE_CASE),
        "SUNRISE" to Regex("sunrise|shurooq|shuruq|shorook|ishraq|zawal|الشروق|شروق|طلوع|اشراق", RegexOption.IGNORE_CASE),
        "JUM" to Regex("jumu|jumm|jum'a|jumaa|jumah|cuma|friday|الجمعة|جمعة|جمعہ", RegexOption.IGNORE_CASE))
    private val TIME = Regex("(?<![\\d:.])(\\d{1,2})([:.])(\\d{2})(?!\\d)\\s*(a\\.?\\s?m\\.?|p\\.?\\s?m\\.?)?", RegexOption.IGNORE_CASE)

    /** the page as lines of text; the cells of a table row stay on one line */
    fun lines(html: String): List<String> {
        var s = html.replace(Regex("(?is)<(script|style|noscript)[^>]*>.*?</\\1>"), " ")
        s = s.replace(Regex("(?i)</t[dh]\\s*>"), " | ").replace(Regex("(?i)</(tr|p|div|li|h[1-6]|table|section)\\s*>|<br\\s*/?>"), "\n")
        s = s.replace(Regex("(?s)<[^>]*>"), " ")
        s = s.replace("&nbsp;", " ").replace("&amp;", "&").replace("&#8217;", "'").replace("&#039;", "'").replace("&apos;", "'").replace("&rsquo;", "'").replace("\u00a0", " ")
        s = s.replace(Regex("(?i)\\b(1[0-2]|[1-9])([0-5]\\d)\\s*([ap])\\.?m\\b"), "\$1:\$2 \$3m")     // «640AM» → «6:40 am»
        return s.split('\n').map { it.replace(Regex("[ \\t]+"), " ").trim() }.filter { it.isNotEmpty() }
    }

    private fun minutes(key: String, h: Int, sep: String, m: Int, ap: String?): Int? {
        if (h > 23 || m > 59) return null
        val a = ap?.lowercase()?.firstOrNull()
        if (sep == "." && a == null && m % 5 != 0) return null
        var hh = h
        if (a == 'p' && hh < 12) hh += 12
        if (a == 'a' && hh == 12) hh = 0
        if (a == null) when (key) {
            "DHUHR", "JUM" -> if (hh in 1..6) hh += 12
            "ASR", "MAGHRIB", "ISHA" -> if (hh < 12) hh += 12
        }
        // a time that cannot belong to this prayer is not one of its times (a Jumu'ah at 8 pm is an announcement, not the prayer)
        val ok = when (key) { "FAJR" -> hh in 2..8; "DHUHR" -> hh in 11..15; "ASR" -> hh in 13..19; "MAGHRIB" -> hh in 15..22; "ISHA" -> hh in 18..23 || hh == 0 || hh == 1; "JUM" -> hh in 11..15 && !(hh == 15 && m > 45); else -> true }
        if (!ok) {
            // «Zuhr 1:30 am» on a page is a slip of the pen for pm
            val pm = hh + 12
            if (a == 'a' && pm < 24 && when (key) { "DHUHR" -> pm in 11..15; "ASR" -> pm in 13..19; "MAGHRIB" -> pm in 15..22; "ISHA" -> pm in 18..23; "JUM" -> pm in 11..15; else -> false }) return pm * 60 + m
            return null
        }
        return hh * 60 + m
    }

    private val MON = "jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec"
    private val RANGE = Regex("($MON)[a-z]*\\.?\\s*(\\d{1,2})\\s*(?:-|–|—|to|till|until)\\s*(?:($MON)[a-z]*\\.?\\s*)?(\\d{1,2})", RegexOption.IGNORE_CASE)
    private fun mon(s: String) = MON.split("|").indexOf(s.lowercase().take(3)) + 1

    /** a timetable in columns by date («Oct 01-10 | Oct 11-20 | Oct 21-31»): the index of the column that holds today, and how many columns there are */
    private fun dateColumns(text: List<String>, today: java.time.LocalDate): Pair<Int, Int>? {
        for (line in text) {
            val rs = RANGE.findAll(line).toList()
            if (rs.size < 2) continue
            val doy = today.monthValue * 100 + today.dayOfMonth
            for ((i, r) in rs.withIndex()) {
                val m1 = mon(r.groupValues[1]); val d1 = r.groupValues[2].toInt()
                val m2 = if (r.groupValues[3].isEmpty()) m1 else mon(r.groupValues[3]); val d2 = r.groupValues[4].toInt()
                val a = m1 * 100 + d1; val b = m2 * 100 + d2
                if (if (a <= b) doy in a..b else (doy >= a || doy <= b)) return i to rs.size
            }
            return rs.size - 1 to rs.size
        }
        return null
    }

    fun parse(html: String, today: java.time.LocalDate = java.time.LocalDate.now()): Times {
        val text = lines(html)
        val cols = dateColumns(text, today)
        var sunset = false
        val all = text.joinToString(" ")
        // a page that shows only one column of times, headed «Iqamah» / «Jamaat», has the congregation times in it
        // a page that gives each prayer one time only (no table of begin + iqamah) gives the congregation time
        val pairs = text.any { l -> KEYS.any { (k, re) -> k != "JUM" && k != "SUNRISE" && re.containsMatchIn(l) } && TIME.findAll(l).count() >= 2 }
        val onlyIqamah = !pairs || (Regex("iqama|iqamah|jama'?at|jamaah|congregation", RegexOption.IGNORE_CASE).containsMatchIn(all) &&
            !Regex("begin|start|adhan|azan|athan", RegexOption.IGNORE_CASE).containsMatchIn(all))
        // one row per day with the date first («27/10/2026 …»): Sunrise, Fajr begins and jama'ah, Zuhr begins and jama'ah, Asr (two begin times) and jama'ah, Maghrib, Isha
        for (line in text) {
            val m = Regex("^(\\d{1,2})/(\\d{1,2})/(\\d{2,4})\\b").find(line) ?: continue
            if (m.groupValues[1].toInt() != today.dayOfMonth || m.groupValues[2].toInt() != today.monthValue) continue
            val ts = TIME.findAll(line.substring(m.range.last + 1)).toList()
            if (ts.size != 12) continue
            fun at(k: String, i: Int) = ts[i].let { minutes(k, it.groupValues[1].toInt(), it.groupValues[2], it.groupValues[3].toInt(), it.groupValues[4].ifEmpty { null }) }
            val r = linkedMapOf<String, Int>()
            for ((k, i) in listOf("FAJR" to 2, "DHUHR" to 4, "ASR" to 7, "MAGHRIB" to 9, "ISHA" to 11)) at(k, i)?.let { r[k] = it }
            if (r.size >= 4) return Times(r, emptyList())
        }
        // a header row of prayer names and, under it, a row of times (one cell for each name)
        for ((i, l) in text.withIndex()) {
            if (i + 1 >= text.size || TIME.containsMatchIn(l)) continue
            val hc = l.split("|").map { it.trim() }
            val keys = hc.map { c -> if (c.length <= 20) KEYS.firstOrNull { (_, re) -> re.containsMatchIn(c) }?.first else null }
            if (keys.filterNotNull().filter { it != "JUM" && it != "SUNRISE" }.distinct().size < 4) continue
            val vc = text[i + 1].split("|").map { it.trim() }
            if (vc.size != hc.size) continue
            val r = linkedMapOf<String, Int>(); var jm: Int? = null
            for ((j, k) in keys.withIndex()) {
                if (k == null) continue
                val t = TIME.find(vc[j]) ?: continue
                val mm = minutes(k, t.groupValues[1].toInt(), t.groupValues[2], t.groupValues[3].toInt(), t.groupValues[4].ifEmpty { null }) ?: continue
                if (k == "JUM") jm = mm else if (k != "SUNRISE") r.putIfAbsent(k, mm)
            }
            if (r.size >= 4) return Times(r, listOfNotNull(jm))
        }
        // several days one after another, each under its date: only today's part (and what stands outside the day parts, such as the Jumu'ah times)
        val DATE = Regex("\\b($MON)[a-z]*\\.?\\s+(\\d{1,2})\\b|\\b(\\d{1,2})\\s+($MON)[a-z]*\\b", RegexOption.IGNORE_CASE)
        val heads = text.withIndex().filter { (_, l) -> l.length <= 70 && DATE.containsMatchIn(l) && !TIME.containsMatchIn(l) && KEYS.none { (_, re) -> re.containsMatchIn(l) } }.map { it.index }
        var other = emptySet<Int>()     // the lines of the other days
        if (heads.size >= 2) {
            fun dayOf(i: Int): Int? = DATE.find(text[i])?.let { m -> if (m.groupValues[1].isNotEmpty()) mon(m.groupValues[1]) * 100 + m.groupValues[2].toInt() else mon(m.groupValues[4]) * 100 + m.groupValues[3].toInt() }
            val doy = today.monthValue * 100 + today.dayOfMonth
            val mine = heads.firstOrNull { dayOf(it) == doy }
            if (mine != null) other = heads.filter { it != mine }.flatMap { h -> (h until (heads.firstOrNull { it > h } ?: text.size)) }.toSet()
        }
        val iq = linkedMapOf<String, Int>()
        val jum = mutableListOf<Int>()
        var after = 0
        for ((li, line) in text.withIndex()) {
            val otherDay = li in other
            if (!otherDay) Regex("sunset\\s*\\+\\s*(\\d{1,2})\\s*min", RegexOption.IGNORE_CASE).find(line)?.let { if (Regex("maghrib|magrib", RegexOption.IGNORE_CASE).containsMatchIn(line)) { after = it.groupValues[1].toInt(); sunset = true } }
            if (!otherDay) Regex("(\\d{1,2})\\s*min\\w*\\.?\\s+after\\s+(?:the\\s+)?(?:sunset|adhan|azan|athan|maghrib)", RegexOption.IGNORE_CASE).find(line)?.let { if (Regex("maghrib", RegexOption.IGNORE_CASE).containsMatchIn(line)) { after = it.groupValues[1].toInt(); sunset = true } }
            // the places in the line where a prayer's name stands; the text up to the next name belongs to it
            val hits = KEYS.flatMap { (k, re) -> re.findAll(line).map { Triple(it.range.first, it.range.last + 1, k) }.toList() }.sortedBy { it.first }
            for ((i, h) in hits.withIndex()) {
                if (h.third == "SUNRISE" || (otherDay && h.third != "JUM")) continue
                val end = hits.getOrNull(i + 1)?.first ?: line.length
                val seg = line.substring(h.second, end)
                val t = TIME.findAll(seg).toList()
                if (t.isEmpty()) { if (h.third == "MAGHRIB" && Regex("sunset|ghurub|ghuroob|adhan|azan|athan|immediately|after the sun", RegexOption.IGNORE_CASE).containsMatchIn(seg)) sunset = true; continue }
                // the name must be followed closely by its first time (otherwise it is a sentence)
                if (t.first().range.first > 40) continue
                val ms = t.mapNotNull { minutes(h.third, it.groupValues[1].toInt(), it.groupValues[2], it.groupValues[3].toInt(), it.groupValues[4].ifEmpty { null }) }
                if (ms.isEmpty()) continue
                if (h.third == "JUM") {
                    // «1st Iqamah 1:45, 2nd Iqamah 2:30»: every time is a prayer; in a row of a table the last time is the iqamah
                    val many = Regex("iqama|1st|2nd|3rd|first|second|third", RegexOption.IGNORE_CASE).findAll(seg).count() >= 2
                    if (many) jum += ms else jum += ms.last()
                    continue
                }
                if (h.third in iq) continue
                if (cols != null && ms.size == cols.second) { iq[h.third] = ms[cols.first]; continue }
                if (ms.size >= 2) iq[h.third] = ms.last() else if (onlyIqamah) iq[h.third] = ms.first()
            }
        }
        // the page may draw each name and each time in a box of its own (a name on one line, its times on the next lines)
        if (iq.size < 3) {
            val tIq = linkedMapOf<String, Int>(); val tJum = mutableListOf<Int>()
            for ((i, raw) in text.withIndex()) {
                val ln = raw.trim(' ', '|', ':')
                if (ln.length > 18 || TIME.containsMatchIn(ln)) continue
                val key = KEYS.firstOrNull { (_, re) -> re.containsMatchIn(ln) }?.first ?: continue
                if (key == "SUNRISE") continue
                val ms = mutableListOf<Int>()
                var j = i + 1
                while (j < text.size && j <= i + 8) {
                    val l2 = text[j].trim(' ', '|')
                    val ts = TIME.findAll(l2).toList()
                    if (ts.isNotEmpty() && TIME.replace(l2, "").length <= 12) {
                        ts.mapNotNull { minutes(key, it.groupValues[1].toInt(), it.groupValues[2], it.groupValues[3].toInt(), it.groupValues[4].ifEmpty { null }) }.let { ms += it }
                    } else if (!(ts.isEmpty() && l2.length <= 14 && !l2.any { it.isDigit() } && KEYS.none { (_, re) -> re.containsMatchIn(l2) })) break
                    j++
                }
                if (ms.isEmpty()) continue
                if (key == "JUM") { tJum += ms.last(); continue }
                if (key in tIq) continue
                if (ms.size >= 2) tIq[key] = ms.last() else if (onlyIqamah) tIq[key] = ms.first()
            }
            if (tIq.size >= 3) { iq.clear(); iq.putAll(tIq); jum.clear(); jum += tJum }
        }
        return Times(iq, jum.distinct().sorted().take(3), sunset && "MAGHRIB" !in iq, after)
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

    /** the pages of the same site that a page links to as «prayer times» / «iqamah» / «timetable» */
    fun prayerLinks(html: String, start: String): List<String> {
        val host = runCatching { URI(start).host }.getOrNull()
        return Regex("href\\s*=\\s*[\"']([^\"'#]+)[\"']", RegexOption.IGNORE_CASE).findAll(html).map { it.groupValues[1] }
            .filter { Regex("prayer|salah|salat|namaz|timing|timetable|iqamah|iqama|schedule", RegexOption.IGNORE_CASE).containsMatchIn(it) }
            .mapNotNull { runCatching { URI(start).resolve(it.replace(" ", "%20")).toString() }.getOrNull() }
            .filter { runCatching { URI(it).host }.getOrNull() == host && !it.endsWith(".pdf", true) && !it.contains(Regex("\\.(jpg|png|css|js)$", RegexOption.IGNORE_CASE)) }
            .distinct().take(3).toList()
    }

    /** the times from a masjid's page; if its first page has none, the pages it links to as «prayer times» / «iqamah» / «timetable» */
    fun fetch(site: String, mustMention: List<String> = emptyList()): Times? {
        val start = site.trim().let { if (it.startsWith("http")) it else "https://$it" }
        val html = runCatching { get(start) }.getOrNull() ?: return null
        // a page found by a web search must be about this masjid: its name (or a distinctive word of it) is on the page
        if (mustMention.isNotEmpty() && !mustMention.any { html.contains(it, ignoreCase = true) }) return null
        var best = parse(html)
        if (best.iq.size >= 3) return best
        val links = prayerLinks(html, start)
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

    /** the distinctive words of a masjid's name («Makki Masjid» → «makki»): not the common words such as masjid, islamic, centre */
    fun nameWords(name: String): List<String> = name.lowercase().split(Regex("[^\\p{L}]+"))
        .filter { it.length >= 4 && it !in setOf("masjid", "mosque", "masjed", "islamic", "islam", "center", "centre", "association", "society", "community", "jame", "jamia", "jamea", "trust", "foundation", "muslim", "muslims", "canada", "toronto", "ontario", "brampton", "mississauga", "centr") }

    private val SKIP = Regex("masjidnow|prayersconnect|mosquefinder|salahtimes|prayertimes|timesprayer|praytimes|namaz|athan|azan|muslimpro|prayerhub|aladhan|timeanddate|facebook|instagram|twitter|x\\.com|youtube|yelp|google|wikipedia|tripadvisor|mapquest|bing|linkedin|pinterest|tiktok|salatomatic|islamicfinder|muslimpro|waze|foursquare|yellowpages|maps\\.apple", RegexOption.IGNORE_CASE)

    /** the masjid's own website and its times: the first results of a web search are tried one after another */
    fun viaWeb(name: String, city: String): Pair<String, MosqueSite.Times>? {
        val q = java.net.URLEncoder.encode("$name $city prayer times iqamah", "UTF-8")
        val html = httpGet("https://html.duckduckgo.com/html/?q=$q", 15_000) ?: return null
        val words = MosqueSite.nameWords(name)
        val urls = Regex("uddg=([^&\"']+)").findAll(html).map { runCatching { java.net.URLDecoder.decode(it.groupValues[1], "UTF-8") }.getOrDefault("") }
            .filter { it.startsWith("http") && !SKIP.containsMatchIn(runCatching { URI(it).host }.getOrNull() ?: "") }
            .distinctBy { runCatching { URI(it).host }.getOrNull() }.toList()
            // a site whose address has a word of the masjid's name is tried first
            .sortedBy { u -> if (words.any { (runCatching { URI(u).host }.getOrNull() ?: "").contains(it) }) 0 else 1 }.take(5)
        var best: Pair<String, MosqueSite.Times>? = null
        for (u in urls) {
            val t = runCatching { MosqueSite.fetch(u, words) }.getOrNull() ?: continue
            if (best == null || t.found > best.second.found) best = u to t
            if (t.iq.size >= 4) break
        }
        return best?.takeIf { it.second.found >= 3 }
    }
}
