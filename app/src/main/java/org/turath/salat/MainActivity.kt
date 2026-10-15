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

class MainActivity : ComponentActivity() {
    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        enableEdgeToEdge()
        Alarms.channels(this)
        setContent { App(this) }
    }

    override fun onResume() {
        super.onResume()
        Thread { Alarms.schedule(this) }.start()
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
