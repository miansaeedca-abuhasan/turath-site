package org.turath.salat

import android.content.Context
import android.location.LocationManager
import android.os.Build
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withTimeoutOrNull
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.net.URLEncoder
import kotlin.coroutines.resume

class Mosque(val id: String, val name: String, val lat: Double, val lng: Double, val addr: String, val dist: Double, val sunni: Boolean, val bad: Boolean)

/** mosques round a spot, from OpenStreetMap (free, no key). Groups outside Ahl as-Sunnah are left out by their tag or by a clear name; a place with no sign at all cannot be known. */
object Mosques {
    // the group written in the "denomination" tag
    private val BAD_DENOM = listOf("shia", "shi'a", "shiite", "twelver", "ithna", "jafari", "ja'fari", "imami", "ahmadi", "qadiani", "ismaili", "isma'ili", "bohra", "bohri", "dawoodi",
        "nizari", "aga khan", "alawite", "alevi", "druze", "zaidi", "zaydi", "khoja", "bektashi", "lahori")
    // clear signs in the name, the operator, the website or the description
    private val BAD_TEXT = listOf("shia", "shi'a", "shiite", "jafari", "jafaria", "jaffari", "ja'fari", "jaafari", "imambargah", "imam bargah", "imambara", "imambarah", "husainia", "hussainia", "husayniyya", "hosseiniyeh",
        "ithna ashari", "ithna-ashari", "ithnaashari", "ahlulbayt", "ahlul bayt", "ahl ul bayt", "ahl al-bayt", "ahl al bayt", "zainabia", "zaynabiya",
        "ahmadiyya", "ahmadiyyah", "ahmadi", "qadiani", "baitul islam", "bait-ul-islam", "baitun nur", "baitun-nur", "baitul nasr", "baitus samad", "baitul hameed", "baitul aman", "baitul ehsan",
        "ismaili", "jamatkhana", "jamat khana", "jamaat khana", "aga khan", "bohra", "bohri", "dawoodi", "saifee", "alavi bohra", "nizari", "alevi", "bektashi")
    private val SUNNI = listOf("sunni", "hanafi", "shafi", "maliki", "hanbali", "hanbal", "salafi", "ahl", "deoband", "athari")

    private fun norm(s: String) = s.lowercase().replace('’', '\'').replace('‘', '\'').replace('`', '\'')

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

    private fun post(url: String, body: String): String {
        val c = URL(url).openConnection() as HttpURLConnection
        c.requestMethod = "POST"; c.connectTimeout = 10000; c.readTimeout = 30000; c.doOutput = true
        c.setRequestProperty("User-Agent", "SalatKhairAlQuroon/1.0 (turathkhairalquroon@gmail.com)")
        c.setRequestProperty("Content-Type", "application/x-www-form-urlencoded")
        c.outputStream.use { it.write(("data=" + URLEncoder.encode(body, "UTF-8")).toByteArray()) }
        if (c.responseCode != 200) throw RuntimeException("HTTP " + c.responseCode)
        return c.inputStream.bufferedReader().use { it.readText() }
    }

    /** blocking: call from a background thread */
    fun fetch(lat: Double, lng: Double, meters: Int): List<Mosque> {
        val a = "(around:$meters,$lat,$lng)"
        val q = "[out:json][timeout:25];(nwr[\"amenity\"=\"place_of_worship\"][\"religion\"=\"muslim\"]$a;nwr[\"building\"=\"mosque\"]$a;nwr[\"amenity\"=\"prayer_room\"][\"religion\"=\"muslim\"]$a;);out center tags 500;"
        val txt = runCatching { post("https://overpass-api.de/api/interpreter", q) }.getOrElse { post("https://overpass.kumi.systems/api/interpreter", q) }
        val els = JSONObject(txt).getJSONArray("elements")
        val seen = HashSet<String>(); val out = ArrayList<Mosque>()
        for (i in 0 until els.length()) {
            val e = els.getJSONObject(i)
            val id = e.getString("type") + e.getLong("id")
            if (!seen.add(id)) continue
            val t = e.optJSONObject("tags") ?: JSONObject()
            val la: Double; val ln: Double
            if (e.has("lat")) { la = e.getDouble("lat"); ln = e.getDouble("lon") } else { val c = e.optJSONObject("center") ?: continue; la = c.getDouble("lat"); ln = c.getDouble("lon") }
            fun g(k: String) = t.optString(k, "")
            val name = g("name").ifEmpty { g("name:en") }.ifEmpty { g("alt_name") }
            val den = norm(g("denomination") + " " + g("religion:denomination"))
            val text = norm(listOf(g("name"), g("name:en"), g("alt_name"), g("operator"), g("description"), g("website"), g("brand")).joinToString(" "))
            val bad = BAD_DENOM.any { den.contains(it) } || BAD_TEXT.any { text.contains(it) }
            val sunni = !bad && SUNNI.any { den.contains(it) }
            val street = (g("addr:housenumber") + " " + g("addr:street")).trim()
            val addr = listOf(street, g("addr:city"), g("addr:postcode")).filter { it.isNotEmpty() }.joinToString(", ")
            out.add(Mosque(id, name, la, ln, addr, Cities.dist(lat, lng, la, ln), sunni, bad))
        }
        return out.sortedBy { it.dist }
    }
}
