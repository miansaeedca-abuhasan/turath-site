package org.turath.salat

import android.content.Context
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

/** the temperature at a place (open-meteo, no key): fetched about every hour, kept in Celsius with the weather's picture; the last value stays when there is no internet */
object Weather {
    private fun key(lat: Double, lng: Double) = "wx_%.2f_%.2f".format(Locale.US, lat, lng)

    /** fetch for a place unless a fresh value is kept (background thread only); true when a value is kept afterwards */
    fun refreshAt(pr: Prefs, lat: Double, lng: Double, force: Boolean = false): Boolean {
        val k = key(lat, lng)
        val old = pr.sp.getString(k, null)?.split("|")
        val at = old?.getOrNull(3)?.toLongOrNull() ?: 0L
        if (!force && System.currentTimeMillis() - at < 25 * 60_000) return true
        return try {
            val u = "https://api.open-meteo.com/v1/forecast?current=temperature_2m,weather_code,is_day&latitude=%.3f&longitude=%.3f".format(Locale.US, lat, lng)
            val c = URL(u).openConnection() as HttpURLConnection
            c.connectTimeout = 8000; c.readTimeout = 8000
            c.setRequestProperty("User-Agent", "SalatKhairAlQuroon/1.0 (https://turathkhairalquroon.com)")
            val cur = JSONObject(c.inputStream.bufferedReader().readText()).getJSONObject("current")
            pr.sp.edit().putString(k, "${cur.getDouble("temperature_2m")}|${cur.optInt("weather_code", 0)}|${cur.optInt("is_day", 1)}|${System.currentTimeMillis()}").apply()
            true
        } catch (e: Exception) { old != null }
    }

    /** the chosen place */
    fun refresh(ctx: Context, pr: Prefs = Prefs(ctx), force: Boolean = false): Boolean { val p = pr.place ?: return false; return refreshAt(pr, p.lat, p.lng, force) }

    /** the picture for a WMO weather code: sun / moon, cloud, rain, snow … */
    private fun icon(code: Int, day: Boolean): String = when (code) {
        0, 1 -> if (day) "\u2600\uFE0F" else "\uD83C\uDF19"
        2 -> if (day) "\u26C5" else "\u2601\uFE0F"
        3 -> "\u2601\uFE0F"
        45, 48 -> "\uD83C\uDF2B\uFE0F"
        in 51..67, in 80..82 -> "\uD83C\uDF27\uFE0F"
        in 71..77, 85, 86 -> "\u2744\uFE0F"
        in 95..99 -> "\u26C8\uFE0F"
        else -> "\u2601\uFE0F"
    }

    /** «☀ 12°C» or «☁ 54°F» from the last fetch for this place; nothing before the first one */
    fun textAt(pr: Prefs, lat: Double, lng: Double): String? {
        val f = pr.sp.getString(key(lat, lng), null)?.split("|") ?: return null
        val c = f.getOrNull(0)?.toDoubleOrNull() ?: return null
        val t = if (pr.tempF) Math.round(c * 9 / 5 + 32).toString() + "°F" else Math.round(c).toString() + "°C"
        return icon(f.getOrNull(1)?.toIntOrNull() ?: 0, f.getOrNull(2) != "0") + " " + t
    }

    fun text(pr: Prefs): String? { val p = pr.place ?: return null; return textAt(pr, p.lat, p.lng) }
}
