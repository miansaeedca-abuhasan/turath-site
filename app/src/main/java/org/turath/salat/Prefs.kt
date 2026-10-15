package org.turath.salat

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

/** prayers and other times the app knows */
enum class P { FAJR, SUNRISE, ISHRAQ, CHASHT, ZAWAL, DHUHR, ASR, MAGHRIB, ISHA, TAHAJJUD }

val FIVE = listOf(P.FAJR, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)

/** sound for an alarm or reminder; a sound file missing from the app falls back to the phone's alarm tone */
enum class Snd(val raw: String?) {
    // adhans (a «_fajr» file of the same name is used for Fajr when the app has one)
    ADHAN_MAKKAH("adhan_makkah"), ADHAN_DAGHRIRI("adhan_daghriri"), ADHAN_DAGHRIRI2("adhan_daghriri2"),
    ADHAN_MADINAH("adhan_madinah"), ADHAN_AQSA("adhan_aqsa"),
    ADHAN_BASIT("adhan_basit"), ADHAN_NABET("adhan_nabet"), ADHAN_MAGHRIBI("adhan_maghribi"),
    // short calls for alarms and reminders (cut from Shaikh Ali Ahmad Mulla's adhan), the takbirat of Makkah
    SHORT_HAYYA("short_hayya"), SHORT_SHAHADA("short_shahada"), SHORT_TAKBIR("short_takbir"), TAKBIRAT("takbirat_makkah"),
    BIRDS1("birds1"), BIRDS2("birds2"), BIRDS3("birds3"),
    TONE(null), NOTIFY(null), SILENT(null);

    val adhan get() = name.startsWith("ADHAN")
}

/** a reminder like «35 min before Fajr on Tuesday and Wednesday» */
data class Reminder(
    val id: Long, val label: String, val base: P, val minutes: Int, /* negative = before */
    val days: Int /* bit 0 = Monday … bit 6 = Sunday */, val sound: Snd, val on: Boolean
) {
    fun json() = JSONObject().put("id", id).put("label", label).put("base", base.name).put("min", minutes)
        .put("days", days).put("snd", sound.name).put("on", on)

    companion object {
        fun from(o: JSONObject) = Reminder(o.getLong("id"), o.optString("label"), P.valueOf(o.getString("base")),
            o.getInt("min"), o.getInt("days"), runCatching { Snd.valueOf(o.getString("snd")) }.getOrDefault(Snd.NOTIFY), o.getBoolean("on"))
    }
}

data class Place(val name: String, val country: String, val lat: Double, val lng: Double, val tz: String)

/** all settings, kept in SharedPreferences */
class Prefs(ctx: Context) {
    val sp: SharedPreferences = ctx.getSharedPreferences("salat", Context.MODE_PRIVATE)

    var lang: String get() = sp.getString("lang", "") ?: ""; set(v) = sp.edit().putString("lang", v).apply()
    var place: Place?
        get() = sp.getString("place", null)?.let { val o = JSONObject(it); Place(o.getString("n"), o.getString("c"), o.getDouble("lat"), o.getDouble("lng"), o.getString("tz")) }
        set(v) = sp.edit().putString("place", v?.let { JSONObject().put("n", it.name).put("c", it.country).put("lat", it.lat).put("lng", it.lng).put("tz", it.tz).toString() }).apply()
    var placeByGps: Boolean get() = sp.getBoolean("gps", false); set(v) = sp.edit().putBoolean("gps", v).apply()

    /** "hanafi" or "shafii" (Shafi'i / Maliki / Hanbali / Salafi — the same times) */
    var school: String get() = sp.getString("school", "hanafi") ?: "hanafi"; set(v) = sp.edit().putString("school", v).apply()
    /** "" = the country's usual method */
    var method: String get() = sp.getString("method", "") ?: ""; set(v) = sp.edit().putString("method", v).apply()
    /** "auto" (the country's rules), "on" (+1 hour), "off" */
    var dst: String get() = sp.getString("dst", "auto") ?: "auto"; set(v) = sp.edit().putString("dst", v).apply()
    var hijriAdjust: Int get() = sp.getInt("hadj", 0); set(v) = sp.edit().putInt("hadj", v).apply()
    var h24: Boolean get() = sp.getBoolean("h24", false); set(v) = sp.edit().putBoolean("h24", v).apply()

    fun adjust(p: P): Int = sp.getInt("adj_" + p.name, 0)
    fun setAdjust(p: P, v: Int) = sp.edit().putInt("adj_" + p.name, v.coerceIn(-30, 30)).apply()

    /** minutes after sunrise for ishraq, after sunrise for chasht, before dhuhr for the zawal (forbidden) time */
    var ishraqAfter: Int get() = sp.getInt("ishraq", 15); set(v) = sp.edit().putInt("ishraq", v).apply()
    var chashtAfter: Int get() = sp.getInt("chasht", 120); set(v) = sp.edit().putInt("chasht", v).apply()
    var zawalBefore: Int get() = sp.getInt("zawal", 10); set(v) = sp.edit().putInt("zawal", v).apply()

    // sound of each prayer and nafl time (adhan / short / birds / silent)
    fun sound(p: P): Snd = runCatching { Snd.valueOf(sp.getString("snd_" + p.name, null) ?: "") }.getOrElse { defaultSound(p) }
    fun setSound(p: P, s: Snd) = sp.edit().putString("snd_" + p.name, s.name).apply()
    private fun defaultSound(p: P) = when (p) {
        P.FAJR, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA -> Snd.ADHAN_MAKKAH
        P.ISHRAQ, P.CHASHT -> Snd.BIRDS1
        else -> Snd.SILENT
    }

    // the phone on vibrate when each prayer comes in, for some minutes
    var vibrateMode: Boolean get() = sp.getBoolean("vib", false); set(v) = sp.edit().putBoolean("vib", v).apply()
    var vibrateMinutes: Int get() = sp.getInt("vibmin", 15); set(v) = sp.edit().putInt("vibmin", v).apply()
    fun vibrateFor(p: P): Boolean = sp.getBoolean("vib_" + p.name, true)
    fun setVibrateFor(p: P, v: Boolean) = sp.edit().putBoolean("vib_" + p.name, v).apply()

    // fasting: Monday / Thursday, and the white days (13–15)
    var monThu: Boolean get() = sp.getBoolean("monthu", false); set(v) = sp.edit().putBoolean("monthu", v).apply()
    var beed: Boolean get() = sp.getBoolean("beed", false); set(v) = sp.edit().putBoolean("beed", v).apply()
    var suhoorBefore: Int get() = sp.getInt("suhoor", 45); set(v) = sp.edit().putInt("suhoor", v).apply()
    var iftarBefore: Int get() = sp.getInt("iftar", 15); set(v) = sp.edit().putInt("iftar", v).apply()
    var suhoorSound: Snd get() = runCatching { Snd.valueOf(sp.getString("suhoorsnd", "") ?: "") }.getOrDefault(Snd.SHORT_HAYYA); set(v) = sp.edit().putString("suhoorsnd", v.name).apply()
    /** hijri months (e.g. "1448-5") in which the white days' fast was accepted, and declined */
    fun beedAccepted(key: String) = sp.getStringSet("beedyes", emptySet())!!.contains(key)
    fun setBeed(key: String, yes: Boolean) {
        val k = if (yes) "beedyes" else "beedno"
        sp.edit().putStringSet(k, sp.getStringSet(k, emptySet())!! + key).apply()
    }
    fun beedDeclined(key: String) = sp.getStringSet("beedno", emptySet())!!.contains(key)

    var reminders: List<Reminder>
        get() = sp.getString("rem", null)?.let { s -> val a = JSONArray(s); (0 until a.length()).map { Reminder.from(a.getJSONObject(it)) } } ?: defaultReminders()
        set(v) = sp.edit().putString("rem", JSONArray().apply { v.forEach { put(it.json()) } }.toString()).apply()

    private fun defaultReminders() = listOf(
        Reminder(1, "تہجد", P.FAJR, -60, 127, Snd.BIRDS2, false),
        Reminder(2, "جمعہ کی تیاری", P.DHUHR, -45, 1 shl 4, Snd.NOTIFY, false),
    )

    /** other cities shown with their times (Makkah, Madinah, al-Quds first) */
    var worldCities: List<Place>
        get() = sp.getString("world", null)?.let { s -> val a = JSONArray(s); (0 until a.length()).map { val o = a.getJSONObject(it); Place(o.getString("n"), o.getString("c"), o.getDouble("lat"), o.getDouble("lng"), o.getString("tz")) } }
            ?: listOf(Place("Makkah", "SA", 21.4225, 39.8262, "Asia/Riyadh"), Place("Madinah", "SA", 24.4672, 39.6111, "Asia/Riyadh"),
                Place("Al-Quds", "PS", 31.7767, 35.2345, "Asia/Jerusalem"))
        set(v) = sp.edit().putString("world", JSONArray().apply { v.forEach { put(JSONObject().put("n", it.name).put("c", it.country).put("lat", it.lat).put("lng", it.lng).put("tz", it.tz)) } }.toString()).apply()
}
