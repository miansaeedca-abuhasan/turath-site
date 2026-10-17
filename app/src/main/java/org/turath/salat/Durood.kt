package org.turath.salat

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.content.pm.ServiceInfo
import android.media.AudioManager
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.IBinder

/**
 * Each time the phone is unlocked: a gentle reminder to send salawat on the Prophet (a recorded human voice only,
 * no computer voice): the app's recordings durood_1 … durood_10 in res/raw, and the files the user chose from the phone.
 * Not when the phone is on silent / vibrate (prayer time) or during a call; at most once every few minutes (setting).
 */
object Durood {
    /** the app's recordings durood_1 … durood_10 (the same voice), in this order */
    val PHRASES = listOf(
        "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ",
        "صَلِّ عَلَى النَّبِيِّ",
        "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
        "صَلِّ عَلَى رَسُولِ اللَّهِ",
        "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
        "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ عَبْدِكَ وَرَسُولِكَ",
        "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
        "اللَّهُمَّ صَلِّ عَلَى نَبِيِّنَا مُحَمَّدٍ",
        "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ النَّبِيِّ الْأُمِّيِّ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلِّمْ",
        "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَأَزْوَاجِهِ وَذُرِّيَّتِهِ",
    )

    /** the recordings the user chose (all by default) */
    fun chosen(pr: Prefs): Set<Int> = pr.sp.getString("duroodSel", null)?.split(',')?.mapNotNull { it.toIntOrNull() }?.toSet() ?: PHRASES.indices.toSet()
    fun setChosen(pr: Prefs, v: Set<Int>) = pr.sp.edit().putString("duroodSel", v.sorted().joinToString(",")).apply()
    fun rawUri(ctx: Context, i: Int): Uri? = ctx.resources.getIdentifier("durood_${i + 1}", "raw", ctx.packageName).takeIf { it != 0 }?.let { Uri.parse("android.resource://${ctx.packageName}/$it") }

    fun on(pr: Prefs) = pr.sp.getBoolean("durood", true)
    fun gapMinutes(pr: Prefs) = pr.sp.getInt("duroodGap", 5)

    /** the recordings to play: the app's chosen ones, then the user's own */
    fun sources(ctx: Context): List<Uri> { val pr = Prefs(ctx)
        return chosen(pr).sorted().mapNotNull { rawUri(ctx, it) } + pr.duroodFiles.map { Uri.parse(it) } }

    fun start(ctx: Context) {
        if (!on(Prefs(ctx)) || sources(ctx).isEmpty()) { ctx.stopService(Intent(ctx, DuroodService::class.java)); return }
        runCatching { ctx.startForegroundService(Intent(ctx, DuroodService::class.java)) }
    }
}

class DuroodService : Service() {
    private var mp: MediaPlayer? = null

    private val rx = object : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) { if (i.action == Intent.ACTION_USER_PRESENT) remind() }
    }

    override fun onBind(i: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        val pr = Prefs(this); Tr.lang = pr.lang.ifEmpty { "en" }
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel("durood", Tr["durood"], NotificationManager.IMPORTANCE_MIN).apply { setShowBadge(false) })
        val open = PendingIntent.getActivity(this, 30, Intent(this, MainActivity::class.java).putExtra("tab", 0), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val n = Notification.Builder(this, "durood").setSmallIcon(R.drawable.ic_stat).setLargeIcon(Logo.big(this)).setContentTitle(Tr["durood"])
            .setContentText(Durood.PHRASES[0]).setContentIntent(open).setOngoing(true).build()
        if (Build.VERSION.SDK_INT >= 34) startForeground(78, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE) else startForeground(78, n)
        registerReceiver(rx, IntentFilter(Intent.ACTION_USER_PRESENT))
    }

    override fun onStartCommand(i: Intent?, flags: Int, id: Int) = START_STICKY

    private fun remind() {
        val pr = Prefs(this)
        if (!Durood.on(pr)) return
        val am = getSystemService(AudioManager::class.java)
        // silent or vibrate (the app puts the phone on vibrate at prayer time), or a call: no sound
        if (am.ringerMode != AudioManager.RINGER_MODE_NORMAL || am.mode != AudioManager.MODE_NORMAL) return
        val now = System.currentTimeMillis()
        if (now - pr.sp.getLong("duroodLast", 0) < Durood.gapMinutes(pr) * 60_000L) return
        val src = Durood.sources(this)
        if (src.isEmpty()) return
        // in turn, or one at random
        val k = if (pr.sp.getBoolean("duroodRandom", true)) (src.indices).random() else pr.sp.getInt("duroodNext", 0)
        pr.sp.edit().putLong("duroodLast", now).putInt("duroodNext", k + 1).apply()
        mp?.release()
        mp = runCatching {
            MediaPlayer().apply {
                setAudioAttributes(Audio.attrs(this@DuroodService))
                setDataSource(this@DuroodService, src[k % src.size])
                setVolume(.7f, .7f); setOnCompletionListener { it.release(); mp = null }
                prepare(); start()
            }
        }.getOrNull()
    }

    override fun onDestroy() {
        runCatching { unregisterReceiver(rx) }
        mp?.release()
        super.onDestroy()
    }
}
