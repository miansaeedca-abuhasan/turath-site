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
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.speech.tts.TextToSpeech
import java.util.Locale

/**
 * Each time the phone is unlocked: a gentle, slow reminder to send salawat on the Prophet ﷺ («صلّوا على النبي» …).
 * Recordings durood_1 … durood_9 in res/raw are used when the app has them, otherwise the phone's Arabic voice, slowly.
 * Not when the phone is on silent / vibrate (prayer time) or during a call; at most once every few minutes (setting).
 */
object Durood {
    val PHRASES = listOf(
        "صَلُّوا عَلَى النَّبِيِّ",
        "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ",
        "اللَّهُمَّ صَلِّ وَسَلِّمْ عَلَى نَبِيِّنَا مُحَمَّدٍ",
        "صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ",
        "اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ",
    )

    fun on(pr: Prefs) = pr.sp.getBoolean("durood", true)
    fun gapMinutes(pr: Prefs) = pr.sp.getInt("duroodGap", 5)

    fun start(ctx: Context) {
        if (!on(Prefs(ctx))) { ctx.stopService(Intent(ctx, DuroodService::class.java)); return }
        runCatching { ctx.startForegroundService(Intent(ctx, DuroodService::class.java)) }
    }
}

class DuroodService : Service() {
    private var tts: TextToSpeech? = null
    private var ttsReady = false
    private var mp: MediaPlayer? = null

    private val rx = object : BroadcastReceiver() {
        override fun onReceive(c: Context, i: Intent) { if (i.action == Intent.ACTION_USER_PRESENT) remind() }
    }

    override fun onBind(i: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        val pr = Prefs(this); Tr.lang = pr.lang.ifEmpty { "ur" }
        val nm = getSystemService(NotificationManager::class.java)
        nm.createNotificationChannel(NotificationChannel("durood", Tr["durood"], NotificationManager.IMPORTANCE_MIN).apply { setShowBadge(false) })
        val open = PendingIntent.getActivity(this, 30, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)
        val n = Notification.Builder(this, "durood").setSmallIcon(R.drawable.ic_stat).setContentTitle(Tr["durood"])
            .setContentText(Durood.PHRASES[0]).setContentIntent(open).setOngoing(true).build()
        if (Build.VERSION.SDK_INT >= 34) startForeground(78, n, ServiceInfo.FOREGROUND_SERVICE_TYPE_SPECIAL_USE) else startForeground(78, n)
        registerReceiver(rx, IntentFilter(Intent.ACTION_USER_PRESENT))
        tts = TextToSpeech(this) { st ->
            if (st == TextToSpeech.SUCCESS) {
                val t = tts ?: return@TextToSpeech
                ttsReady = t.setLanguage(Locale("ar")) >= TextToSpeech.LANG_AVAILABLE
                t.setSpeechRate(0.6f); t.setPitch(0.95f)
                t.setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION).setContentType(AudioAttributes.CONTENT_TYPE_SPEECH).build())
            }
        }
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
        val k = pr.sp.getInt("duroodNext", 0)
        pr.sp.edit().putLong("duroodLast", now).putInt("duroodNext", k + 1).apply()
        // a recording of the app, if there is one
        val raws = (1..9).map { resources.getIdentifier("durood_$it", "raw", packageName) }.filter { it != 0 }
        if (raws.isNotEmpty()) {
            mp?.release()
            mp = MediaPlayer().apply {
                setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ASSISTANCE_SONIFICATION).build())
                setDataSource(this@DuroodService, Uri.parse("android.resource://$packageName/${raws[k % raws.size]}"))
                setVolume(.6f, .6f); setOnCompletionListener { it.release(); mp = null }
                prepare(); start()
            }
            return
        }
        if (ttsReady) tts?.speak(Durood.PHRASES[k % Durood.PHRASES.size], TextToSpeech.QUEUE_FLUSH,
            Bundle().apply { putFloat(TextToSpeech.Engine.KEY_PARAM_VOLUME, .6f) }, "durood")
    }

    override fun onDestroy() {
        runCatching { unregisterReceiver(rx) }
        tts?.shutdown(); mp?.release()
        super.onDestroy()
    }
}
