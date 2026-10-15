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
        "ahmadi|ahmadiyy|qadian|lahore ahmad|bohra|bohri|dawoodi|dawat-e-hadiyah|ismaili|jamatkhana|jamat khana|jamaat khana|aga khan|" +
            "imambargah|imambara|imam bargah|imam-bargah|husainiya|hussainiya|husseiniya|hosseinieh|hussaini|husayniyya|hussainia|" +
            "shia|shi'a|shiite|ja'?fari|jafaria|zainabia|zaynabiyya|abbas centre|al-?mahdi|ahlul?\\s?bayt|ahl ul bayt|mahfil-e-|" +
            "احمدی|احمدیہ|أحمدي|الأحمدية|قادیان|قاديان|بوہر|بهرة|بوهرة|اسماعیلی|إسماعيلي|جماعت خانہ|امام ?بارگاہ|امامباڑہ|حسینیہ|حسينية|شیعہ|شيعة|جعفری|جعفرية|زینبیہ|زينبية",
        RegexOption.IGNORE_CASE)

    private fun hiddenSet(pr: Prefs) = pr.sp.getStringSet("mosqueHide", emptySet())!!
    fun hide(pr: Prefs, id: String) = pr.sp.edit().putStringSet("mosqueHide", hiddenSet(pr) + id).apply()

    /** the mosques within `km` kilometres, nearest first (blocking: call off the main thread) */
    fun find(ctx: Context, lat: Double, lng: Double, km: Int): List<M> {
        val pr = Prefs(ctx)
        val key = "mq_%.3f_%.3f_%d".format(lat, lng, km)
        val cached = pr.sp.getString(key, null)?.takeIf { pr.sp.getLong(key + "_t", 0) > System.currentTimeMillis() - 86_400_000 }
        val json = cached ?: run {
            val q = "[out:json][timeout:25];nwr[\"amenity\"=\"place_of_worship\"][\"religion\"=\"muslim\"](around:${km * 1000},$lat,$lng);out center tags;"
            val c = URL("https://overpass-api.de/api/interpreter").openConnection() as HttpURLConnection
            c.requestMethod = "POST"; c.doOutput = true; c.connectTimeout = 20_000; c.readTimeout = 40_000
            c.setRequestProperty("User-Agent", "SalatKhairAlQuroon/1.0 (https://turathkhairalquroon.com)")
            c.outputStream.use { it.write(("data=" + URLEncoder.encode(q, "UTF-8")).toByteArray()) }
            val s = c.inputStream.bufferedReader().readText()
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

    /** the street address of a mosque without one in OpenStreetMap: the phone's own geocoder */
    @Suppress("DEPRECATION")
    fun address(ctx: Context, m: M): String {
        if (m.address.isNotEmpty()) return m.address
        return runCatching {
            Geocoder(ctx, Locale.getDefault()).getFromLocation(m.lat, m.lng, 1)?.firstOrNull()?.getAddressLine(0)
        }.getOrNull() ?: "%.5f, %.5f".format(m.lat, m.lng)
    }
}
