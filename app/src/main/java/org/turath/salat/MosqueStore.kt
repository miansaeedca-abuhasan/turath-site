package org.turath.salat

import org.json.JSONArray
import org.json.JSONObject

/**
 * What the masjid page keeps on the phone: the last search (until the user searches from another place),
 * the masjids marked as favourite, and the places saved from Google Maps (shared into the app).
 */
object MosqueStore {
    /** a place saved from Google Maps: kind is "masjid" or "musalla" */
    data class G(val id: String, val kind: String, val name: String, val address: String, val url: String, val fav: Boolean)

    private fun mJson(m: Mosques.M) = JSONObject().put("id", m.id).put("name", m.name).put("lat", m.lat).put("lng", m.lng).put("km", m.km)
        .put("address", m.address).put("sunni", m.sunni).put("website", m.website)
    private fun mOf(o: JSONObject) = Mosques.M(o.optString("id"), o.optString("name"), o.optDouble("lat"), o.optDouble("lng"), o.optDouble("km"), o.optString("address"), o.optBoolean("sunni"), o.optString("website"))

    private fun read(pr: Prefs, key: String): JSONArray = runCatching { JSONArray(pr.sp.getString(key, "[]")) }.getOrDefault(JSONArray())

    // ---- the last search
    fun saveLast(pr: Prefs, lat: Double, lng: Double, list: List<Mosques.M>) {
        val a = JSONArray(); list.forEach { a.put(mJson(it)) }
        pr.sp.edit().putString("mqs_last", JSONObject().put("lat", lat).put("lng", lng).put("list", a).toString()).apply()
    }
    fun last(pr: Prefs): List<Mosques.M> = runCatching {
        val a = JSONObject(pr.sp.getString("mqs_last", "")!!).getJSONArray("list")
        (0 until a.length()).map { mOf(a.getJSONObject(it)) }
    }.getOrDefault(emptyList())

    // ---- favourites found by the search
    fun favs(pr: Prefs): List<Mosques.M> { val a = read(pr, "mqs_fav"); return (0 until a.length()).map { mOf(a.getJSONObject(it)) } }
    fun isFav(pr: Prefs, id: String) = favs(pr).any { it.id == id }
    fun toggleFav(pr: Prefs, m: Mosques.M) {
        val cur = favs(pr)
        val next = if (cur.any { it.id == m.id }) cur.filter { it.id != m.id } else cur + m
        val a = JSONArray(); next.forEach { a.put(mJson(it)) }
        pr.sp.edit().putString("mqs_fav", a.toString()).apply()
    }

    // ---- places saved from Google Maps
    fun google(pr: Prefs): List<G> { val a = read(pr, "mqs_g"); return (0 until a.length()).map { val o = a.getJSONObject(it)
        G(o.optString("id"), o.optString("kind"), o.optString("name"), o.optString("address"), o.optString("url"), o.optBoolean("fav")) } }
    private fun writeG(pr: Prefs, l: List<G>) {
        val a = JSONArray(); l.forEach { a.put(JSONObject().put("id", it.id).put("kind", it.kind).put("name", it.name).put("address", it.address).put("url", it.url).put("fav", it.fav)) }
        pr.sp.edit().putString("mqs_g", a.toString()).apply()
    }
    fun addGoogle(pr: Prefs, g: G) { val cur = google(pr).filter { it.id != g.id }; writeG(pr, cur + g) }
    fun removeGoogle(pr: Prefs, id: String) = writeG(pr, google(pr).filter { it.id != id })
    fun toggleGoogleFav(pr: Prefs, id: String) = writeG(pr, google(pr).map { if (it.id == id) it.copy(fav = !it.fav) else it })

    /** what Google Maps puts in a share: usually the name, the address and a link, each on its own line */
    fun parseShare(text: String): G? {
        val lines = text.lines().map { it.trim() }.filter { it.isNotEmpty() }
        if (lines.isEmpty()) return null
        val url = lines.firstOrNull { it.startsWith("http") } ?: Regex("https?://\\S+").find(text)?.value ?: ""
        val rest = lines.map { it.replace(Regex("https?://\\S+"), "").trim() }.filter { it.isNotEmpty() }
        if (rest.isEmpty() && url.isEmpty()) return null
        val name = rest.firstOrNull() ?: "Google Maps"
        val addr = rest.drop(1).joinToString(", ")
        return G((name + "|" + addr + "|" + url).hashCode().toString(), "", name, addr, url, false)
    }
}
