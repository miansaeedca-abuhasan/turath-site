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
            val u = "https://api.open-meteo.com/v1/forecast?current=temperature_2m&latitude=%.3f&longitude=%.3f".format(Locale.US, p.lat, p.lng)
            val c = URL(u).openConnection() as HttpURLConnection
            c.connectTimeout = 8000; c.readTimeout = 8000
            c.setRequestProperty("User-Agent", "SalatKhairAlQuroon/1.0 (https://turathkhairalquroon.com)")
            val t = JSONObject(c.inputStream.bufferedReader().readText()).getJSONObject("current").getDouble("temperature_2m")
            pr.sp.edit().putFloat("wC", t.toFloat()).putLong("wAt", System.currentTimeMillis()).putString("wKey", key).apply()
            true
        } catch (e: Exception) { false }
    }

    /** «12°C» or «54°F»; nothing when there is no value for this place or it is older than six hours */
    fun text(pr: Prefs): String? {
        val p = pr.place ?: return null
        val key = "%.2f,%.2f".format(Locale.US, p.lat, p.lng)
        if (pr.sp.getString("wKey", "") != key || System.currentTimeMillis() - pr.sp.getLong("wAt", 0) > 6 * 3600_000) return null
        val c = pr.sp.getFloat("wC", 0f)
        return if (pr.tempF) Math.round(c * 9 / 5 + 32).toString() + "°F" else Math.round(c).toString() + "°C"
    }
}
