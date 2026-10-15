package org.turath.salat

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

/** prayers and other times the app knows */
enum class P { FAJR, SUNRISE, ISHRAQ, CHASHT, ZAWAL, DHUHR, ASR, MAGHRIB, ISHA, TAHAJJUD }

val FIVE = listOf(P.FAJR, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)

/** sound for an alarm or reminder; a sound file missing from the app falls back to the phone's alarm tone */
/** muezzins whose recordings the app has */
enum class Mu { MULLA, DAGHRIRI, BUKHARI, NABET, MAGHRIBI, BASIT }

enum class Snd(val raw: String?, val mu: Mu? = null, val phrase: String? = null) {
    // adhans (a «_fajr» file of the same name is used for Fajr when the app has one)
    ADHAN_MAKKAH("adhan_makkah", Mu.MULLA), ADHAN_DAGHRIRI("adhan_daghriri", Mu.DAGHRIRI), ADHAN_DAGHRIRI2("adhan_daghriri2", Mu.DAGHRIRI),
    ADHAN_MADINAH("adhan_madinah", Mu.BUKHARI), ADHAN_AQSA("adhan_aqsa"),
    ADHAN_BASIT("adhan_basit", Mu.BASIT), ADHAN_NABET("adhan_nabet", Mu.NABET), ADHAN_MAGHRIBI("adhan_maghribi", Mu.MAGHRIBI),
    // short calls for alarms and reminders, cut from the adhans: «الصلاة خير من النوم», «حي على الصلاة», «أشهد أن لا إله إلا الله», «الله أكبر»
    KHAYR_MULLA("short_khayr_mulla", Mu.MULLA, "khayr"), KHAYR_BUKHARI("short_khayr_bukhari", Mu.BUKHARI, "khayr"),
    SHORT_HAYYA("short_hayya", Mu.MULLA, "hayya"), HAYYA_DAGHRIRI("short_hayya_daghriri", Mu.DAGHRIRI, "hayya"), HAYYA_BUKHARI("short_hayya_bukhari", Mu.BUKHARI, "hayya"),
    HAYYA_NABET("short_hayya_nabet", Mu.NABET, "hayya"), HAYYA_MAGHRIBI("short_hayya_maghribi", Mu.MAGHRIBI, "hayya"), HAYYA_BASIT("short_hayya_basit", Mu.BASIT, "hayya"),
    SHORT_SHAHADA("short_shahada", Mu.MULLA, "shahada"), SHAHADA_DAGHRIRI("short_shahada_daghriri", Mu.DAGHRIRI, "shahada"), SHAHADA_BUKHARI("short_shahada_bukhari", Mu.BUKHARI, "shahada"),
    SHAHADA_NABET("short_shahada_nabet", Mu.NABET, "shahada"), SHAHADA_MAGHRIBI("short_shahada_maghribi", Mu.MAGHRIBI, "shahada"), SHAHADA_BASIT("short_shahada_basit", Mu.BASIT, "shahada"),
    SHORT_TAKBIR("short_takbir", Mu.MULLA, "takbir"), TAKBIRAT("takbirat_makkah", Mu.MULLA, "takbirat"),
    // birdsong
    BIRDS1("birds1"), NIGHTINGALE("birds_nightingale"), BLACKBIRD("birds_blackbird"), ROBIN("birds_robin"), SKYLARK("birds_skylark"),
    WREN("birds_wren"), CHORUS("birds_chorus"),
    TONE(null), NOTIFY(null), SILENT(null);

    val adhan get() = name.startsWith("ADHAN")
    val bird get() = raw?.startsWith("birds") == true
    val short get() = phrase != null
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
        P.ISHRAQ -> Snd.NIGHTINGALE
        P.CHASHT -> Snd.BLACKBIRD
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
    // Ramadan: suhoor alarm and iftar reminder every day; the phone on vibrate after Isha for the taraweeh
    var ramadan: Boolean get() = sp.getBoolean("ramadan", true); set(v) = sp.edit().putBoolean("ramadan", v).apply()
    var taraweehVib: Boolean get() = sp.getBoolean("tarvib", true); set(v) = sp.edit().putBoolean("tarvib", v).apply()
    var taraweehMinutes: Int get() = sp.getInt("tarmin", 90); set(v) = sp.edit().putInt("tarmin", v.coerceIn(60, 120)).apply()

    /** a fasting day: Ramadan, Monday / Thursday, or an accepted white day (by the hijri date of its daytime) */
    fun fastDay(d: java.time.LocalDate): Boolean {
        val h = Schedule.hijriOf(this, d)
        return (ramadan && h.month == 9) ||
            (monThu && (d.dayOfWeek == java.time.DayOfWeek.MONDAY || d.dayOfWeek == java.time.DayOfWeek.THURSDAY)) ||
            (beed && h.day in 13..15 && beedAccepted("${h.year}-${h.month}"))
    }

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

    // a reminder some minutes before and / or after each prayer (0 = none)
    fun before(p: P): Int = sp.getInt("pre_" + p.name, 0)
    fun setBefore(p: P, v: Int) = sp.edit().putInt("pre_" + p.name, v).apply()
    fun after(p: P): Int = sp.getInt("post_" + p.name, 0)
    fun setAfter(p: P, v: Int) = sp.edit().putInt("post_" + p.name, v).apply()
    var prePostSound: Snd get() = runCatching { Snd.valueOf(sp.getString("ppsnd", "") ?: "") }.getOrDefault(Snd.SHORT_HAYYA); set(v) = sp.edit().putString("ppsnd", v.name).apply()

    var reminders: List<Reminder>
        get() = sp.getString("rem", null)?.let { s -> val a = JSONArray(s); (0 until a.length()).map { Reminder.from(a.getJSONObject(it)) } } ?: defaultReminders()
        set(v) = sp.edit().putString("rem", JSONArray().apply { v.forEach { put(it.json()) } }.toString()).apply()

    private fun defaultReminders() = listOf(
        Reminder(1, "تہجد", P.FAJR, -60, 127, Snd.CHORUS, false),
        Reminder(2, "جمعہ کی تیاری", P.DHUHR, -45, 1 shl 4, Snd.NOTIFY, false),
    )

    /** other cities shown with their times (Makkah, Madinah, al-Quds first) */
    var worldCities: List<Place>
        get() = sp.getString("world", null)?.let { s -> val a = JSONArray(s); (0 until a.length()).map { val o = a.getJSONObject(it); Place(o.getString("n"), o.getString("c"), o.getDouble("lat"), o.getDouble("lng"), o.getString("tz")) } }
            ?: listOf(Place("Makkah", "SA", 21.4225, 39.8262, "Asia/Riyadh"), Place("Madinah", "SA", 24.4672, 39.6111, "Asia/Riyadh"),
                Place("Al-Quds", "PS", 31.7767, 35.2345, "Asia/Jerusalem"))
        set(v) = sp.edit().putString("world", JSONArray().apply { v.forEach { put(JSONObject().put("n", it.name).put("c", it.country).put("lat", it.lat).put("lng", it.lng).put("tz", it.tz)) } }.toString()).apply()
}
