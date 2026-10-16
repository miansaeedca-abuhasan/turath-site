package org.turath.salat

import android.app.*
import android.content.*
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.IBinder
import java.time.*

/** one thing to do at a time: an adhan, a reminder, the phone on / off vibrate … */
data class Ev(val at: ZonedDateTime, val kind: String, val p: P? = null, val snd: Snd = Snd.SILENT, val text: String = "", val extra: Long = 0)

object Events {
    /** everything due from `from` over the next days, in order */
    fun list(ctx: Context, from: ZonedDateTime, days: Int = 3): List<Ev> {
        val pr = Prefs(ctx); val place = pr.place ?: return emptyList()
        Tr.lang = pr.lang.ifEmpty { "en" }
        val zone = Schedule.zone(place)
        val start = from.withZoneSameInstant(zone).toLocalDate().minusDays(1)
        val out = mutableListOf<Ev>()
        for (i in 0..days) {
            val d = start.plusDays(i.toLong())
            val t = Schedule.day(pr, place, d)
            val h0 = Schedule.hijriOf(pr, d)
            // in Ramadan the night after this day's maghrib is Ramadan when the next day is (taraweeh after Isha)
            val ramadanNight = Schedule.hijriOf(pr, d.plusDays(1)).month == 9
            for (p in FIVE) {
                val s = pr.sound(p)
                if (s != Snd.SILENT) out += Ev(t[p], "prayer", p, s)
                val taraweeh = p == P.ISHA && pr.taraweehVib && ramadanNight
                val jumuah = p == P.DHUHR && pr.jumuahVib && d.dayOfWeek == DayOfWeek.FRIDAY
                if (taraweeh || jumuah || (pr.vibrateMode && pr.vibrateFor(p))) {
                    val mins = when { taraweeh -> maxOf(pr.taraweehMinutes, pr.vibrateMinutes); jumuah -> maxOf(pr.jumuahMinutes, pr.vibrateMinutes); else -> pr.vibrateMinutes }
                    out += Ev(t[p], "vibon", p)
                    out += Ev(t[p].plusMinutes(mins.toLong()), "viboff", p)
                }
            }
            for (p in listOf(P.ISHRAQ, P.CHASHT, P.TAHAJJUD)) {
                val s = pr.sound(p)
                if (s != Snd.SILENT) out += Ev(t[p], "nafl", p, s)
            }
            // fasting days
            val h = Schedule.hijriOf(pr, d)
            val key = "${h.year}-${h.month}"
            val dow = d.dayOfWeek
            if (pr.fastDay(d)) {
                out += Ev(t[P.FAJR].minusMinutes(pr.suhoorBefore.toLong()), "suhoor", P.FAJR, pr.suhoorSound)
                out += Ev(t[P.MAGHRIB].minusMinutes(pr.iftarBefore.toLong()), "iftar", P.MAGHRIB, Snd.NOTIFY, extra = t[P.MAGHRIB].toInstant().toEpochMilli())
            }
            // the evening before the 13th: ask whether to fast the white days
            if (pr.beed && h.day == 12 && !pr.beedAccepted(key) && !pr.beedDeclined(key))
                out += Ev(t[P.ISHA].plusMinutes(10), "beedask", text = key)
            // before / after each prayer
            for (p in FIVE) {
                if (pr.before(p) > 0) out += Ev(t[p].minusMinutes(pr.before(p).toLong()), "custom", p, pr.prePostSound, Tr.num(pr.before(p)) + " " + Tr["min"] + " " + Tr["before"] + " " + Tr.p(p))
                if (pr.after(p) > 0) out += Ev(t[p].plusMinutes(pr.after(p).toLong()), "custom", p, pr.prePostSound, Tr.num(pr.after(p)) + " " + Tr["min"] + " " + Tr["after"] + " " + Tr.p(p))
            }
            // takbirat (Snd.TAKBIRAT): Eid al-Fitr from Maghrib of its night until the Eid prayer; the ten days of Dhul-Hijjah now and then;
            // after each prayer from Fajr of Arafah to Asr of the 13th
            val tk = Snd.TAKBIRAT
            if (pr.takbirFitr) {
                if (Schedule.hijriOf(pr, d.plusDays(1)).let { it.month == 10 && it.day == 1 }) {
                    out += Ev(t[P.MAGHRIB].plusMinutes(5), "custom", P.MAGHRIB, tk, Tr["takbirFitr"]); out += Ev(t[P.ISHA].plusMinutes(15), "custom", P.ISHA, tk, Tr["takbirFitr"])
                }
                if (h.month == 10 && h.day == 1) { out += Ev(t[P.FAJR].plusMinutes(20), "custom", P.FAJR, tk, Tr["takbirFitr"]); out += Ev(t[P.SUNRISE].plusMinutes(10), "custom", P.SUNRISE, tk, Tr["takbirFitr"]) }
            }
            if (h.month == 12) {
                val afterPrayers = pr.takbirTashreeq && h.day in 9..13
                if (pr.takbirHijjah && h.day in 1..13 && !afterPrayers) {
                    out += Ev(t[P.SUNRISE].plusMinutes(90), "custom", P.SUNRISE, tk, Tr["takbirHijjah"]); out += Ev(t[P.ASR].plusMinutes(30), "custom", P.ASR, tk, Tr["takbirHijjah"])
                }
                if (afterPrayers) for (p in FIVE) if (!(h.day == 13 && (p == P.MAGHRIB || p == P.ISHA)))
                    out += Ev(t[p].plusMinutes(10), "custom", p, tk, Tr["takbirAfter"])
            }
            // morning and evening adhkar (a notification)
            if (pr.azkarMorning) out += Ev(t[P.FAJR].plusMinutes(25), "custom", P.FAJR, Snd.NOTIFY, Tr["azkarM"])
            if (pr.azkarEvening) out += Ev(t[P.ASR].plusMinutes(30), "custom", P.ASR, Snd.NOTIFY, Tr["azkarE"])
            // the user's own events in the calendar
            for (c in pr.events) if (c.on && c.on(d, h)) {
                val at = if (c.base != null) t[c.base].plusMinutes(c.offset.toLong()) else d.atStartOfDay(zone).plusMinutes(maxOf(0, c.atMin).toLong())
                out += Ev(at, "custom", c.base, c.sound, c.label.ifEmpty { Tr["event"] }, c.id)
            }
            // the user's own reminders
            for (r in pr.reminders) if (r.on && (r.days shr (dow.value - 1)) and 1 == 1) for (b in r.bases)
                out += Ev(t[b].plusMinutes(r.minutes.toLong()), "custom", b, r.sound, r.label.ifEmpty { Tr.num(kotlin.math.abs(r.minutes)) + " " + Tr["min"] + " " + (if (r.minutes < 0) Tr["before"] else Tr["after"]) + " " + Tr.p(b) }, r.id)
            // the widget shows the next prayer: refresh at each prayer and at midnight
            for (p in listOf(P.FAJR, P.SUNRISE, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)) { out += Ev(t[p], "widget"); out += Ev(t[p].plusMinutes(30), "widget") }
            out += Ev(d.plusDays(1).atStartOfDay(zone).plusMinutes(1), "widget")
        }
        return out.sortedBy { it.at }
    }
}

object Alarms {
    const val CH_ADHAN = "adhan"; const val CH_REM = "reminders_quiet"; const val CH_NEXT = "next_prayer"; const val CH_ALARM = "suhoor"; const val CH_IFTAR = "iftar"

    fun channels(ctx: Context) {
        val nm = ctx.getSystemService(NotificationManager::class.java)
        Tr.lang = Prefs(ctx).lang.ifEmpty { "en" }
        nm.createNotificationChannel(NotificationChannel(CH_ADHAN, Tr["prayerTime"], NotificationManager.IMPORTANCE_HIGH).apply { setSound(null, null) })
        // reminders without a sound of their own: a notification with vibration only (no bell)
        nm.createNotificationChannel(NotificationChannel(CH_REM, Tr["remTitle"], NotificationManager.IMPORTANCE_HIGH).apply { setSound(null, null); enableVibration(true) })
        nm.createNotificationChannel(NotificationChannel(CH_NEXT, Tr["nextPrayer"], NotificationManager.IMPORTANCE_LOW).apply { setShowBadge(false) })
        runCatching { nm.deleteNotificationChannel("reminders") }
        nm.createNotificationChannel(NotificationChannel(CH_ALARM, Tr["suhoor"], NotificationManager.IMPORTANCE_HIGH).apply { setSound(null, null) })
        nm.createNotificationChannel(NotificationChannel(CH_IFTAR, Tr["iftar"], NotificationManager.IMPORTANCE_HIGH))
    }

    private fun pi(ctx: Context): PendingIntent =
        PendingIntent.getBroadcast(ctx, 1, Intent(ctx, AlarmReceiver::class.java).setAction("org.turath.salat.TICK"),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

    /** set the one system alarm for the next thing due */
    fun schedule(ctx: Context) {
        val now = ZonedDateTime.now()
        val next = Events.list(ctx, now).firstOrNull { it.at.isAfter(now.plusSeconds(2)) } ?: return
        val am = ctx.getSystemService(AlarmManager::class.java)
        val ms = next.at.toInstant().toEpochMilli()
        val canExact = Build.VERSION.SDK_INT < 31 || am.canScheduleExactAlarms()
        try {
            if (next.kind == "suhoor" && canExact)
                am.setAlarmClock(AlarmManager.AlarmClockInfo(ms, PendingIntent.getActivity(ctx, 2, Intent(ctx, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)), pi(ctx))
            else if (canExact) am.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, ms, pi(ctx))
            else am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, ms, pi(ctx))
        } catch (e: SecurityException) {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, ms, pi(ctx))
        }
        Widget.update(ctx)
    }

    /** do everything that has become due (since the last run, at most 10 minutes back), then set the next alarm */
    fun fire(ctx: Context) {
        val pr = Prefs(ctx)
        val now = ZonedDateTime.now()
        val last = pr.sp.getLong("lastDone", 0)
        val lo = maxOf(last, now.minusMinutes(10).toInstant().toEpochMilli())
        val due = Events.list(ctx, now.minusMinutes(15), 2).filter { val m = it.at.toInstant().toEpochMilli(); m > lo && m <= now.toInstant().toEpochMilli() + 3000 }
        pr.sp.edit().putLong("lastDone", now.toInstant().toEpochMilli() + 3000).apply()
        // one sound at a time: the prayer's adhan wins over a reminder at the same minute
        val sound = due.filter { it.snd != Snd.SILENT && it.snd != Snd.NOTIFY && it.kind != "iftar" && it.kind != "widget" }.minByOrNull { listOf("suhoor", "prayer", "nafl", "custom").indexOf(it.kind).let { i -> if (i < 0) 9 else i } }
        for (e in due) handle(ctx, pr, e, e === sound)
        schedule(ctx)
    }

    private fun handle(ctx: Context, pr: Prefs, e: Ev, playSound: Boolean) {
        Tr.lang = pr.lang.ifEmpty { "en" }
        val nm = ctx.getSystemService(NotificationManager::class.java)
        val open = PendingIntent.getActivity(ctx, 3, Intent(ctx, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)
        val place = pr.place
        when (e.kind) {
            "prayer", "nafl", "custom", "suhoor" -> {
                val title = when (e.kind) {
                    "prayer" -> Tr.p(e.p!!) + " — " + Tr["prayerTime"]
                    "nafl" -> Tr.p(e.p!!) + " — " + Tr["naflRem"]
                    "suhoor" -> Tr["suhoorTitle"]
                    else -> e.text.ifEmpty { Tr["remTitle"] }
                }
                val body = when (e.kind) {
                    "suhoor" -> if (place != null) Tr["suhoorEnds"] + " " + fmt(pr, Schedule.day(pr, place, e.at.toLocalDate().let { if (e.at.hour >= 12) it.plusDays(1) else it })[P.FAJR]) else ""
                    else -> place?.name ?: ""
                }
                // the phone on silent / vibrate: only a notification, unless the adhan is wanted then too (suhoor alarm always rings)
                val quiet = Audio.silentNow(ctx) && e.kind != "suhoor" && !pr.adhanInSilent
                if (playSound && !quiet) SoundService.start(ctx, e.snd, title, body, e.kind == "suhoor", e.p == P.FAJR && e.kind == "prayer")
                else {
                    val ch = if (e.snd == Snd.NOTIFY) CH_REM else CH_ADHAN
                    nm.notify(e.kind.hashCode() + (e.p?.ordinal ?: 0), Notification.Builder(ctx, ch).setSmallIcon(R.drawable.ic_stat)
                        .setContentTitle(title).setContentText(body).setContentIntent(open).setAutoCancel(true).build())
                }
            }
            "iftar" -> {
                // a countdown to maghrib with the du'a of iftar
                val n = Notification.Builder(ctx, CH_IFTAR).setSmallIcon(R.drawable.ic_stat)
                    .setContentTitle(Tr["duaTime"]).setContentText(Tr["iftarDua"])
                    .setStyle(Notification.BigTextStyle().bigText(Tr["iftarDua"] + "\n" + Tr["iftarDuaSrc"]))
                    .setWhen(e.extra).setShowWhen(true).setUsesChronometer(true).setChronometerCountDown(true)
                    .setTimeoutAfter(e.extra - System.currentTimeMillis() + 10 * 60_000).setContentIntent(open).setAutoCancel(true).build()
                nm.notify(4001, n)
            }
            "beedask" -> {
                fun act(yes: Boolean) = PendingIntent.getBroadcast(ctx, if (yes) 11 else 12,
                    Intent(ctx, ActionReceiver::class.java).setAction(if (yes) "BEED_YES" else "BEED_NO").putExtra("key", e.text),
                    PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
                nm.notify(4002, Notification.Builder(ctx, CH_REM).setSmallIcon(R.drawable.ic_stat)
                    .setContentTitle(Tr["beedAsk"]).setContentText(Tr["beed"]).setContentIntent(open)
                    .addAction(Notification.Action.Builder(null, Tr["accept"], act(true)).build())
                    .addAction(Notification.Action.Builder(null, Tr["decline"], act(false)).build()).setAutoCancel(true).build())
            }
            "vibon" -> Vibrate.on(ctx, pr)
            "viboff" -> Vibrate.off(ctx, pr)
            "widget" -> Widget.update(ctx)
        }
    }

    fun fmt(pr: Prefs, t: ZonedDateTime): String {
        val h = t.hour; val m = t.minute
        val s = if (pr.h24) "%02d:%02d".format(h, m) else "%d:%02d %s".format(if (h % 12 == 0) 12 else h % 12, m,
            when (Tr.lang) { "ur" -> if (h < 12) "صبح" else "شام"; "ar" -> if (h < 12) "ص" else "م"; else -> if (h < 12) "am" else "pm" })
        return Tr.num(s)
    }
}

/** which phone volume the sounds follow (the user's choice: media, ring or alarm volume) */
object Audio {
    fun usage(pr: Prefs) = when (pr.volStream) { "ring" -> AudioAttributes.USAGE_NOTIFICATION_RINGTONE; "alarm" -> AudioAttributes.USAGE_ALARM; else -> AudioAttributes.USAGE_MEDIA }
    fun stream(pr: Prefs) = when (pr.volStream) { "ring" -> AudioManager.STREAM_RING; "alarm" -> AudioManager.STREAM_ALARM; else -> AudioManager.STREAM_MUSIC }
    /** `alarm`: the suhoor alarm, or the adhan wanted on a silent phone — at the alarm volume */
    fun attrs(ctx: Context, alarm: Boolean = false): AudioAttributes = AudioAttributes.Builder()
        .setUsage(if (alarm) AudioAttributes.USAGE_ALARM else usage(Prefs(ctx))).setContentType(AudioAttributes.CONTENT_TYPE_MUSIC).build()
    fun silentNow(ctx: Context) = ctx.getSystemService(AudioManager::class.java).ringerMode != AudioManager.RINGER_MODE_NORMAL
}

/** a sound heard in the app before choosing it (at the volume the adhan will have) */
object Preview {
    private var mp: MediaPlayer? = null
    var playing: Snd? = null; private set
    fun play(ctx: Context, s: Snd, fajr: Boolean = false, done: () -> Unit = {}) {
        stop()
        val u = SoundService.uri(ctx, s, fajr) ?: return
        playing = s
        mp = runCatching {
            MediaPlayer().apply {
                setAudioAttributes(Audio.attrs(ctx)); setDataSource(ctx, u)
                setOnCompletionListener { stop(); done() }
                prepare(); start()
            }
        }.getOrNull()
    }
    fun playUri(ctx: Context, u: Uri) {
        stop()
        mp = runCatching { MediaPlayer().apply { setAudioAttributes(Audio.attrs(ctx)); setDataSource(ctx, u); setOnCompletionListener { stop() }; prepare(); start() } }.getOrNull()
    }
    fun stop() { runCatching { mp?.stop() }; mp?.release(); mp = null; playing = null }
}

/** the phone on vibrate at prayer time, back to ringing afterwards (only if the app put it on vibrate) */
object Vibrate {
    fun on(ctx: Context, pr: Prefs) {
        val am = ctx.getSystemService(AudioManager::class.java)
        if (am.ringerMode != AudioManager.RINGER_MODE_NORMAL) return
        try { am.ringerMode = AudioManager.RINGER_MODE_VIBRATE; pr.sp.edit().putBoolean("vibByApp", true).apply() } catch (e: SecurityException) {}
    }
    fun off(ctx: Context, pr: Prefs) {
        if (!pr.sp.getBoolean("vibByApp", false)) return
        val am = ctx.getSystemService(AudioManager::class.java)
        try { if (am.ringerMode == AudioManager.RINGER_MODE_VIBRATE) am.ringerMode = AudioManager.RINGER_MODE_NORMAL } catch (e: SecurityException) {}
        pr.sp.edit().putBoolean("vibByApp", false).apply()
    }
    fun allowed(ctx: Context) = ctx.getSystemService(NotificationManager::class.java).isNotificationPolicyAccessGranted
}

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, i: Intent) {
        val r = goAsync()
        Thread { try { Alarms.fire(ctx) } finally { r.finish() } }.start()
    }
}

/** after a restart, a change of time or time zone, or an app update: set the alarm again */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, i: Intent) {
        Prefs(ctx).sp.edit().putLong("lastDone", System.currentTimeMillis()).apply()
        Alarms.channels(ctx); Alarms.schedule(ctx); Durood.start(ctx)
    }
}

class ActionReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, i: Intent) {
        when (i.action) {
            "BEED_YES", "BEED_NO" -> {
                Prefs(ctx).setBeed(i.getStringExtra("key") ?: return, i.action == "BEED_YES")
                ctx.getSystemService(NotificationManager::class.java).cancel(4002)
                Alarms.schedule(ctx)
            }
            "STOP" -> ctx.stopService(Intent(ctx, SoundService::class.java))
        }
    }
}

/** plays the adhan / alarm / birds with a notification that has a stop button */
class SoundService : Service() {
    private var mp: MediaPlayer? = null
    private var until = 0L

    companion object {
        fun start(ctx: Context, s: Snd, title: String, body: String, alarm: Boolean, fajr: Boolean = false) {
            val i = Intent(ctx, SoundService::class.java).putExtra("snd", s.name).putExtra("title", title).putExtra("body", body).putExtra("alarm", alarm).putExtra("fajr", fajr)
            ctx.startForegroundService(i)
        }

        /** the app's own file for a sound (its Fajr version for Fajr), 0 when the app does not have it */
        fun rawId(ctx: Context, s: Snd, fajr: Boolean = false): Int {
            val r = s.raw ?: return 0
            if (fajr) ctx.resources.getIdentifier(r + "_fajr", "raw", ctx.packageName).let { if (it != 0) return it }
            return ctx.resources.getIdentifier(r, "raw", ctx.packageName)
        }

        /** the sounds that can be chosen here (only those whose recording is in the app; no phone ringtones or bells):
         *  the five prayers — adhans only; nafl times — iqamah, calls and birds; reminders / alarms — calls and birds */
        fun choices(ctx: Context, use: SndUse, fajr: Boolean = false): List<Snd> {
            val ok = Snd.entries.filter { it.raw != null && rawId(ctx, it, fajr) != 0 }
            val l = when (use) {
                SndUse.PRAYER -> ok.filter { it.adhan }
                SndUse.NAFL -> ok.filter { !it.adhan }
                SndUse.REMINDER -> ok.filter { !it.adhan && it.phrase != "iqama" } + Snd.NOTIFY
            }
            val order = listOf("makkah", "madinah", "other", "birds", "phone")
            return l.sortedBy { order.indexOf(it.city) * 10 + (if (it.adhan) 0 else if (it.short) 1 else 2) }
        }

        /** the sound file of the app, or null when that sound is not (yet) in the app */
        fun uri(ctx: Context, s: Snd, fajr: Boolean = false): Uri? {
            val id = rawId(ctx, s, fajr)
            // no phone ringtone: a missing recording falls back to «حي على الصلاة»
            return when {
                id != 0 -> Uri.parse("android.resource://${ctx.packageName}/$id")
                s == Snd.SILENT || s == Snd.NOTIFY -> null
                else -> rawId(ctx, Snd.SHORT_HAYYA).takeIf { it != 0 }?.let { Uri.parse("android.resource://${ctx.packageName}/$it") }
            }
        }
    }

    override fun onBind(i: Intent?): IBinder? = null

    override fun onStartCommand(i: Intent?, flags: Int, startId: Int): Int {
        if (i == null) { stopSelf(); return START_NOT_STICKY }
        Tr.lang = Prefs(this).lang.ifEmpty { "en" }
        val alarm = i.getBooleanExtra("alarm", false)
        val stop = PendingIntent.getBroadcast(this, 20, Intent(this, ActionReceiver::class.java).setAction("STOP"), PendingIntent.FLAG_IMMUTABLE)
        val open = PendingIntent.getActivity(this, 21, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)
        val n = Notification.Builder(this, if (alarm) Alarms.CH_ALARM else Alarms.CH_ADHAN).setSmallIcon(R.drawable.ic_stat)
            .setContentTitle(i.getStringExtra("title")).setContentText(i.getStringExtra("body"))
            .setContentIntent(open).setDeleteIntent(stop)
            .addAction(Notification.Action.Builder(null, Tr["stop"], stop).build())
            .apply { if (alarm) setFullScreenIntent(open, true).setCategory(Notification.CATEGORY_ALARM) }
            .build()
        if (Build.VERSION.SDK_INT >= 29) startForeground(77, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK) else startForeground(77, n)
        val s = runCatching { Snd.valueOf(i.getStringExtra("snd") ?: "") }.getOrDefault(Snd.TONE)
        play(s, alarm, i.getBooleanExtra("fajr", false))
        return START_NOT_STICKY
    }

    private fun play(s: Snd, alarm: Boolean, fajr: Boolean) {
        mp?.release(); mp = null
        val u = uri(this, s, fajr) ?: run { stopSelf(); return }
        // the suhoor alarm repeats for up to 3 minutes; the phone's own tone at most 40 seconds; an adhan plays once
        val own = rawId(this, s, fajr)
        until = System.currentTimeMillis() + when { alarm -> 180_000L; own == 0 -> 40_000L; else -> 600_000L }
        try {
            mp = MediaPlayer().apply {
                setAudioAttributes(Audio.attrs(this@SoundService, alarm || Audio.silentNow(this@SoundService)))
                setDataSource(this@SoundService, u)
                isLooping = alarm || own == 0
                setOnCompletionListener { stopSelf() }
                setOnErrorListener { _, _, _ -> stopSelf(); true }
                prepare(); start()
            }
            Thread { while (mp != null && System.currentTimeMillis() < until) Thread.sleep(500); if (mp != null) stopSelf() }.start()
        } catch (e: Exception) { stopSelf() }
    }

    override fun onDestroy() { mp?.release(); mp = null; super.onDestroy() }
}
