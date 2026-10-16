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
enum class Mu(val city: String) { MULLA("makkah"), DAGHRIRI("makkah"), BUKHARI("madinah"), NABET("other"), MAGHRIBI("other"), BASIT("other") }

enum class Snd(val raw: String?, val mu: Mu? = null, val phrase: String? = null) {
    // adhans (a «_fajr» file of the same name is used for Fajr when the app has one)
    ADHAN_MAKKAH("adhan_makkah", Mu.MULLA), ADHAN_DAGHRIRI("adhan_daghriri", Mu.DAGHRIRI), ADHAN_DAGHRIRI2("adhan_daghriri2", Mu.DAGHRIRI),
    ADHAN_MADINAH("adhan_madinah", Mu.BUKHARI), ADHAN_AQSA("adhan_aqsa"),
    // iqamah (for tahajjud, ishraq and duha), when the app has the recordings
    IQAMA_MAKKAH("iqama_makkah", Mu.MULLA, "iqama"), IQAMA_MAKKAH_S("iqama_makkah_short", Mu.MULLA, "iqama"),
    IQAMA_MADINAH("iqama_madinah", Mu.BUKHARI, "iqama"), IQAMA_MADINAH_S("iqama_madinah_short", Mu.BUKHARI, "iqama"),
    IQAMA_AQSA("iqama_aqsa", null, "iqama"), IQAMA_1("iqama_1", null, "iqama"), IQAMA_2("iqama_2", null, "iqama"),
    IQAMA_3("iqama_3", null, "iqama"), IQAMA_4("iqama_4", null, "iqama"),
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
    CANARY("birds_canary"), CANARY2("birds_canary2"), CANARY3("birds_canary3"), CANARY4("birds_canary4"), CANARY5("birds_canary5"), CANARY6("birds_canary6"),
    CANARY7("birds_canary7"), CANARY8("birds_canary8"), CANARY9("birds_canary9"), CANARY10("birds_canary10"), GOLDFINCH("birds_goldfinch"), THRUSH("birds_thrush"), BLACKCAP("birds_blackcap"),
    BULBUL("birds_bulbul"), LARK("birds_lark"), WARBLER("birds_warbler"), FINCH("birds_finch"), ORIOLE("birds_oriole"),
    TONE(null), NOTIFY(null), SILENT(null);

    val adhan get() = name.startsWith("ADHAN")
    val bird get() = raw?.startsWith("birds") == true
    val short get() = phrase != null
    /** Makkah, Madinah or other (birds: "birds") */
    val city get() = when { bird -> "birds"; this == ADHAN_AQSA || phrase == "iqama" && mu == null -> "other"; else -> mu?.city ?: "phone" }
}

/** where a sound is chosen: the five prayers (adhans only), nafl times (iqamah, calls, birds), reminders and alarms (calls, birds) */
enum class SndUse { PRAYER, NAFL, REMINDER }

/** a reminder like «35 min before Fajr on Tuesday and Wednesday» */
data class Reminder(
    val id: Long, val label: String, val bases: List<P>, val minutes: Int, /* negative = before */
    val days: Int /* bit 0 = Monday … bit 6 = Sunday */, val sound: Snd, val on: Boolean
) {
    val base get() = bases.firstOrNull() ?: P.FAJR
    fun json() = JSONObject().put("id", id).put("label", label).put("base", base.name).put("bases", JSONArray().apply { bases.forEach { put(it.name) } })
        .put("min", minutes).put("days", days).put("snd", sound.name).put("on", on)

    companion object {
        fun from(o: JSONObject): Reminder {
            val b = o.optJSONArray("bases")?.let { a -> (0 until a.length()).mapNotNull { runCatching { P.valueOf(a.getString(it)) }.getOrNull() } }
                ?: listOf(P.valueOf(o.getString("base")))
            return Reminder(o.getLong("id"), o.optString("label"), b, o.getInt("min"), o.getInt("days"),
                runCatching { Snd.valueOf(o.getString("snd")) }.getOrDefault(Snd.NOTIFY), o.getBoolean("on"))
        }
    }
}

/** the user's own event in the calendar: on a date (hijri or gregorian), once, every month or every year,
 *  at a time of the clock or some minutes before / after a prayer */
data class CalEvent(
    val id: Long, val label: String, val hijri: Boolean, val y: Int, val m: Int, val d: Int,
    val repeat: String /* "once", "month", "year" */, val atMin: Int /* minutes after midnight, or -1 */,
    val base: P?, val offset: Int, val sound: Snd, val on: Boolean = true
) {
    fun json() = JSONObject().put("id", id).put("label", label).put("hijri", hijri).put("y", y).put("m", m).put("d", d).put("rep", repeat)
        .put("at", atMin).put("base", base?.name ?: "").put("off", offset).put("snd", sound.name).put("on", on)
    /** does it fall on this day (gregorian date, with its hijri daytime date) */
    fun on(g: java.time.LocalDate, h: Hijri): Boolean {
        val (yy, mm, dd) = if (hijri) Triple(h.year, h.month, h.day) else Triple(g.year, g.monthValue, g.dayOfMonth)
        return when (repeat) { "month" -> dd == d; "year" -> dd == d && mm == m; else -> dd == d && mm == m && yy == y }
    }
    companion object {
        fun from(o: JSONObject) = CalEvent(o.getLong("id"), o.optString("label"), o.optBoolean("hijri"), o.optInt("y"), o.optInt("m"), o.optInt("d"),
            o.optString("rep", "once"), o.optInt("at", -1), o.optString("base").takeIf { it.isNotEmpty() }?.let { runCatching { P.valueOf(it) }.getOrNull() },
            o.optInt("off"), runCatching { Snd.valueOf(o.optString("snd")) }.getOrDefault(Snd.NOTIFY), o.optBoolean("on", true))
    }
}

data class Place(val name: String, val country: String, val lat: Double, val lng: Double, val tz: String)

/** all settings, kept in SharedPreferences */
class Prefs(ctx: Context) {
    val sp: SharedPreferences = ctx.getSharedPreferences("salat", Context.MODE_PRIVATE)

    var lang: String get() = (sp.getString("lang", "") ?: "").ifEmpty { "en" }; set(v) = sp.edit().putString("lang", v).apply()
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
    /** the first day of the week in the calendar (1 = Monday … 6 = Saturday, 7 = Sunday) */
    var weekStart: Int get() = sp.getInt("wstart", 1); set(v) = sp.edit().putInt("wstart", v).apply()
    /** which phone volume the adhan and the other sounds follow: "media", "ring" or "alarm" */
    var volStream: String get() = sp.getString("vol", "media") ?: "media"; set(v) = sp.edit().putString("vol", v).apply()
    /** the adhan also when the phone is on silent / vibrate (then at the alarm volume) */
    var adhanInSilent: Boolean get() = sp.getBoolean("adhanSilent", false); set(v) = sp.edit().putBoolean("adhanSilent", v).apply()
    /** "time" (light by day, dark from Maghrib to sunrise), "dark", "light" or "phone" (as the phone) */
    var theme: String get() = sp.getString("theme", "time") ?: "time"; set(v) = sp.edit().putString("theme", v).apply()
    /** widgets: transparency of the background in percent (0 = solid, 100 = none), light or dark */
    var widgetAlpha: Int get() = sp.getInt("wAlpha", 20); set(v) = sp.edit().putInt("wAlpha", v.coerceIn(0, 100)).apply()
    var widgetLight: Boolean get() = sp.getBoolean("wLight", false); set(v) = sp.edit().putBoolean("wLight", v).apply()
    /** widgets: the colour of the border round the current prayer (an index of Pal.COLORS), the text colour (-1 = by the background; 0–7 Pal.COLORS; 8 black),
     *  the colour of the moving line (-1 = by the background), and the size of the texts in percent */
    var widgetAccent: Int get() = sp.getInt("wAccent", 0).coerceIn(0, Pal.COLORS.size - 1); set(v) = sp.edit().putInt("wAccent", v).apply()
    var widgetInk: Int get() = sp.getInt("wInk", -1).coerceIn(-1, Pal.COLORS.size); set(v) = sp.edit().putInt("wInk", v).apply()
    var widgetTicker: Int get() = sp.getInt("wTick", -1).coerceIn(-1, Pal.COLORS.size); set(v) = sp.edit().putInt("wTick", v).apply()
    var widgetSize: Int get() = sp.getInt("wSize", 100).coerceIn(70, 160); set(v) = sp.edit().putInt("wSize", v).apply()
    /** the app: the main colour (-1 = by the theme; 0–6 Pal.COLORS) and the size of all texts in percent */
    var appAccent: Int get() = sp.getInt("appAccent", -1).coerceIn(-1, 6); set(v) = sp.edit().putInt("appAccent", v).apply()
    var appFont: Int get() = sp.getInt("appFont", 100).coerceIn(70, 160); set(v) = sp.edit().putInt("appFont", v).apply()
    /** the user's own durood recordings (content URIs from the phone) */
    var duroodFiles: List<String>
        get() = sp.getString("duroodFiles", null)?.let { s -> val a = JSONArray(s); (0 until a.length()).map { a.getString(it) } } ?: emptyList()
        set(v) = sp.edit().putString("duroodFiles", JSONArray().apply { v.forEach { put(it) } }.toString()).apply()
    var h24: Boolean get() = sp.getBoolean("h24", false); set(v) = sp.edit().putBoolean("h24", v).apply()

    fun adjust(p: P): Int = sp.getInt("adj_" + p.name, 0)
    fun setAdjust(p: P, v: Int) = sp.edit().putInt("adj_" + p.name, v.coerceIn(-30, 30)).apply()

    /** minutes after sunrise for ishraq, after sunrise for chasht, before dhuhr for the zawal (forbidden) time */
    var ishraqAfter: Int get() = sp.getInt("ishraq", 15); set(v) = sp.edit().putInt("ishraq", v).apply()
    var chashtAfter: Int get() = sp.getInt("chasht", 120); set(v) = sp.edit().putInt("chasht", v).apply()
    var zawalBefore: Int get() = sp.getInt("zawal", 10); set(v) = sp.edit().putInt("zawal", v).apply()

    // sound of each prayer and nafl time (adhan / short / birds / silent)
    fun sound(p: P): Snd = runCatching { Snd.valueOf(sp.getString("snd_" + p.name, null) ?: "") }.getOrElse { defaultSound(p) }
    fun setSound(p: P, s: Snd) { sp.edit().putString("snd_" + p.name, s.name).apply(); if (s.raw != null) sp.edit().putString("lastsnd_" + p.name, s.name).apply() }
    /** the last real sound chosen for a prayer (to go back to it from «notification only» / «silent») */
    fun lastSound(p: P): Snd = runCatching { Snd.valueOf(sp.getString("lastsnd_" + p.name, null) ?: "") }.getOrElse { if (p == P.MAGHRIB) Snd.ADHAN_DAGHRIRI else if (p in FIVE) Snd.ADHAN_MAKKAH else Snd.NIGHTINGALE }
    private fun defaultSound(p: P) = when (p) {
        // Shaikh Ali Ahmad Mulla (Makkah) for all, Shaikh Hamad al-Daghriri for Maghrib
        P.MAGHRIB -> Snd.ADHAN_DAGHRIRI
        P.FAJR, P.DHUHR, P.ASR, P.ISHA -> Snd.ADHAN_MAKKAH
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
    var ashura: Boolean get() = sp.getBoolean("ashura", true); set(v) = sp.edit().putBoolean("ashura", v).apply()
    var arafah: Boolean get() = sp.getBoolean("arafah", true); set(v) = sp.edit().putBoolean("arafah", v).apply()
    // takbirat: Eid al-Fitr (from the night of Eid until the prayer), the ten days of Dhul-Hijjah, after the prayers of Arafah and Tashreeq
    var takbirFitr: Boolean get() = sp.getBoolean("tkFitr", true); set(v) = sp.edit().putBoolean("tkFitr", v).apply()
    var takbirHijjah: Boolean get() = sp.getBoolean("tkHijjah", true); set(v) = sp.edit().putBoolean("tkHijjah", v).apply()
    var takbirTashreeq: Boolean get() = sp.getBoolean("tkTashreeq", true); set(v) = sp.edit().putBoolean("tkTashreeq", v).apply()
    // morning and evening adhkar
    var azkarMorning: Boolean get() = sp.getBoolean("azkarM", false); set(v) = sp.edit().putBoolean("azkarM", v).apply()
    var azkarEvening: Boolean get() = sp.getBoolean("azkarE", false); set(v) = sp.edit().putBoolean("azkarE", v).apply()
    /** a notification always showing the next prayer and its count */
    var persistent: Boolean get() = sp.getBoolean("persist", false); set(v) = sp.edit().putBoolean("persist", v).apply()
    var monThu: Boolean get() = sp.getBoolean("monthu", false); set(v) = sp.edit().putBoolean("monthu", v).apply()
    var beed: Boolean get() = sp.getBoolean("beed", false); set(v) = sp.edit().putBoolean("beed", v).apply()
    // Ramadan: suhoor alarm and iftar reminder every day; the phone on vibrate after Isha for the taraweeh
    var ramadan: Boolean get() = sp.getBoolean("ramadan", true); set(v) = sp.edit().putBoolean("ramadan", v).apply()
    var taraweehVib: Boolean get() = sp.getBoolean("tarvib", true); set(v) = sp.edit().putBoolean("tarvib", v).apply()
    var taraweehMinutes: Int get() = sp.getInt("tarmin", 90); set(v) = sp.edit().putInt("tarmin", v.coerceIn(60, 120)).apply()

    // Friday: the phone on vibrate from Dhuhr time for the khutbah and Jumu'ah prayer
    var jumuahVib: Boolean get() = sp.getBoolean("jumvib", true); set(v) = sp.edit().putBoolean("jumvib", v).apply()
    var jumuahMinutes: Int get() = sp.getInt("jummin", 60); set(v) = sp.edit().putInt("jummin", v.coerceIn(15, 150)).apply()

    /** a fasting day: Ramadan, Monday / Thursday, or an accepted white day (by the hijri date of its daytime) */
    fun fastDay(d: java.time.LocalDate): Boolean {
        val h = Schedule.hijriOf(this, d)
        return (ramadan && h.month == 9) ||
            (ashura && h.month == 1 && (h.day == 9 || h.day == 10)) || (arafah && h.month == 12 && h.day == 9) ||
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

    private fun defaultReminders() = emptyList<Reminder>()

    var events: List<CalEvent>
        get() = sp.getString("events", null)?.let { s -> val a = JSONArray(s); (0 until a.length()).map { CalEvent.from(a.getJSONObject(it)) } } ?: emptyList()
        set(v) = sp.edit().putString("events", JSONArray().apply { v.forEach { put(it.json()) } }.toString()).apply()

    /** other cities shown with their times (Makkah, Madinah, al-Quds first) */
    var worldCities: List<Place>
        get() = sp.getString("world", null)?.let { s -> val a = JSONArray(s); (0 until a.length()).map { val o = a.getJSONObject(it); Place(o.getString("n"), o.getString("c"), o.getDouble("lat"), o.getDouble("lng"), o.getString("tz")) } }
            ?: listOf(Place("Makkah", "SA", 21.4225, 39.8262, "Asia/Riyadh"), Place("Madinah", "SA", 24.4672, 39.6111, "Asia/Riyadh"),
                Place("Al-Quds", "PS", 31.7767, 35.2345, "Asia/Jerusalem"))
        set(v) = sp.edit().putString("world", JSONArray().apply { v.forEach { put(JSONObject().put("n", it.name).put("c", it.country).put("lat", it.lat).put("lng", it.lng).put("tz", it.tz)) } }.toString()).apply()
}
