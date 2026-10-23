package org.turath.salat.ui

import android.graphics.Paint
import android.graphics.Typeface
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.basicMarquee
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Block
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.animation.core.animateFloat
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.turath.salat.*
import java.time.Duration
import java.time.ZonedDateTime
import java.time.format.TextStyle
import java.util.Locale
import kotlin.math.cos
import kotlin.math.sin

@OptIn(androidx.compose.foundation.ExperimentalFoundationApi::class, androidx.compose.material3.ExperimentalMaterial3Api::class)
@Composable
fun HomeScreen(s: AppState) {
    val place = s.prefs.place ?: return
    val now = s.now.withZoneSameInstant(Schedule.zone(place))
    val today = remember(now.toLocalDate(), s.version) { Schedule.day(s.prefs, place, now.toLocalDate()) }
    val st = Schedule.state(s.prefs, place, now)
    val forb = today.forbiddenAt(now)
    val cd = Countdown(now, st, today)
    val loc = Locale(Tr.lang)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding(), horizontalAlignment = Alignment.CenterHorizontally) {
        androidx.compose.foundation.Image(androidx.compose.ui.res.painterResource(org.turath.salat.R.drawable.logo), null, Modifier.padding(top = 4.dp).size(44.dp).clip(RoundedCornerShape(11.dp)))
        // a moving line between the menu and the globe: nafl times, adhkar, Friday, today's special day, the user's events
        val line = remember(now.toLocalDate(), now.hour < 12, s.version, forb?.first) { Widget.ticker(s.prefs, place, now, today) }
        Box(Modifier.fillMaxWidth().height(48.dp).padding(horizontal = 52.dp), contentAlignment = Alignment.Center) {
            if (forb != null && (forb.first == today[P.SUNRISE] || forb.first == today[P.ZAWAL])) {
                // forbidden time: the moving line stops, a red message blinks
                val blink by androidx.compose.animation.core.rememberInfiniteTransition(label = "blink").animateFloat(1f, .15f,
                    androidx.compose.animation.core.infiniteRepeatable(androidx.compose.animation.core.tween(600), androidx.compose.animation.core.RepeatMode.Reverse), label = "a")
                Text("⛔ " + Tr["prohibited"] + "  " + s.fmt(forb.first) + " – " + s.fmt(forb.second) + "   \u200E− " + hms(Duration.between(now, forb.second).seconds.coerceAtLeast(0)),
                    Modifier.fillMaxWidth().graphicsLayer { alpha = blink }, maxLines = 1, fontSize = 14.sp, fontWeight = FontWeight.Bold,
                    color = Color(0xFFD32F2F), textAlign = androidx.compose.ui.text.style.TextAlign.Center)
            } else
            Text(line, Modifier.fillMaxWidth().basicMarquee(iterations = Int.MAX_VALUE, velocity = 40.dp), maxLines = 1,
                fontSize = 13.sp, color = tickerInk(s.prefs))
        }
        Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { s.page = "city"; s.sub = "city" }) {
            Icon(if (s.prefs.placeByGps) Icons.Outlined.MyLocation else Icons.Outlined.PushPin, null, tint = MaterialTheme.colorScheme.primary)
            Text(" " + place.name, fontSize = 28.sp, fontWeight = FontWeight.Bold)
        }
        Text(if (s.prefs.placeByGps) Tr["placeGps"] else Tr["placeManual"], fontSize = 13.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .55f))
        Spacer(Modifier.height(4.dp))
        Text(now.dayOfWeek.getDisplayName(TextStyle.FULL, loc) + " · " + Tr.hijri(Schedule.hijriNow(s.prefs, place, now)), fontSize = 15.sp, color = MaterialTheme.colorScheme.primary)
        Text(Tr.num(now.toLocalDate().format(java.time.format.DateTimeFormatter.ofPattern("d MMMM yyyy", loc))), fontSize = 13.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f))
        Spacer(Modifier.height(16.dp))
        var pickClock by remember { mutableStateOf(false) }
        Box(Modifier.clip(androidx.compose.foundation.shape.CircleShape).clickable { pickClock = true }) { ClockFace(s.prefs.clockStyle, now, st, cd, 230.dp) }
        if (pickClock) ModalBottomSheet(onDismissRequest = { pickClock = false }) {
            Column(Modifier.padding(horizontal = 16.dp).padding(bottom = 28.dp)) {
                Text(Tr["pickClock"], fontWeight = FontWeight.Bold, fontSize = 18.sp, modifier = Modifier.padding(bottom = 8.dp))
                ClockPicker(s.prefs, now) { s.changed() }
            }
        }
        Spacer(Modifier.height(12.dp))
        Text(Tr.p(cd.prayer).substringBefore(" ("), fontSize = 30.sp, fontWeight = FontWeight.Bold)
        Text(s.fmt(if (cd.up) st.currentAt!! else st.nextAt), fontSize = 17.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .65f))
        Text(cd.text, fontSize = 36.sp, fontFamily = FontFamily.Monospace, color = MaterialTheme.colorScheme.primary)
        Text(if (cd.up) Tr["since"] else Tr["until"], fontSize = 12.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .55f))
        Spacer(Modifier.height(12.dp))
        // permissions the adhan needs (until they are given)
        if (s.act.needNotifications() || s.act.needExact()) Card0 {
            Text(Tr["permNotif"], fontWeight = FontWeight.Bold)
            Row {
                if (s.act.needNotifications()) TextButton(onClick = { s.act.onPermResult = { s.changed() }; s.act.askNotifications() }) { Text(Tr["allow"]) }
                if (s.act.needExact()) TextButton(onClick = { s.act.askExact() }) { Text(Tr["permAlarm"]) }
            }
        }
        if (forb != null) Banner(Icons.Filled.Block, Tr["forbidden"], Tr["forbiddenUntil"] + " " + s.fmt(forb.second), Color(0xFFB3261E))
        else if (st.current == P.ASR && now.isAfter(today[P.ASR].plusMinutes(1)) && now.isBefore(today[P.MAGHRIB].minusMinutes(15)))
            Banner(Icons.Outlined.Info, Tr["afterAsr"], "", Color(0xFF8D6E00))
        FastingCard(s, today, now)
        // the six times of today in one line
        Card0 {
            Row(Modifier.fillMaxWidth()) {
                for (p in listOf(P.FAJR, P.SUNRISE, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)) {
                    val on = p == cd.prayer
                    Column(Modifier.weight(1f).clip(RoundedCornerShape(8.dp)).background(if (on) MaterialTheme.colorScheme.primary.copy(alpha = .15f) else Color.Transparent).padding(vertical = 6.dp),
                        horizontalAlignment = Alignment.CenterHorizontally) {
                        Text(Tr.p(p).substringBefore(" ("), fontSize = 12.sp, maxLines = 1, color = if (on) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.onSurface.copy(alpha = .7f))
                        Text(s.fmt(today[p]).substringBefore(" "), fontSize = 14.sp, fontWeight = if (on) FontWeight.Bold else FontWeight.Normal, maxLines = 1)
                    }
                }
            }
        }
        Spacer(Modifier.height(20.dp))
    }
}

/** an analog clock; the ring shows how much of the time to the next prayer has passed */
@Composable
private fun Clock(now: ZonedDateTime, st: Schedule.State, cd: Countdown) {
    val ink = MaterialTheme.colorScheme.onBackground
    val acc = MaterialTheme.colorScheme.primary
    val face = MaterialTheme.colorScheme.surface
    Canvas(Modifier.size(230.dp)) {
        val c = Offset(size.width / 2, size.height / 2); val r = size.minDimension / 2 - 8.dp.toPx()
        drawCircle(face, r, c)
        drawCircle(ink.copy(alpha = .12f), r, c, style = Stroke(6.dp.toPx()))
        // the part passed since the last prayer, out of the time until the next one
        val from = st.currentAt; val to = st.nextAt
        if (from != null) {
            val total = Duration.between(from, to).seconds.toFloat().coerceAtLeast(1f)
            val done = (Duration.between(from, now).seconds / total).coerceIn(0f, 1f)
            drawArc(acc, -90f, 360f * done, false, Offset(c.x - r, c.y - r), Size(2 * r, 2 * r), style = Stroke(6.dp.toPx(), cap = StrokeCap.Round))
        }
        val p = Paint().apply { color = ink.toArgb(); textSize = 13.sp.toPx(); isAntiAlias = true; textAlign = Paint.Align.CENTER }
        for (i in 1..12) {
            val a = Math.toRadians(i * 30.0 - 90)
            val rr = r - 22.dp.toPx()
            drawContext.canvas.nativeCanvas.drawText(Tr.num(i), c.x + rr * cos(a).toFloat(), c.y + rr * sin(a).toFloat() + 5.dp.toPx(), p)
        }
        fun hand(deg: Double, len: Float, w: Float, col: Color) {
            val a = Math.toRadians(deg - 90)
            drawLine(col, c, Offset(c.x + len * cos(a).toFloat(), c.y + len * sin(a).toFloat()), w, StrokeCap.Round)
        }
        hand((now.hour % 12 + now.minute / 60.0) * 30, r * .5f, 5.dp.toPx(), ink)
        hand((now.minute + now.second / 60.0) * 6, r * .72f, 3.5.dp.toPx(), ink)
        hand(now.second * 6.0, r * .78f, 1.5.dp.toPx(), acc)
        drawCircle(acc, 5.dp.toPx(), c)
    }
}

/** the count shown: within 30 minutes of a prayer's time «+ since then», otherwise «− until the next prayer» */
class Countdown(now: ZonedDateTime, st: Schedule.State, t: DayTimes) {
    val up = st.current != null && st.current != P.SUNRISE && now.isBefore(st.currentAt!!.plusMinutes(30))
    val prayer: P = if (up) st.current!! else st.next
    val sec = if (up) Duration.between(st.currentAt, now).seconds else Duration.between(now, st.nextAt).seconds
    val text = "\u200E" + (if (up) "+ " else "− ") + hms(sec)
}

@Composable
private fun Banner(icon: androidx.compose.ui.graphics.vector.ImageVector, title: String, sub: String, col: Color) {
    Row(Modifier.fillMaxWidth().padding(12.dp).clip(RoundedCornerShape(14.dp)).background(col).padding(14.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(icon, null, tint = Color.White)
        Column(Modifier.padding(horizontal = 12.dp)) {
            Text(title, color = Color.White, fontWeight = FontWeight.Bold, fontSize = 16.sp)
            if (sub.isNotEmpty()) Text(sub, color = Color.White.copy(alpha = .9f), fontSize = 14.sp)
        }
    }
}

/** on a fasting day (Ramadan, Monday / Thursday, an accepted white day): before Fajr a countdown to the end of suhoor,
 *  during the day a countdown to iftar with its du'a */
@Composable
private fun FastingCard(s: AppState, t: DayTimes, now: ZonedDateTime) {
    val pr = s.prefs
    if (!pr.fastDay(t.date) || now.isAfter(t[P.MAGHRIB])) return
    val suhoor = now.isBefore(t[P.FAJR])
    val h = Schedule.hijriOf(pr, t.date)
    Card(Modifier.fillMaxWidth().padding(12.dp), colors = CardDefaults.cardColors(containerColor = if (suhoor) Color(0xFF1D2F5C) else Color(0xFF1F4E3D))) {
        Column(Modifier.padding(16.dp).fillMaxWidth(), horizontalAlignment = Alignment.CenterHorizontally) {
            if (h.month == 9) Text(Tr["ramadan"] + " " + Tr.num(h.day), color = Gold, fontWeight = FontWeight.Bold)
            if (suhoor) {
                Text(Tr["suhoorEnds"] + " " + s.fmt(t[P.FAJR]), color = Color.White, fontWeight = FontWeight.Bold)
                Text("− " + hms(Duration.between(now, t[P.FAJR]).seconds), color = Gold, fontSize = 30.sp, fontFamily = FontFamily.Monospace)
                Text(Tr["fastToday"] + " " + s.fmt(t[P.MAGHRIB]), color = Color.White.copy(alpha = .75f), fontSize = 13.sp)
            } else {
                Text(Tr["fastToday"] + " " + s.fmt(t[P.MAGHRIB]), color = Color.White, fontWeight = FontWeight.Bold)
                Text("− " + hms(Duration.between(now, t[P.MAGHRIB]).seconds), color = Gold, fontSize = 30.sp, fontFamily = FontFamily.Monospace)
                Text(Tr["iftarDua"], color = Color.White, fontSize = 18.sp, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 6.dp))
                Text(Tr["iftarDuaSrc"], color = Color.White.copy(alpha = .7f), fontSize = 12.sp)
            }
        }
    }
}

fun fmtH(h: Double) = if (h % 1.0 == 0.0) h.toInt().toString() else "%.1f".format(h)
