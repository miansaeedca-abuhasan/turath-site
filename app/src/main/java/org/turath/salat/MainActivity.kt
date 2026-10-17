package org.turath.salat

import android.Manifest
import android.app.AlarmManager
import android.app.NotificationManager
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.os.PowerManager
import android.provider.Settings
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.runtime.*
import org.turath.salat.ui.App

/** keeps the report of a crash (shown on the next start, to be sent by email) */
class SalatApp : android.app.Application() {
    override fun onCreate() {
        super.onCreate()
        val prev = Thread.getDefaultUncaughtExceptionHandler()
        Thread.setDefaultUncaughtExceptionHandler { t, e ->
            runCatching {
                getSharedPreferences("salat", MODE_PRIVATE).edit().putString("crash",
                    "Android " + Build.VERSION.RELEASE + " · " + Build.MANUFACTURER + " " + Build.MODEL + "\n" + android.util.Log.getStackTraceString(e).take(8000)).commit()
            }
            prev?.uncaughtException(t, e)
        }
    }
}

class MainActivity : ComponentActivity() {
    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        enableEdgeToEdge()
        Alarms.channels(this)
        Thread { runCatching { Cities.load(this) } }.start()   // the list of towns is read in the background, so that the first search is quick
        tabRequest = intent?.getIntExtra("tab", -1) ?: -1
        setContent { App(this) }
    }

    /** a tab asked for from a widget (☰ of the calendar widget opens the calendar) */
    var tabRequest by mutableIntStateOf(-1)
    override fun onNewIntent(i: Intent) { super.onNewIntent(i); setIntent(i); tabRequest = i.getIntExtra("tab", -1) }

    /** left for a while (home button, another app): the next opening starts at Today, not where the app was left; a short trip (a permission box, the phone's settings) keeps the place */
    private var stoppedAt = 0L
    override fun onStop() { super.onStop(); stoppedAt = System.currentTimeMillis() }
    override fun onStart() {
        super.onStart()
        if (stoppedAt != 0L && System.currentTimeMillis() - stoppedAt > 20_000 && tabRequest < 0) tabRequest = 0
    }

    override fun onResume() {
        super.onResume()
        Thread { runCatching { Alarms.schedule(this) } }.start()
        volumeControlStream = Audio.stream(Prefs(this))
        runCatching { Durood.start(this) }
    }

    // permissions the alarms need (asked from the settings screen and after choosing the city)
    fun needNotifications() = Build.VERSION.SDK_INT >= 33 && checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED
    fun askNotifications() { if (Build.VERSION.SDK_INT >= 33) requestPermissions(arrayOf(Manifest.permission.POST_NOTIFICATIONS), 1) }
    fun needExact() = Build.VERSION.SDK_INT >= 31 && !getSystemService(AlarmManager::class.java).canScheduleExactAlarms()
    fun askExact() { if (Build.VERSION.SDK_INT >= 31) startActivity(Intent(Settings.ACTION_REQUEST_SCHEDULE_EXACT_ALARM, Uri.parse("package:$packageName"))) }
    fun needBattery() = !getSystemService(PowerManager::class.java).isIgnoringBatteryOptimizations(packageName)
    fun askBattery() = runCatching { startActivity(Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS, Uri.parse("package:$packageName"))) }
    fun needDnd() = !getSystemService(NotificationManager::class.java).isNotificationPolicyAccessGranted
    fun askDnd() = startActivity(Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS))
    fun askLocation() = requestPermissions(arrayOf(Manifest.permission.ACCESS_COARSE_LOCATION, Manifest.permission.ACCESS_FINE_LOCATION), 2)
    fun hasLocation() = checkSelfPermission(Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED

    var onPermResult: (() -> Unit)? = null
    override fun onRequestPermissionsResult(code: Int, perms: Array<String>, res: IntArray) {
        super.onRequestPermissionsResult(code, perms, res); onPermResult?.invoke()
    }
}
