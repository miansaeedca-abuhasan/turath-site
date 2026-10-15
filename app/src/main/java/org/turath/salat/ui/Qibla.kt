package org.turath.salat.ui

import android.content.Context
import android.hardware.*
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.turath.salat.*
import kotlin.math.*

/** bearing (degrees from true north) from a place to the Ka'bah, on the great circle */
fun qiblaBearing(lat: Double, lng: Double): Double {
    val k = Math.toRadians(21.422487); val kl = Math.toRadians(39.826206)
    val a = Math.toRadians(lat); val l = Math.toRadians(lng)
    val b = atan2(sin(kl - l), cos(a) * tan(k) - sin(a) * cos(kl - l))
    return (Math.toDegrees(b) + 360) % 360
}

@Composable
fun QiblaScreen(s: AppState) {
    val place = s.prefs.place ?: return
    val ctx = s.act
    val q = qiblaBearing(place.lat, place.lng)
    var heading by remember { mutableFloatStateOf(0f) }
    var acc by remember { mutableIntStateOf(3) }
    var has by remember { mutableStateOf(true) }
    var wasOn by remember { mutableStateOf(false) }
    val decl = remember { GeomagneticField(place.lat.toFloat(), place.lng.toFloat(), 0f, System.currentTimeMillis()).declination }
    DisposableEffect(Unit) {
        val sm = ctx.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val rv = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
        val mag = sm.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
        has = rv != null
        val m = FloatArray(9); val o = FloatArray(3)
        var smooth = Float.NaN
        val l = object : SensorEventListener {
            override fun onSensorChanged(e: SensorEvent) {
                if (e.sensor.type != Sensor.TYPE_ROTATION_VECTOR) return
                SensorManager.getRotationMatrixFromVector(m, e.values)
                SensorManager.getOrientation(m, o)
                val az = ((Math.toDegrees(o[0].toDouble()) + decl + 360) % 360).toFloat()   // true north
                // smooth the needle (shortest way round)
                smooth = if (smooth.isNaN()) az else { var d = az - smooth; if (d > 180) d -= 360; if (d < -180) d += 360; (smooth + d * .15f + 360) % 360 }
                heading = smooth
            }
            override fun onAccuracyChanged(sn: Sensor, a: Int) { if (sn.type == Sensor.TYPE_MAGNETIC_FIELD || sn.type == Sensor.TYPE_ROTATION_VECTOR) acc = a }
        }
        rv?.let { sm.registerListener(l, it, SensorManager.SENSOR_DELAY_UI) }
        mag?.let { sm.registerListener(l, it, SensorManager.SENSOR_DELAY_NORMAL) }
        onDispose { sm.unregisterListener(l) }
    }
    var diff = (q - heading).toFloat(); if (diff > 180) diff -= 360; if (diff < -180) diff += 360
    val on = abs(diff) < 3
    LaunchedEffect(on) {
        if (on && !wasOn) (ctx.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator)?.vibrate(VibrationEffect.createOneShot(60, VibrationEffect.DEFAULT_AMPLITUDE))
        wasOn = on
    }
    Column(Modifier.fillMaxSize().statusBarsPadding().padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        Text(Tr["tQibla"], fontSize = 28.sp, fontWeight = FontWeight.Bold, modifier = Modifier.fillMaxWidth())
        Text(Tr["qiblaDeg"] + ": " + Tr.num("%.1f°".format(q)) + " " + Tr["fromNorth"], fontSize = 16.sp)
        Text(Tr["distance"] + ": " + Tr.num("%,d".format(Cities.dist(place.lat, place.lng, 21.422487, 39.826206).roundToInt())) + " " + Tr["km"],
            fontSize = 14.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f))
        Spacer(Modifier.height(16.dp))
        if (!has) { Text(Tr["noCompass"], color = Color(0xFFB3261E)); return@Column }
        val green = Color(0xFF2E9E5B)
        val ink = MaterialTheme.colorScheme.onBackground
        Box(Modifier.fillMaxWidth().aspectRatio(1f), contentAlignment = Alignment.Center) {
            Canvas(Modifier.fillMaxSize()) {
                val c = Offset(size.width / 2, size.height / 2); val r = size.minDimension / 2 - 12.dp.toPx()
                // the dial turns so that north stays north
                rotate(-heading, c) {
                    drawCircle(if (on) green.copy(alpha = .12f) else ink.copy(alpha = .05f), r, c)
                    drawCircle(ink.copy(alpha = .25f), r, c, style = Stroke(2.dp.toPx()))
                    for (i in 0 until 72) {
                        val a = Math.toRadians(i * 5.0 - 90); val long = i % 6 == 0
                        val r1 = r - (if (long) 16 else 8).dp.toPx()
                        drawLine(ink.copy(alpha = if (long) .7f else .3f), Offset(c.x + r1 * cos(a).toFloat(), c.y + r1 * sin(a).toFloat()), Offset(c.x + r * cos(a).toFloat(), c.y + r * sin(a).toFloat()), (if (long) 2.dp else 1.dp).toPx())
                    }
                    val p = android.graphics.Paint().apply { textSize = 18.sp.toPx(); textAlign = android.graphics.Paint.Align.CENTER; isAntiAlias = true; isFakeBoldText = true }
                    listOf("N" to 0, "E" to 90, "S" to 180, "W" to 270).forEach { (t, d) ->
                        val a = Math.toRadians(d - 90.0); val rr = r - 34.dp.toPx()
                        p.color = (if (t == "N") Color(0xFFD32F2F) else ink).toArgb()
                        drawContext.canvas.nativeCanvas.drawText(t, c.x + rr * cos(a).toFloat(), c.y + rr * sin(a).toFloat() + 6.dp.toPx(), p)
                    }
                    // the Ka'bah on the dial at the qibla bearing
                    val a = Math.toRadians(q - 90); val kr = r - 58.dp.toPx(); val kc = Offset(c.x + kr * cos(a).toFloat(), c.y + kr * sin(a).toFloat())
                    val k = 15.dp.toPx()
                    rotate(heading, kc) {
                        drawRect(Color(0xFF111111), Offset(kc.x - k, kc.y - k), androidx.compose.ui.geometry.Size(2 * k, 2 * k))
                        drawRect(Gold, Offset(kc.x - k, kc.y - k * .45f), androidx.compose.ui.geometry.Size(2 * k, k * .28f))
                    }
                    drawLine(Gold.copy(alpha = .8f), c, Offset(c.x + (kr - k - 4.dp.toPx()) * cos(a).toFloat(), c.y + (kr - k - 4.dp.toPx()) * sin(a).toFloat()), 3.dp.toPx())
                }
                // the phone's direction: a fixed arrow pointing up
                val path = Path().apply { moveTo(c.x, c.y - r + 6.dp.toPx()); lineTo(c.x - 12.dp.toPx(), c.y - r + 34.dp.toPx()); lineTo(c.x + 12.dp.toPx(), c.y - r + 34.dp.toPx()); close() }
                drawPath(path, if (on) green else Color(0xFFD32F2F))
                drawCircle(if (on) green else ink, 6.dp.toPx(), c)
            }
        }
        Spacer(Modifier.height(10.dp))
        Text(if (on) Tr["qiblaOn"] else Tr.num("%+.0f°".format(diff)), fontSize = 24.sp, fontWeight = FontWeight.Bold, color = if (on) green else MaterialTheme.colorScheme.onBackground)
        if (acc < SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM) Text(Tr["accLow"], color = Color(0xFFB3261E), textAlign = TextAlign.Center)
        Text(Tr["qiblaHint"], fontSize = 13.sp, textAlign = TextAlign.Center, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f), modifier = Modifier.padding(top = 8.dp))
    }
}
