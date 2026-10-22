package org.turath.salat.ui

import android.Manifest
import android.content.Context
import android.content.pm.PackageManager
import android.hardware.*
import android.os.VibrationEffect
import android.os.Vibrator
import androidx.camera.core.CameraSelector
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.PathEffect
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.rotate
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.viewinterop.AndroidView
import androidx.core.content.ContextCompat
import org.turath.salat.*
import kotlin.math.*

/** bearing (degrees from true north) from a place to the Ka'bah, on the great circle */
fun qiblaBearing(lat: Double, lng: Double): Double {
    val k = Math.toRadians(21.422487); val kl = Math.toRadians(39.826206)
    val a = Math.toRadians(lat); val l = Math.toRadians(lng)
    val b = atan2(sin(kl - l), cos(a) * tan(k) - sin(a) * cos(kl - l))
    return (Math.toDegrees(b) + 360) % 360
}

class Heading { var raw by mutableStateOf(""); var deg by mutableFloatStateOf(Float.NaN); var elev by mutableFloatStateOf(0f); var acc by mutableIntStateOf(3); var clash by mutableStateOf(false); var has by mutableStateOf(true) }

/** the direction the phone points to (true north): lying flat — its top; held upright — its camera */
@Composable
fun rememberHeading(ctx: Context, lat: Double, lng: Double, upright: Boolean): Heading {
    val h = remember(upright) { Heading() }
    val corr = remember { Prefs(ctx) }
    val decl = remember { GeomagneticField(lat.toFloat(), lng.toFloat(), 0f, System.currentTimeMillis()).declination }
    // the sensors only while the app is on the screen: leaving it (home, another app, the screen off) stops them, and with them the vibration
    val owner = androidx.lifecycle.compose.LocalLifecycleOwner.current
    DisposableEffect(upright, owner) {
        val sm = ctx.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        val rv = sm.getDefaultSensor(Sensor.TYPE_ROTATION_VECTOR)
        val acc = sm.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        val mag = sm.getDefaultSensor(Sensor.TYPE_MAGNETIC_FIELD)
        h.has = rv != null || (acc != null && mag != null)
        val grv = sm.getDefaultSensor(Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR)
        val mR = FloatArray(9); val mG = FloatArray(9); val mA = FloatArray(9); val r = FloatArray(9); val o = FloatArray(3)
        var hasR = false; var hasGv = false; var hasAm = false
        val g = FloatArray(3); val b = FloatArray(3); var hasG = false
        var smooth = Float.NaN
        var n = 0
        // the direction the phone points to, in degrees from magnetic north, from one of the three matrices
        fun azOf(mx: FloatArray): Float {
            if (upright) SensorManager.remapCoordinateSystem(mx, SensorManager.AXIS_X, SensorManager.AXIS_Z, r) else System.arraycopy(mx, 0, r, 0, 9)
            SensorManager.getOrientation(r, o)
            return ((Math.toDegrees(o[0].toDouble()) + 720) % 360).toFloat()
        }
        fun push() {
            val want = 0
            val use = when { want == 1 && hasGv -> mG; want == 2 && hasAm -> mA; hasR -> mR; hasGv -> mG; else -> mA }
            val dd = decl
            val az = ((azOf(use) + dd + corr.qiblaOffset + 720) % 360).toFloat()
            h.elev = Math.toDegrees(Math.asin((-use[8]).toDouble().coerceIn(-1.0, 1.0))).toFloat()
            smooth = if (smooth.isNaN()) az else { var d = az - smooth; if (d > 180) d -= 360; if (d < -180) d += 360; (smooth + d * .12f + 360) % 360 }
            h.deg = smooth
            if (n % 12 == 5 && hasR && hasAm) { var d = abs(azOf(mR) - azOf(mA)); if (d > 180) d = 360 - d; h.clash = d > 15f }
            if (++n % 12 == 0) {
                fun f(ok: Boolean, mx: FloatArray) = if (ok) "%.0f°".format(azOf(mx)) else "—"
                h.raw = "RV " + f(hasR, mR) + "  ·  GRV " + f(hasGv, mG) + "  ·  A+M " + f(hasAm, mA) + "  ·  " + "%.0f°".format(decl)
            }
        }
        val l = object : SensorEventListener {
            override fun onSensorChanged(e: SensorEvent) {
                when (e.sensor.type) {
                    Sensor.TYPE_ROTATION_VECTOR -> { SensorManager.getRotationMatrixFromVector(mR, e.values); hasR = true; push() }
                    Sensor.TYPE_GEOMAGNETIC_ROTATION_VECTOR -> { SensorManager.getRotationMatrixFromVector(mG, e.values); hasGv = true; if (!hasR) push() }
                    Sensor.TYPE_ACCELEROMETER -> { System.arraycopy(e.values, 0, g, 0, 3); hasG = true }
                    Sensor.TYPE_MAGNETIC_FIELD -> {
                        System.arraycopy(e.values, 0, b, 0, 3)
                        if (hasG && SensorManager.getRotationMatrix(mA, null, g, b)) { hasAm = true; if (!hasR && !hasGv) push() }
                    }
                }
            }
            override fun onAccuracyChanged(sn: Sensor, a: Int) { if (sn.type == Sensor.TYPE_MAGNETIC_FIELD) h.acc = a }
        }
        var on = false
        fun start() {
            if (on) return; on = true
            rv?.let { sm.registerListener(l, it, SensorManager.SENSOR_DELAY_GAME) }
            grv?.let { sm.registerListener(l, it, SensorManager.SENSOR_DELAY_GAME) }
            mag?.let { sm.registerListener(l, it, SensorManager.SENSOR_DELAY_GAME) }
            acc?.let { sm.registerListener(l, it, SensorManager.SENSOR_DELAY_GAME) }
        }
        fun stop() { if (on) { on = false; sm.unregisterListener(l); h.deg = Float.NaN } }
        val obs = androidx.lifecycle.LifecycleEventObserver { _, e ->
            when (e) { androidx.lifecycle.Lifecycle.Event.ON_RESUME -> start(); androidx.lifecycle.Lifecycle.Event.ON_PAUSE -> stop(); else -> {} }
        }
        if (owner.lifecycle.currentState.isAtLeast(androidx.lifecycle.Lifecycle.State.RESUMED)) start()
        owner.lifecycle.addObserver(obs)
        onDispose { owner.lifecycle.removeObserver(obs); stop() }
    }
    return h
}

fun angleDiff(a: Double, b: Float): Float { var d = (a - b).toFloat(); while (d > 180) d -= 360; while (d < -180) d += 360; return d }

/** the Ka'bah: a black cube with its golden band */
fun DrawScope.kaaba(c: Offset, k: Float) {
    drawRoundRect(Color(0xFF151515), Offset(c.x - k, c.y - k), Size(2 * k, 2 * k), androidx.compose.ui.geometry.CornerRadius(k * .12f))
    drawRect(Color(0xFF26C6DA), Offset(c.x - k, c.y - k * .5f), Size(2 * k, k * .26f))
    drawRect(Color(0xFF26C6DA).copy(alpha = .8f), Offset(c.x + k * .25f, c.y - k * .05f), Size(k * .35f, k * .7f))
}

@Composable
private fun Buzz(on: Boolean, ctx: Context) {
    var was by remember { mutableStateOf(false) }
    LaunchedEffect(on) {
        if (on && !was) (ctx.getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator)?.vibrate(VibrationEffect.createOneShot(200, VibrationEffect.DEFAULT_AMPLITUDE))
        was = on
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun QiblaScreen(s: AppState) {
    var mode by remember { mutableIntStateOf(0) }
    androidx.activity.compose.BackHandler(mode == 1) { mode = 0 }
    var calib by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().statusBarsPadding()) {
        Row(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(Tr["tQibla"], fontSize = 26.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
            TextButton(onClick = { calib = true }) { Text(Tr["calibrate"]) }
        }
        // the city chosen on the Home screen (small: a complaint then shows from which city the qibla was seen)
        s.prefs.place?.let { Text(it.name, Modifier.fillMaxWidth().padding(horizontal = 12.dp), fontSize = 13.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .65f)) }
        SingleChoiceSegmentedButtonRow(Modifier.fillMaxWidth().padding(horizontal = 12.dp)) {
            SegmentedButton(mode == 0, { mode = 0 }, SegmentedButtonDefaults.itemShape(0, 2), icon = { Icon(Icons.Outlined.Explore, null) }) { Text(Tr["compass"]) }
            SegmentedButton(mode == 1, { mode = 1 }, SegmentedButtonDefaults.itemShape(1, 2), icon = { Icon(Icons.Outlined.PhotoCamera, null) }) { Text(Tr["camera"]) }
        }
        // the compass and the camera are drawn the same way in every language (the qibla must not depend on the language)
        CompositionLocalProvider(androidx.compose.ui.platform.LocalLayoutDirection provides androidx.compose.ui.unit.LayoutDirection.Ltr) {
            if (mode == 0) QiblaCompass(s) else QiblaCamera(s) { mode = 0 }
        }
    }
    if (calib) AlertDialog(onDismissRequest = { calib = false }, confirmButton = { TextButton(onClick = { calib = false }) { Text(Tr["ok"]) } },
        title = { Text(Tr["calibrate"]) },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                // the figure-8 poster: how to move the phone
                androidx.compose.foundation.Image(androidx.compose.ui.res.painterResource(org.turath.salat.R.drawable.calib_poster), null, Modifier.fillMaxWidth().clip(RoundedCornerShape(12.dp)))
                Spacer(Modifier.height(10.dp))
                Text(Tr["calibHow"])
                // if the compass is always off by the same angle (the phone's sensor, a magnetic case), the user sets the difference here
                Spacer(Modifier.height(10.dp))
                var off by remember { mutableIntStateOf(s.prefs.qiblaOffset) }
                Stepper(Tr["compassFix"], off, -180, 180, 1) { off = it; s.prefs.qiblaOffset = it }
            }
        })
}

@Composable
fun QiblaCompass(s: AppState) {
    val place = s.prefs.place ?: return
    val ctx = s.act
    val q = qiblaBearing(place.lat, place.lng)
    val h = rememberHeading(ctx, place.lat, place.lng, false)
    val head = if (h.deg.isNaN()) 0f else h.deg
    val diff = angleDiff(q, head)
    var hold by remember { mutableStateOf(false) }
    if (!h.deg.isNaN()) { if (abs(diff) < 3) hold = true else if (abs(diff) > 8) hold = false }
    val on = hold
    Buzz(on, ctx)
    val green = Color(0xFF2E9E5B)
    val ink = MaterialTheme.colorScheme.onBackground
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
        if (!h.has) { Text(Tr["noCompass"], color = Color(0xFFB3261E)); return@Column }
        Box(Modifier.fillMaxWidth().aspectRatio(1f), contentAlignment = Alignment.Center) {
            Canvas(Modifier.fillMaxSize()) {
                val c = Offset(size.width / 2, size.height / 2); val r = size.minDimension / 2 - 40.dp.toPx()
                // the dial: north stays north as the phone turns
                drawCircle(if (on) green.copy(alpha = .18f) else ink.copy(alpha = .06f), r, c)
                rotate(-head, c) {
                    for (i in 0 until 72) {
                        val a = Math.toRadians(i * 5.0 - 90); val long = i % 6 == 0
                        val r1 = r - (if (long) 14 else 7).dp.toPx()
                        drawLine(ink.copy(alpha = if (long) .6f else .25f), Offset(c.x + r1 * cos(a).toFloat(), c.y + r1 * sin(a).toFloat()), Offset(c.x + r * cos(a).toFloat(), c.y + r * sin(a).toFloat()), (if (long) 2.dp else 1.dp).toPx())
                    }
                    val p = android.graphics.Paint().apply { textSize = 16.sp.toPx(); textAlign = android.graphics.Paint.Align.CENTER; isAntiAlias = true; isFakeBoldText = true }
                    listOf("N" to 0, "E" to 90, "S" to 180, "W" to 270).forEach { (t, d) ->
                        val a = Math.toRadians(d - 90.0); val rr = r - 30.dp.toPx()
                        p.color = (if (t == "N") Color(0xFFD32F2F) else ink.copy(alpha = .7f)).toArgb()
                        rotate(head, Offset(c.x + rr * cos(a).toFloat(), c.y + rr * sin(a).toFloat())) {
                            drawContext.canvas.nativeCanvas.drawText(t, c.x + rr * cos(a).toFloat(), c.y + rr * sin(a).toFloat() + 6.dp.toPx(), p)
                        }
                    }
                }
                // the line to the Ka'bah, and the Ka'bah just outside the dial
                val a = Math.toRadians(diff - 90.0)
                val end = Offset(c.x + r * cos(a).toFloat(), c.y + r * sin(a).toFloat())
                drawLine(Color(0xFF26C6DA), c, end, 5.dp.toPx(), StrokeCap.Round)
                val kc = Offset(c.x + (r + 24.dp.toPx()) * cos(a).toFloat(), c.y + (r + 24.dp.toPx()) * sin(a).toFloat())
                kaaba(kc, 16.dp.toPx())
                // where the phone points: a fixed line to the top
                drawLine(if (on) green else ink.copy(alpha = .8f), c, Offset(c.x, c.y - r - 8.dp.toPx()), 3.dp.toPx(), StrokeCap.Round,
                    pathEffect = if (on) null else PathEffect.dashPathEffect(floatArrayOf(12f, 10f)))
                drawCircle(if (on) green else Color(0xFF26C6DA), 9.dp.toPx(), c)
                drawCircle(Color.White, 4.dp.toPx(), c)
            }
        }
        Text(if (on) Tr["qiblaOn"] else (if (diff > 0) Tr["turnRight"] else Tr["turnLeft"]) + "  " + Tr.num("%.0f°".format(abs(diff))),
            fontSize = 24.sp, fontWeight = FontWeight.Bold, color = if (on) green else MaterialTheme.colorScheme.onBackground)
        Text(Tr["qiblaDeg"] + ": " + Tr.num("%.0f°".format(q)) + " " + Tr["fromNorth"] + "  ·  " + Tr.num("%,d".format(Cities.dist(place.lat, place.lng, 21.422487, 39.826206).roundToInt())) + " " + Tr["km"],
            fontSize = 15.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .7f))
        if (h.acc < SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM || h.clash) Text(Tr["accLow"], color = Color(0xFFB3261E), textAlign = TextAlign.Center, fontSize = 13.sp)
        // a correction saved in another place does not hold here (magnetic disturbance differs from place to place)
        LaunchedEffect(Unit) {
            val sl = s.prefs.sp.getFloat("qOffLat", 999f); val sn = s.prefs.sp.getFloat("qOffLng", 999f)
            if (s.prefs.qiblaOffset != 0 && (sl > 900f || Cities.dist(place.lat, place.lng, sl.toDouble(), sn.toDouble()) > 30.0)) s.prefs.qiblaOffset = 0
        }
        var off by remember { mutableIntStateOf(s.prefs.qiblaOffset) }
        Stepper(Tr["compassFix"], off, -180, 180, 1) { off = it; s.prefs.qiblaOffset = it }
        // standing exactly towards the qibla (a mosque's wall, a known direction): one tap sets the correction
        OutlinedButton(onClick = {
            if (!h.deg.isNaN()) { var n = (q - (head - s.prefs.qiblaOffset)).roundToInt(); while (n > 180) n -= 360; while (n < -180) n += 360; s.prefs.qiblaOffset = n; off = n; s.prefs.sp.edit().putFloat("qOffLat", place.lat.toFloat()).putFloat("qOffLng", place.lng.toFloat()).apply() }
        }) { Text(Tr["setQibla"]) }
        Text(Tr["qiblaHint"], fontSize = 13.sp, textAlign = TextAlign.Center, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .55f), modifier = Modifier.padding(top = 6.dp))
    }
}

/** the camera view: hold the phone upright, the Ka'bah appears over the picture in the qibla direction */
@Composable
fun QiblaCamera(s: AppState, onClose: () -> Unit) {
    val place = s.prefs.place ?: return
    val act = s.act
    var granted by remember { mutableStateOf(ContextCompat.checkSelfPermission(act, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) }
    if (!granted) {
        Column(Modifier.fillMaxSize().padding(24.dp), horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Icon(Icons.Outlined.PhotoCamera, null, Modifier.size(64.dp), tint = MaterialTheme.colorScheme.primary)
            Text(Tr["cameraWhy"], textAlign = TextAlign.Center, modifier = Modifier.padding(16.dp))
            Button(onClick = {
                act.onPermResult = { granted = ContextCompat.checkSelfPermission(act, Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED }
                act.requestPermissions(arrayOf(Manifest.permission.CAMERA), 3)
            }) { Text(Tr["allow"]) }
        }
        return
    }
    val q = qiblaBearing(place.lat, place.lng)
    val h = rememberHeading(act, place.lat, place.lng, true)
    val head = if (h.deg.isNaN()) 0f else h.deg
    val diff = angleDiff(q, head)
    var locked by remember { mutableStateOf(false) }
    if (!h.deg.isNaN()) { if (abs(diff) < 4) locked = true else if (abs(diff) > 25) locked = false }
    val on = locked
    Buzz(on, act)
    val green = Color(0xFF2E9E5B)
    Box(Modifier.fillMaxSize().padding(top = 8.dp)) {
        // the camera works only while this view is on the screen and the app is in front: paused -> closed, back -> opened again
        val camObs = remember { arrayOfNulls<androidx.lifecycle.LifecycleEventObserver>(1) }
        var camErr by remember { mutableStateOf<String?>(null) }
        AndroidView(factory = { c ->
            PreviewView(c).also { pv ->
                // a texture view instead of a surface view: no black flash inside Compose on some phones
                pv.implementationMode = PreviewView.ImplementationMode.COMPATIBLE
                val fut = ProcessCameraProvider.getInstance(c)
                fut.addListener({
                    runCatching {
                        val cp = fut.get()
                        val pre = Preview.Builder().build().also { it.setSurfaceProvider(pv.surfaceProvider) }
                        fun bind() = runCatching { cp.unbindAll(); cp.bindToLifecycle(act, CameraSelector.DEFAULT_BACK_CAMERA, pre) }.onFailure { camErr = it.toString().take(160) }
                        bind()
                        val o = androidx.lifecycle.LifecycleEventObserver { _, e ->
                            when (e) { androidx.lifecycle.Lifecycle.Event.ON_PAUSE -> runCatching { cp.unbindAll() }; androidx.lifecycle.Lifecycle.Event.ON_RESUME -> bind(); else -> {} }
                        }
                        camObs[0] = o; act.lifecycle.addObserver(o)
                    }.onFailure { camErr = it.toString().take(160) }
                }, ContextCompat.getMainExecutor(c))
            }
        }, modifier = Modifier.fillMaxSize(), onRelease = {
            camObs[0]?.let { act.lifecycle.removeObserver(it) }; camObs[0] = null
            runCatching { ProcessCameraProvider.getInstance(act).get().unbindAll() }
        })
        camErr?.let { Text(it, Modifier.align(Alignment.TopCenter).padding(top = 56.dp, start = 16.dp, end = 16.dp).background(Color.Black.copy(alpha = .7f)).padding(8.dp), color = Color(0xFFFF8A80), fontSize = 12.sp) }
        // close the camera: back to the compass
        IconButton(onClick = onClose, Modifier.align(Alignment.TopEnd).padding(8.dp).background(Color.Black.copy(alpha = .55f), androidx.compose.foundation.shape.CircleShape)) {
            Icon(Icons.Outlined.Close, Tr["close"], tint = Color.White)
        }
        Canvas(Modifier.fillMaxSize()) {
            val fov = 60f                                  // about the width a phone camera sees
            val cx = size.width / 2
            // the Ka'bah hangs at the horizon: held upright it is straight ahead, tilting the phone moves it
            val ppd = size.width / fov
            val cy = (size.height * .38f + h.elev * ppd).coerceIn(size.height * .16f, size.height * .66f)
            val ring = if (on) green else Color.White
            val r0 = 34.dp.toPx()
            // the aim in the middle: the marker comes into this ring
            drawCircle(ring.copy(alpha = .9f), r0 + 14.dp.toPx(), Offset(cx, cy), style = Stroke(3.dp.toPx()))
            val inView = on || abs(diff) < fov / 2 + 5
            if (inView) {
                val x = if (on) cx else cx + diff / fov * size.width
                val rr = (if (on) 36 else 30).dp.toPx()
                val tip = Offset(x, cy + rr * 2.05f)
                val col = if (on) green else Color(0xFF26C6DA)
                // the path on the ground, from the bottom of the picture up to the marker
                val way = Path().apply {
                    moveTo(cx - 44.dp.toPx(), size.height); lineTo(cx + 44.dp.toPx(), size.height)
                    lineTo(x + 7.dp.toPx(), tip.y); lineTo(x - 7.dp.toPx(), tip.y); this.close()
                }
                drawPath(way, Brush.verticalGradient(listOf(col.copy(alpha = .6f), col.copy(alpha = .08f)), startY = tip.y, endY = size.height))
                // the marker: a dark drop with the Ka'bah in it
                val drop = Path().apply {
                    moveTo(x - rr * .82f, cy + rr * .55f); lineTo(x, tip.y); lineTo(x + rr * .82f, cy + rr * .55f); this.close()
                }
                drawPath(drop, Color(0xFF22252B))
                drawCircle(Color(0xFF22252B), rr, Offset(x, cy))
                drawCircle(col, rr, Offset(x, cy), style = Stroke(3.dp.toPx()))
                kaaba(Offset(x, cy), rr * .62f)
                // the distance, like a label hung under the marker
                val km = Tr.num("%,d".format(Cities.dist(place.lat, place.lng, 21.422487, 39.826206).roundToInt())) + " " + Tr["km"]
                val pt = android.graphics.Paint().apply { color = android.graphics.Color.WHITE; textSize = 13.sp.toPx(); isAntiAlias = true; textAlign = android.graphics.Paint.Align.CENTER }
                val w = pt.measureText(km) + 20.dp.toPx()
                drawRoundRect(Color.Black.copy(alpha = .6f), Offset(x - w / 2, tip.y + 10.dp.toPx()), Size(w, 26.dp.toPx()), androidx.compose.ui.geometry.CornerRadius(13.dp.toPx()))
                drawContext.canvas.nativeCanvas.drawText(km, x, tip.y + 28.dp.toPx(), pt)
            } else {
                // an arrow at the side the qibla is on
                val right = diff > 0
                val ax = if (right) size.width - 30.dp.toPx() else 30.dp.toPx()
                val d = if (right) 1 else -1
                val p = Path().apply { moveTo(ax + d * 18.dp.toPx(), cy); lineTo(ax - d * 10.dp.toPx(), cy - 22.dp.toPx()); lineTo(ax - d * 10.dp.toPx(), cy + 22.dp.toPx()); this.close() }
                drawPath(p, Color(0xFF26C6DA))
            }
        }
        Column(Modifier.align(Alignment.BottomCenter).padding(16.dp).clip(RoundedCornerShape(16.dp)).background(Color.Black.copy(alpha = .55f)).padding(14.dp),
            horizontalAlignment = Alignment.CenterHorizontally) {
            Text(if (on) Tr["qiblaOn"] else (if (diff > 0) Tr["turnRight"] else Tr["turnLeft"]) + "  " + Tr.num("%.0f°".format(abs(diff))),
                color = if (on) Color(0xFF7CE0A0) else Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
            if (on) TextButton(onClick = { locked = false }) { Text(Tr["searchAgain"], color = Color.White) }
            else Text(Tr["cameraHint"], color = Color.White.copy(alpha = .8f), fontSize = 13.sp, textAlign = TextAlign.Center)
            if (h.acc < SensorManager.SENSOR_STATUS_ACCURACY_MEDIUM) Text(Tr["accLow"], color = Color(0xFFFF8A80), fontSize = 13.sp, textAlign = TextAlign.Center)
        }
    }
}
