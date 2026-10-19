package org.turath.salat

import android.content.Context
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withTimeoutOrNull
import android.location.LocationManager
import android.os.Build
import kotlin.coroutines.resume
import android.location.Geocoder
import org.json.JSONArray
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import java.util.Locale

/**
 * Mosques and musallas around a place, from OpenStreetMap (Overpass API): places of worship of Muslims.
 * Not listed: Ahmadi / Qadiani, Bohra, Shia (Ismaili, Twelver …) and similar centres — by their OpenStreetMap
 * denomination and by words in their names; a mosque the user hides is not listed again.
 */
object Mosques {
    data class M(val id: String, val name: String, val lat: Double, val lng: Double, val km: Double, var address: String, val sunni: Boolean = false)

    private val DENOM = Regex("shia|shi'a|shiite|twelver|ithna|ismaili|isma'ili|nizari|dawoodi|bohra|bohora|ahmadi|qadiani|lahori|alawi|alevi|druze|nation_of_islam|zaidi", RegexOption.IGNORE_CASE)
    private val NAME = Regex(
        "ahmadi|ahmadiyy|qadian|lahore ahmad|baitul hamd|bait-ul-hamd|baitul islam|bait-ul-islam|baitul futuh|baitul rehman|baitul rahman|baitul nasr|baitul ahad|" +
            "baitul huda|baitul zafar|baitul mahdi|baitul mujeeb|baitul ikram|baitul afiyat|baitul aafiyat|baitul ehsan|baitul muqeet|baitul tauheed|baitul baseer|" +
            "baitul hadi|baitul naseer|baitul wahid|baitul atta|baitul shukur|baitul bashir|baitul nur|mahmood mosque|fazl mosque|nasir mosque|bohra|bohri|dawoodi|dawat-e-hadiyah|ismaili|jamatkhana|jamat khana|jamaat khana|aga khan|" +
            "imambargah|imambara|imam bargah|imam-bargah|husainiya|hussainiya|husseiniya|hosseinieh|hussaini|husayniyya|hussainia|" +
            "shia|shi'a|shiite|ja'?fari|jafaria|zainabia|zaynabiyya|abbas centre|al-?mahdi|ahlul?\\s?bayt|ahl ul bayt|mahfil-e-|" +
            "احمدی|احمدیہ|أحمدي|الأحمدية|قادیان|قاديان|بوہر|بهرة|بوهرة|اسماعیلی|إسماعيلي|جماعت خانہ|امام ?بارگاہ|امامباڑہ|حسینیہ|حسينية|شیعہ|شيعة|جعفری|جعفرية|زینبیہ|زينبية",
        RegexOption.IGNORE_CASE)

    private val SUNNI = Regex("sunni|hanafi|shafi|maliki|hanbali|hanbal|salafi|ahl|deoband|athari", RegexOption.IGNORE_CASE)
    suspend fun here(ctx: Context, fallback: Place?): Pair<Double, Double>? {
        val act = ctx.getSystemService(Context.LOCATION_SERVICE) as LocationManager
        val ok = ctx.checkSelfPermission(android.Manifest.permission.ACCESS_COARSE_LOCATION) == android.content.pm.PackageManager.PERMISSION_GRANTED
        if (ok) {
            val last = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER)
                .mapNotNull { runCatching { act.getLastKnownLocation(it) }.getOrNull() }.maxByOrNull { it.time }
            if (last != null && System.currentTimeMillis() - last.time < 10 * 60_000) return last.latitude to last.longitude
            if (Build.VERSION.SDK_INT >= 30) {
                val prov = listOf(LocationManager.NETWORK_PROVIDER, LocationManager.GPS_PROVIDER).firstOrNull { runCatching { act.isProviderEnabled(it) }.getOrDefault(false) }
                if (prov != null) {
                    val l = withTimeoutOrNull(8000) {
                        suspendCancellableCoroutine<android.location.Location?> { c -> runCatching { act.getCurrentLocation(prov, null, ctx.mainExecutor) { c.resume(it) } }.onFailure { c.resume(null) } }
                    }
                    if (l != null) return l.latitude to l.longitude
                }
            }
            if (last != null) return last.latitude to last.longitude
        }
        return fallback?.let { it.lat to it.lng }
    }

    private fun hiddenSet(pr: Prefs) = pr.sp.getStringSet("mosqueHide", emptySet())!!
    fun hide(pr: Prefs, id: String) = pr.sp.edit().putStringSet("mosqueHide", hiddenSet(pr) + id).apply()

    /** the mosques within `km` kilometres, nearest first (blocking: call off the main thread) */
    /** a real answer: has elements and no «runtime error» remark (Overpass answers a timeout with an empty list) */
    private fun good(s: String) = s.contains("\"elements\"") && !Regex("\"remark\"\\s*:\\s*\"[^\"]*(error|timed out|timeout)", RegexOption.IGNORE_CASE).containsMatchIn(s) &&
        !Regex("\"elements\"\\s*:\\s*\\[\\s*\\]").containsMatchIn(s)

    /** where the last list came from (shown small under the list, to help to find a problem) */
    @Volatile var info = ""
    /** names of the places left out because of their group (shown, so that a wrong one can be found) */
    @Volatile var skipped: List<String> = emptyList()

    private fun count(s: String) = if (good(s)) runCatching { JSONObject(s).getJSONArray("elements").length() }.getOrDefault(0) else 0

    private fun merge(a: String, b: String): String {
        val out = JSONArray(); val seen = HashSet<String>()
        for (x in listOf(a, b)) {
            if (!good(x)) continue
            val arr = runCatching { JSONObject(x).getJSONArray("elements") }.getOrNull() ?: continue
            for (i in 0 until arr.length()) { val e = arr.getJSONObject(i); if (seen.add(e.optString("type") + e.optLong("id"))) out.put(e) }
        }
        return if (out.length() > 0) JSONObject().put("elements", out).toString() else ""
    }

    fun find(ctx: Context, lat: Double, lng: Double, km: Int): List<M> {
        val pr = Prefs(ctx)
        // one request for 50 km around the place (kept for a day); a smaller circle is taken from it at once
        val big = km > 50
        val key = (if (big) "mq7b_" else "mq7_") + "%.3f_%.3f".format(lat, lng)
        val cached = pr.sp.getString(key, null)?.takeIf { pr.sp.getLong(key + "_t", 0) > System.currentTimeMillis() - 86_400_000 }
        val json = cached ?: run {
            // a box of about 50 km each way (much quicker for the server than a circle); the circle is drawn here
            // the box centre on a 0.05° grid, so that nearby phones ask for the same box (kept a week on the site)
            val cLat = Math.round(lat * 20) / 20.0; val cLng = Math.round(lng * 20) / 20.0
            val half = if (big) 1.0 else 0.5
            val dLat = half; val dLng = half / kotlin.math.cos(Math.toRadians(lat)).coerceAtLeast(0.2)
            val bb = "%.2f,%.2f,%.2f,%.2f".format(Locale.US, cLat - dLat, cLng - dLng, cLat + dLat, cLng + dLng)
            // A: places tagged as a mosque / prayer room (quick for the server). B: places only named like one (slow, so asked on its own)
            val nm = "masjid|mosque|musall|musolla|islamic|muslim|jamia|jamiah|jami |markaz|prayer room|prayer hall|prayer space|salah"
            val qa = "[out:json][timeout:40];(nwr[\"amenity\"=\"place_of_worship\"][\"religion\"=\"muslim\"]($bb);nwr[\"religion\"=\"muslim\"][\"amenity\"]($bb);" +
                "nwr[\"religion\"=\"muslim\"][\"office\"]($bb);nwr[\"building\"=\"mosque\"]($bb);nwr[\"amenity\"=\"prayer_room\"]($bb);nwr[\"room\"=\"prayer\"]($bb););out center tags;"
            val qb = "[out:json][timeout:55];(nwr[\"amenity\"~\"community_centre|social_centre|place_of_worship|events_venue\"][\"name\"~\"$nm\",i]($bb);" +
                "nwr[\"name\"~\"masjid|mosque|musall|musolla|islamic cent|islamic assoc|muslim assoc|markaz|prayer room|prayer hall|prayer space|salah room|مصلى|مسجد\",i]($bb););out center tags;"
            fun ask(u: String, q: String, ms: Int): String = runCatching {
                val c = URL(u).openConnection() as HttpURLConnection
                c.requestMethod = "POST"; c.doOutput = true; c.connectTimeout = 8_000; c.readTimeout = ms
                c.setRequestProperty("User-Agent", "SalatKhairAlQuroon/1.0 (https://turathkhairalquroon.com)")
                c.outputStream.use { it.write(("data=" + URLEncoder.encode(q, "UTF-8")).toByteArray()) }
                if (c.responseCode == 200) c.inputStream.bufferedReader().readText() else ""
            }.getOrDefault("")
            val urls = listOf("https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter")
            // all the servers at once; the first good answer wins
            fun race(q: String, ms: Int): String {
                val pool = java.util.concurrent.Executors.newFixedThreadPool(urls.size)
                val ecs = java.util.concurrent.ExecutorCompletionService<String>(pool)
                try {
                    urls.forEach { u -> ecs.submit(java.util.concurrent.Callable<String> { ask(u, q, ms) }) }
                    for (i in urls.indices) { val r = runCatching { ecs.take().get() }.getOrDefault(""); if (good(r)) return r }
                } finally { pool.shutdownNow() }
                return ""
            }
            var ra = ""; var rb = ""
            val ta = Thread { ra = race(qa, 45_000) }; val tb = Thread { rb = race(qb, 65_000) }
            ta.start(); tb.start(); ta.join(); tb.join()
            val na = count(ra); val nb = count(rb)
            var s = merge(ra, rb)
            var src = "OpenStreetMap A$na B$nb"
            // the site's copy, then the map search of Photon and Nominatim (only when the servers gave nothing)
            if (!good(s)) { s = runCatching {
                val c = URL("https://turathkhairalquroon.com/api/mosques?v=4&bb=$bb").openConnection() as HttpURLConnection
                c.connectTimeout = 8_000; c.readTimeout = 15_000
                c.setRequestProperty("User-Agent", "SalatKhairAlQuroon/1.0")
                if (c.responseCode == 200) c.inputStream.bufferedReader().readText() else ""
            }.getOrDefault(""); src = "site" }
            if (!good(s)) { s = photon(lat, lng); src = "Photon" }
            if (!good(s)) { s = nominatim(cLat - dLat, cLng - dLng, cLat + dLat, cLng + dLng); src = "Nominatim" }
            if (!s.contains("\"elements\"")) throw java.io.IOException("no answer")
            info = src
            pr.sp.edit().putString(key, s).putString(key + "_i", src).putLong(key + "_t", System.currentTimeMillis()).apply()
            s
        }
        if (cached != null) info = pr.sp.getString(key + "_i", "") ?: ""
        val hidden = hiddenSet(pr)
        val els: JSONArray = JSONObject(json).optJSONArray("elements") ?: JSONArray()
        val out = mutableListOf<M>()
        val skip = mutableListOf<String>()
        for (i in 0 until els.length()) {
            val e = els.getJSONObject(i)
            val t = e.optJSONObject("tags") ?: continue
            val id = e.optString("type") + "/" + e.optLong("id")
            if (id in hidden) continue
            if (DENOM.containsMatchIn(t.optString("denomination") + " " + t.optString("religious_affiliation"))) { skip += t.optString("name").ifEmpty { id }; continue }
            val text = listOf("name", "name:en", "name:ar", "name:ur", "official_name", "alt_name", "operator", "description", "website")
                .joinToString(" ") { t.optString(it) }
            if (NAME.containsMatchIn(text)) { skip += t.optString("name").ifEmpty { id }; continue }
            // only places to pray: mosques, musallas, Islamic centres (not a Muslim graveyard, school, shop …)
            val am = t.optString("amenity")
            val rel = t.optString("religion")
            val notPlace = t.has("shop") || t.has("cuisine") || am in setOf("restaurant", "cafe", "fast_food", "food_court", "pharmacy", "bank", "school", "college", "university", "kindergarten", "doctors", "clinic", "dentist", "library", "car_wash", "parking") ||
                (rel.isNotEmpty() && rel != "muslim")
            val isPlace = !notPlace && (am == "place_of_worship" || am == "prayer_room" || t.optString("room") == "prayer" || am in setOf("community_centre", "social_centre", "social_facility") || t.optString("building") == "mosque" ||
                t.has("office") || Regex("masjid|mosque|musall|musolla|islamic|muslim|jamia|markaz|prayer (room|hall|space)|مسجد|جامع|مصلى", RegexOption.IGNORE_CASE).containsMatchIn(t.optString("name")))
            if (!isPlace) continue
            val la = if (e.has("lat")) e.getDouble("lat") else e.optJSONObject("center")?.optDouble("lat") ?: continue
            val lo = if (e.has("lon")) e.getDouble("lon") else e.optJSONObject("center")?.optDouble("lon") ?: continue
            val lang = Tr.lang
            val name = t.optString("name:$lang").ifEmpty { t.optString("name") }.ifEmpty { if (lang == "en") "Mosque / musalla" else if (lang == "ar") "مسجد / مصلى" else "مسجد / مصلیٰ" }
            val addr = listOf(listOf(t.optString("addr:housenumber"), t.optString("addr:street")).filter { it.isNotEmpty() }.joinToString(" "),
                t.optString("addr:city"), t.optString("addr:province").ifEmpty { t.optString("addr:state") }, t.optString("addr:postcode"))
                .filter { it.isNotEmpty() }.joinToString(", ")
            out += M(id, name, la, lo, Cities.dist(lat, lng, la, lo), addr, SUNNI.containsMatchIn(t.optString("denomination") + " " + t.optString("religious_affiliation")))
        }
        skipped = skip.distinct()
        return out.filter { it.km <= km + 0.5 }.sortedBy { it.km }
    }

    /** mosques from Photon (komoot, OpenStreetMap data) around a point, in the shape of an Overpass answer */
    private fun photon(lat: Double, lng: Double): String {
        val els = JSONArray(); val seen = HashSet<String>()
        for (q in listOf("mosque", "masjid", "islamic center", "musalla")) {
            val txt = runCatching {
                val u = "https://photon.komoot.io/api/?limit=50&osm_tag=amenity:place_of_worship&q=" + URLEncoder.encode(q, "UTF-8") + "&lat=%.5f&lon=%.5f".format(Locale.US, lat, lng)
                val c = URL(u).openConnection() as HttpURLConnection
                c.connectTimeout = 10_000; c.readTimeout = 25_000
                c.setRequestProperty("User-Agent", "SalatKhairAlQuroon/1.0 (turathkhairalquroon@gmail.com)")
                if (c.responseCode == 200) c.inputStream.bufferedReader().readText() else ""
            }.getOrDefault("")
            if (!txt.startsWith("{")) continue
            val fs = JSONObject(txt).optJSONArray("features") ?: continue
            for (i in 0 until fs.length()) {
                val f = fs.getJSONObject(i); val pp = f.optJSONObject("properties") ?: continue
                val co = f.optJSONObject("geometry")?.optJSONArray("coordinates") ?: continue
                val id = pp.optString("osm_type").let { when (it) { "N" -> "node"; "W" -> "way"; "R" -> "relation"; else -> it } } + "/" + pp.optLong("osm_id")
                if (!seen.add(id)) continue
                val name = pp.optString("name")
                // a church, temple … found by the word: only names that look like a mosque or an Islamic centre
                if (!Regex("mosque|masjid|masjed|musall|islam|muslim|jami|مسجد|جامع|مصلى", RegexOption.IGNORE_CASE).containsMatchIn(name)) continue
                val tags = JSONObject().put("name", name).put("amenity", "place_of_worship")
                listOf("housenumber" to "addr:housenumber", "street" to "addr:street", "city" to "addr:city", "state" to "addr:state", "postcode" to "addr:postcode")
                    .forEach { (a, b) -> pp.optString(a).takeIf { it.isNotEmpty() }?.let { tags.put(b, it) } }
                els.put(JSONObject().put("type", id.substringBefore('/')).put("id", pp.optLong("osm_id")).put("lat", co.getDouble(1)).put("lon", co.getDouble(0)).put("tags", tags))
            }
        }
        return if (els.length() > 0) JSONObject().put("elements", els).toString() else ""
    }

    /** mosques from Nominatim, given back in the shape of an Overpass answer */
    private fun nominatim(s: Double, w: Double, n: Double, e: Double): String {
        val els = JSONArray(); val seen = HashSet<String>()
        for (q in listOf("mosque", "masjid", "musalla", "islamic centre")) {
            val txt = runCatching {
                val u = "https://nominatim.openstreetmap.org/search?format=jsonv2&limit=50&bounded=1&extratags=1&namedetails=1&q=" + URLEncoder.encode(q, "UTF-8") +
                    "&viewbox=%.4f,%.4f,%.4f,%.4f".format(Locale.US, w, n, e, s)
                val c = URL(u).openConnection() as HttpURLConnection
                c.connectTimeout = 10_000; c.readTimeout = 30_000
                c.setRequestProperty("User-Agent", "SalatKhairAlQuroon/1.0 (turathkhairalquroon@gmail.com)")
                if (c.responseCode == 200) c.inputStream.bufferedReader().readText() else ""
            }.getOrDefault("")
            if (!txt.startsWith("[")) continue
            val a = JSONArray(txt)
            for (i in 0 until a.length()) {
                val o = a.getJSONObject(i)
                val ex = o.optJSONObject("extratags") ?: JSONObject()
                val worship = o.optString("category") == "amenity" && o.optString("type") == "place_of_worship"
                if (!worship && ex.optString("religion") != "muslim") continue
                if (ex.has("religion") && ex.optString("religion") != "muslim") continue
                val id = o.optString("osm_type") + "/" + o.optLong("osm_id")
                if (!seen.add(id)) continue
                val tags = JSONObject(ex.toString())
                o.optJSONObject("namedetails")?.let { nd -> nd.keys().forEach { k -> tags.put(k, nd.optString(k)) } }
                if (!tags.has("name")) tags.put("name", o.optString("name"))
                if (worship) tags.put("amenity", "place_of_worship")
                els.put(JSONObject().put("type", o.optString("osm_type")).put("id", o.optLong("osm_id"))
                    .put("lat", o.optString("lat").toDoubleOrNull() ?: continue).put("lon", o.optString("lon").toDoubleOrNull() ?: continue).put("tags", tags))
            }
            Thread.sleep(1100)          // Nominatim: one request a second
        }
        return if (els.length() > 0) JSONObject().put("elements", els).toString() else ""
    }

    /** the street address of a mosque without one in OpenStreetMap: the phone's own geocoder */
    @Suppress("DEPRECATION")
    fun address(ctx: Context, m: M): String {
        if (m.address.isNotEmpty()) return m.address
        return runCatching {
            Geocoder(ctx, Locale.getDefault()).getFromLocation(m.lat, m.lng, 1)?.firstOrNull()?.getAddressLine(0)
        }.getOrNull() ?: "%.5f, %.5f".format(m.lat, m.lng)
    }
}
