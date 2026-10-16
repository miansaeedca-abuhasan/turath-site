package org.turath.salat

import android.content.Context
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
    data class M(val id: String, val name: String, val lat: Double, val lng: Double, val km: Double, var address: String)

    private val DENOM = Regex("shia|shi'a|shiite|twelver|ithna|ismaili|isma'ili|nizari|dawoodi|bohra|bohora|ahmadi|qadiani|lahori|alawi|alevi|druze|nation_of_islam|zaidi", RegexOption.IGNORE_CASE)
    private val NAME = Regex(
        "ahmadi|ahmadiyy|qadian|lahore ahmad|baitul hamd|bait-ul-hamd|baitul islam|bait-ul-islam|baitul futuh|baitul rehman|baitul rahman|baitul nasr|baitul ahad|" +
            "baitul huda|baitul zafar|baitul mahdi|baitul mujeeb|baitul ikram|baitul afiyat|baitul aafiyat|baitul ehsan|baitul muqeet|baitul tauheed|baitul baseer|" +
            "baitul hadi|baitul naseer|baitul wahid|baitul atta|baitul shukur|baitul bashir|baitul nur|mahmood mosque|fazl mosque|nasir mosque|bohra|bohri|dawoodi|dawat-e-hadiyah|ismaili|jamatkhana|jamat khana|jamaat khana|aga khan|" +
            "imambargah|imambara|imam bargah|imam-bargah|husainiya|hussainiya|husseiniya|hosseinieh|hussaini|husayniyya|hussainia|" +
            "shia|shi'a|shiite|ja'?fari|jafaria|zainabia|zaynabiyya|abbas centre|al-?mahdi|ahlul?\\s?bayt|ahl ul bayt|mahfil-e-|" +
            "احمدی|احمدیہ|أحمدي|الأحمدية|قادیان|قاديان|بوہر|بهرة|بوهرة|اسماعیلی|إسماعيلي|جماعت خانہ|امام ?بارگاہ|امامباڑہ|حسینیہ|حسينية|شیعہ|شيعة|جعفری|جعفرية|زینبیہ|زينبية",
        RegexOption.IGNORE_CASE)

    private fun hiddenSet(pr: Prefs) = pr.sp.getStringSet("mosqueHide", emptySet())!!
    fun hide(pr: Prefs, id: String) = pr.sp.edit().putStringSet("mosqueHide", hiddenSet(pr) + id).apply()

    /** the mosques within `km` kilometres, nearest first (blocking: call off the main thread) */
    /** a real answer: has elements and no «runtime error» remark (Overpass answers a timeout with an empty list) */
    private fun good(s: String) = s.contains("\"elements\"") && !Regex("\"remark\"\\s*:\\s*\"[^\"]*(error|timed out|timeout)", RegexOption.IGNORE_CASE).containsMatchIn(s) &&
        !Regex("\"elements\"\\s*:\\s*\\[\\s*\\]").containsMatchIn(s)

    fun find(ctx: Context, lat: Double, lng: Double, km: Int): List<M> {
        val pr = Prefs(ctx)
        // one request for 50 km around the place (kept for a day); a smaller circle is taken from it at once
        val key = "mq4_%.3f_%.3f".format(lat, lng)
        val cached = pr.sp.getString(key, null)?.takeIf { pr.sp.getLong(key + "_t", 0) > System.currentTimeMillis() - 86_400_000 }
        val json = cached ?: run {
            // a box of about 50 km each way (much quicker for the server than a circle); the circle is drawn here
            // the box centre on a 0.05° grid, so that nearby phones ask for the same box (kept a week on the site)
            val cLat = Math.round(lat * 20) / 20.0; val cLng = Math.round(lng * 20) / 20.0
            val dLat = 0.5; val dLng = 0.5 / kotlin.math.cos(Math.toRadians(lat)).coerceAtLeast(0.2)
            val bb = "%.2f,%.2f,%.2f,%.2f".format(Locale.US, cLat - dLat, cLng - dLng, cLat + dLat, cLng + dLng)
            // mosques and musallas, and Islamic centres (often mapped as a community centre, an office of the religion or only by their name)
            val q = "[out:json][timeout:60];(nwr[\"amenity\"=\"place_of_worship\"][\"religion\"=\"muslim\"]($bb);nwr[\"religion\"=\"muslim\"][\"amenity\"]($bb);" +
                "nwr[\"religion\"=\"muslim\"][\"office\"]($bb);nwr[\"building\"=\"mosque\"]($bb);nwr[\"amenity\"~\"community_centre|social_centre|place_of_worship\"][\"name\"~\"islam|muslim|masjid|mosque|musall\",i]($bb););out center tags;"
            // the site first (it keeps the answer a week), then the main Overpass server and its mirrors
            var s = runCatching {
                val c = URL("https://turathkhairalquroon.com/api/mosques?v=4&bb=$bb").openConnection() as HttpURLConnection
                c.connectTimeout = 8_000; c.readTimeout = 15_000
                c.setRequestProperty("User-Agent", "SalatKhairAlQuroon/1.0")
                if (c.responseCode == 200) c.inputStream.bufferedReader().readText() else ""
            }.getOrDefault("")
            if (!good(s)) for (u in listOf("https://overpass-api.de/api/interpreter", "https://overpass.private.coffee/api/interpreter", "https://overpass.kumi.systems/api/interpreter", "https://maps.mail.ru/osm/tools/overpass/api/interpreter")) {
                s = runCatching {
                    val c = URL(u).openConnection() as HttpURLConnection
                    c.requestMethod = "POST"; c.doOutput = true; c.connectTimeout = 8_000; c.readTimeout = 25_000
                    c.setRequestProperty("User-Agent", "SalatKhairAlQuroon/1.0 (https://turathkhairalquroon.com)")
                    c.outputStream.use { it.write(("data=" + URLEncoder.encode(q, "UTF-8")).toByteArray()) }
                    if (c.responseCode == 200) c.inputStream.bufferedReader().readText() else ""
                }.getOrDefault("")
                if (good(s)) break
            }
            // the map servers busy: OpenStreetMap's own search (Nominatim) for mosques in the same box
            if (!good(s)) s = photon(lat, lng)
            if (!good(s)) s = nominatim(cLat - dLat, cLng - dLng, cLat + dLat, cLng + dLng)
            if (!s.contains("\"elements\"")) throw java.io.IOException("no answer")
            pr.sp.edit().putString(key, s).putLong(key + "_t", System.currentTimeMillis()).apply()
            s
        }
        val hidden = hiddenSet(pr)
        val els: JSONArray = JSONObject(json).optJSONArray("elements") ?: JSONArray()
        val out = mutableListOf<M>()
        for (i in 0 until els.length()) {
            val e = els.getJSONObject(i)
            val t = e.optJSONObject("tags") ?: continue
            val id = e.optString("type") + "/" + e.optLong("id")
            if (id in hidden) continue
            if (DENOM.containsMatchIn(t.optString("denomination") + " " + t.optString("religious_affiliation"))) continue
            val text = listOf("name", "name:en", "name:ar", "name:ur", "official_name", "alt_name", "operator", "description", "website")
                .joinToString(" ") { t.optString(it) }
            if (NAME.containsMatchIn(text)) continue
            // only places to pray: mosques, musallas, Islamic centres (not a Muslim graveyard, school, shop …)
            val am = t.optString("amenity")
            val isPlace = am == "place_of_worship" || am in setOf("community_centre", "social_centre", "social_facility") || t.optString("building") == "mosque" ||
                t.has("office") || Regex("masjid|mosque|musall|islamic cent|مسجد|جامع|مصلى", RegexOption.IGNORE_CASE).containsMatchIn(t.optString("name"))
            if (!isPlace) continue
            val la = if (e.has("lat")) e.getDouble("lat") else e.optJSONObject("center")?.optDouble("lat") ?: continue
            val lo = if (e.has("lon")) e.getDouble("lon") else e.optJSONObject("center")?.optDouble("lon") ?: continue
            val lang = Tr.lang
            val name = t.optString("name:$lang").ifEmpty { t.optString("name") }.ifEmpty { if (lang == "en") "Mosque / musalla" else if (lang == "ar") "مسجد / مصلى" else "مسجد / مصلیٰ" }
            val addr = listOf(listOf(t.optString("addr:housenumber"), t.optString("addr:street")).filter { it.isNotEmpty() }.joinToString(" "),
                t.optString("addr:city"), t.optString("addr:province").ifEmpty { t.optString("addr:state") }, t.optString("addr:postcode"))
                .filter { it.isNotEmpty() }.joinToString(", ")
            out += M(id, name, la, lo, Cities.dist(lat, lng, la, lo), addr)
        }
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
