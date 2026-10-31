package org.turath.salat

import android.content.Context
import org.json.JSONObject
import java.net.HttpURLConnection
import java.net.URL
import java.util.Locale

/** the temperature at the chosen place (open-meteo, no key): fetched about every hour, kept in Celsius, shown beside the city on the widget */
object Weather {
    /** fetch now (on a background thread) unless a fresh value for this place is already kept; true when a value is kept afterwards */
    fun refresh(ctx: Context, pr: Prefs = Prefs(ctx), force: Boolean = false): Boolean {
        val p = pr.place ?: return false
        val key = "%.2f,%.2f".format(Locale.US, p.lat, p.lng)
        val fresh = System.currentTimeMillis() - pr.sp.getLong("wAt", 0) < 25 * 60_000 && pr.sp.getString("wKey", "") == key
        if (fresh && !force) return true
        return try {
            val u = "https://api.open-meteo.com/v1/forecast?current=temperature_2m,weather_code,is_day&latitude=%.3f&longitude=%.3f".format(Locale.US, p.lat, p.lng)
            val c = URL(u).openConnection() as HttpURLConnection
            c.connectTimeout = 8000; c.readTimeout = 8000
            c.setRequestProperty("User-Agent", "SalatKhairAlQuroon/1.0 (https://turathkhairalquroon.com)")
            val cur = JSONObject(c.inputStream.bufferedReader().readText()).getJSONObject("current")
            pr.sp.edit().putFloat("wC", cur.getDouble("temperature_2m").toFloat()).putInt("wCode", cur.optInt("weather_code", 0)).putInt("wDay", cur.optInt("is_day", 1))
                .putLong("wAt", System.currentTimeMillis()).putString("wKey", key).apply()
            true
        } catch (e: Exception) { false }
    }

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

    /** «☀ 12°C» or «☁ 54°F» from the last time it was fetched for this place (kept when there is no internet); nothing before the first fetch */
    fun text(pr: Prefs): String? {
        val p = pr.place ?: return null
        val key = "%.2f,%.2f".format(Locale.US, p.lat, p.lng)
        if (pr.sp.getString("wKey", "") != key || pr.sp.getLong("wAt", 0) == 0L) return null
        val c = pr.sp.getFloat("wC", 0f)
        val t = if (pr.tempF) Math.round(c * 9 / 5 + 32).toString() + "°F" else Math.round(c).toString() + "°C"
        return icon(pr.sp.getInt("wCode", 0), pr.sp.getInt("wDay", 1) == 1) + " " + t
    }
}
