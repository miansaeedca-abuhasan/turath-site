package org.turath.salat.ui

import android.graphics.Paint
import android.graphics.Typeface
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
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

@Composable
fun HomeScreen(s: AppState, openSettings: () -> Unit) {
    val place = s.prefs.place ?: return
    val now = s.now.withZoneSameInstant(Schedule.zone(place))
    val today = remember(now.toLocalDate(), s.version) { Schedule.day(s.prefs, place, now.toLocalDate()) }
    val st = Schedule.state(s.prefs, place, now)
    val forb = today.forbiddenAt(now)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        // ---- the sky: place, dates, dial, count
        Column(Modifier.fillMaxWidth().background(sky(st, today, now)).statusBarsPadding().padding(bottom = 18.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Row(Modifier.fillMaxWidth().padding(horizontal = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                Icon(if (s.prefs.placeByGps) Icons.Outlined.MyLocation else Icons.Outlined.PushPin, null, tint = Gold, modifier = Modifier.padding(8.dp))
                Text(place.name, color = Color.White, fontSize = 24.sp, fontWeight = FontWeight.Bold, modifier = Modifier.weight(1f))
                IconButton(onClick = openSettings) { Icon(Icons.Outlined.Settings, Tr["settings"], tint = Color.White) }
            }
            val h = Schedule.hijriNow(s.prefs, place, now)
            val loc = Locale(Tr.lang)
            Text(now.dayOfWeek.getDisplayName(TextStyle.FULL, loc) + " · " + Tr.hijri(h), color = Color.White, fontSize = 17.sp)
            Text(Tr.num(now.toLocalDate().format(java.time.format.DateTimeFormatter.ofPattern("d MMMM yyyy", loc))), color = Color.White.copy(alpha = .75f), fontSize = 14.sp)
            Spacer(Modifier.height(10.dp))
            Dial(s, today, now, st)
        }
        // permissions the adhan needs (after the first start, until they are given)
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
        // ---- today's times
        SectionTitle(Tr["tTimes"])
        Card0 {
            for (p in listOf(P.FAJR, P.SUNRISE, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)) {
                val cur = st.current == p && p != P.SUNRISE
                Row(Modifier.fillMaxWidth().clip(RoundedCornerShape(10.dp)).background(if (cur) MaterialTheme.colorScheme.primary.copy(alpha = .12f) else Color.Transparent).padding(horizontal = 8.dp, vertical = 9.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(Tr.p(p), Modifier.weight(1f), fontSize = 18.sp, fontWeight = if (cur) FontWeight.Bold else FontWeight.Normal)
                    if (cur) Text(Countdown(now, st, today).text, fontSize = 15.sp, color = MaterialTheme.colorScheme.primary, modifier = Modifier.padding(horizontal = 10.dp))
                    Text(s.fmt(today[p]), fontSize = 18.sp, fontWeight = if (cur) FontWeight.Bold else FontWeight.Normal)
                }
            }
        }
        SectionTitle(Tr["nafl"])
        Card0 {
            for (p in listOf(P.ISHRAQ, P.CHASHT, P.ZAWAL, P.TAHAJJUD)) Row(Modifier.fillMaxWidth().padding(vertical = 6.dp, horizontal = 8.dp)) {
                Text(Tr.p(p), Modifier.weight(1f), fontSize = 16.sp, color = if (p == P.ZAWAL) Color(0xFFB3261E) else Color.Unspecified)
                Text(s.fmt(today[p]), fontSize = 16.sp)
            }
        }
        WorldCities(s, now)
        Spacer(Modifier.height(20.dp))
    }
}

/** the count shown: within 30 minutes of a prayer's time «+ since then», otherwise «− until the next prayer» */
class Countdown(now: ZonedDateTime, st: Schedule.State, t: DayTimes) {
    val up = st.current != null && st.current != P.SUNRISE && now.isBefore(st.currentAt!!.plusMinutes(30))
    val prayer: P = if (up) st.current!! else st.next
    val sec = if (up) Duration.between(st.currentAt, now).seconds else Duration.between(now, st.nextAt).seconds
    val text = (if (up) "+ " else "− ") + hms(sec)
}

@Composable
private fun Dial(s: AppState, t: DayTimes, now: ZonedDateTime, st: Schedule.State) {
    val cd = Countdown(now, st, t)
    val labels = listOf(P.FAJR, P.SUNRISE, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)
    // the day as a circle: midnight at the bottom, noon at the top
    fun ang(z: ZonedDateTime): Float { val h = z.hour + z.minute / 60f + z.second / 3600f; return 90f + h / 24f * 360f }
    val segs = listOf(
        Triple(t[P.FAJR], t[P.SUNRISE], Color(0xFF7FA6E8)), Triple(t[P.SUNRISE], t[P.DHUHR], Color(0xFFF5D06F)),
        Triple(t[P.DHUHR], t[P.ASR], Color(0xFFFFB74D)), Triple(t[P.ASR], t[P.MAGHRIB], Color(0xFFF08A5D)),
        Triple(t[P.MAGHRIB], t[P.ISHA], Color(0xFFB07CD8)), Triple(t[P.ISHA], t[P.FAJR].plusDays(1), Color(0xFF3B4C7A)))
    Box(Modifier.size(300.dp), contentAlignment = Alignment.Center) {
        Canvas(Modifier.fillMaxSize()) {
            val r = size.minDimension / 2 - 34.dp.toPx()
            val c = Offset(size.width / 2, size.height / 2)
            val tl = Offset(c.x - r, c.y - r); val sz = Size(2 * r, 2 * r)
            drawCircle(Color.White.copy(alpha = .08f), r + 14.dp.toPx(), c)
            for ((a, b, col) in segs) {
                var sw = ang(b) - ang(a); if (sw < 0) sw += 360f
                drawArc(col, ang(a), sw, false, tl, sz, style = Stroke(10.dp.toPx(), cap = StrokeCap.Butt))
            }
            // forbidden windows as thin red arcs outside the ring
            for ((a, b) in t.forbidden) {
                var sw = ang(b) - ang(a); if (sw < 0) sw += 360f
                drawArc(Color(0xFFFF5252), ang(a), sw, false, Offset(tl.x - 11.dp.toPx(), tl.y - 11.dp.toPx()), Size(sz.width + 22.dp.toPx(), sz.height + 22.dp.toPx()), style = Stroke(3.dp.toPx()))
            }
            // prayer marks and names
            val paint = Paint().apply { color = Color.White.toArgb(); textSize = 11.sp.toPx(); isAntiAlias = true; textAlign = Paint.Align.CENTER; typeface = Typeface.DEFAULT_BOLD }
            for (p in labels) {
                val a = Math.toRadians(ang(t[p]).toDouble())
                drawCircle(Color.White, 3.dp.toPx(), Offset(c.x + r * cos(a).toFloat(), c.y + r * sin(a).toFloat()))
                val lr = r - 22.dp.toPx()
                drawContext.canvas.nativeCanvas.drawText(Tr.p(p).substringBefore(" ("), c.x + lr * cos(a).toFloat(), c.y + lr * sin(a).toFloat() + 4.dp.toPx(), paint)
            }
            // the sun (by day) or the moon (by night) at the time now
            val a = Math.toRadians(ang(now).toDouble())
            val p = Offset(c.x + r * cos(a).toFloat(), c.y + r * sin(a).toFloat())
            val day = now.isAfter(t[P.SUNRISE]) && now.isBefore(t[P.MAGHRIB])
            drawCircle((if (day) Color(0xFFFFD54F) else Color(0xFFE8EEF7)).copy(alpha = .35f), 16.dp.toPx(), p)
            drawCircle(if (day) Color(0xFFFFD54F) else Color(0xFFE8EEF7), 9.dp.toPx(), p)
        }
        Column(horizontalAlignment = Alignment.CenterHorizontally) {
            Text(Tr.p(cd.prayer).substringBefore(" ("), color = Color.White, fontSize = 30.sp, fontWeight = FontWeight.Bold)
            Text(s.fmt(if (cd.up) st.currentAt!! else st.nextAt), color = Color.White.copy(alpha = .8f), fontSize = 16.sp)
            Text(cd.text, color = if (cd.up) Gold else Color.White, fontSize = 30.sp, fontFamily = FontFamily.Monospace, fontWeight = FontWeight.Medium)
            Text(if (cd.up) Tr["since"] else Tr["until"], color = Color.White.copy(alpha = .7f), fontSize = 12.sp)
        }
    }
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

/** on a fasting day (Monday / Thursday, or an accepted white day): a countdown to iftar with its du'a */
@Composable
private fun FastingCard(s: AppState, t: DayTimes, now: ZonedDateTime) {
    val pr = s.prefs
    val d = t.date
    val h = Schedule.hijriOf(pr, d)
    val fast = (pr.monThu && (d.dayOfWeek == java.time.DayOfWeek.MONDAY || d.dayOfWeek == java.time.DayOfWeek.THURSDAY)) ||
        (pr.beed && h.day in 13..15 && pr.beedAccepted("${h.year}-${h.month}"))
    if (!fast || now.isBefore(t[P.FAJR].minusHours(2)) || now.isAfter(t[P.MAGHRIB])) return
    Card(Modifier.fillMaxWidth().padding(12.dp), colors = CardDefaults.cardColors(containerColor = Color(0xFF1F4E3D))) {
        Column(Modifier.padding(16.dp), horizontalAlignment = Alignment.CenterHorizontally) {
            Text(Tr["fastToday"] + " " + s.fmt(t[P.MAGHRIB]), color = Color.White, fontWeight = FontWeight.Bold)
            Text("− " + hms(Duration.between(now, t[P.MAGHRIB]).seconds), color = Gold, fontSize = 28.sp, fontFamily = FontFamily.Monospace)
            Text(Tr["iftarDua"], color = Color.White, fontSize = 18.sp, textAlign = TextAlign.Center, modifier = Modifier.padding(top = 6.dp))
            Text(Tr["iftarDuaSrc"], color = Color.White.copy(alpha = .7f), fontSize = 12.sp)
        }
    }
}

@Composable
private fun WorldCities(s: AppState, now: ZonedDateTime) {
    SectionTitle(Tr["world"])
    val myOff = now.offset.totalSeconds
    for (c in s.prefs.worldCities) {
        val z = Schedule.zone(c)
        val there = now.withZoneSameInstant(z)
        val st = Schedule.state(s.prefs, c, there)
        val diff = (there.offset.totalSeconds - myOff) / 3600.0
        Card0 {
            Row(verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(c.name, fontSize = 19.sp, fontWeight = FontWeight.Bold)
                    Text(when { diff > 0 -> Tr.num(fmtH(diff)) + " " + Tr["hoursAhead"]; diff < 0 -> Tr.num(fmtH(-diff)) + " " + Tr["hoursBehind"]; else -> Tr["sameTime"] },
                        fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .6f))
                }
                Text(s.fmt(there), fontSize = 18.sp, fontWeight = FontWeight.Medium)
            }
            val t = Schedule.day(s.prefs, c, there.toLocalDate())
            val cd = Countdown(there, st, t)
            Row(Modifier.padding(top = 6.dp)) {
                Text(Tr.p(cd.prayer).substringBefore(" (") + "  " + s.fmt(if (cd.up) st.currentAt!! else st.nextAt), Modifier.weight(1f), color = MaterialTheme.colorScheme.primary)
                Text(cd.text, fontFamily = FontFamily.Monospace)
            }
        }
    }
}

private fun fmtH(h: Double) = if (h % 1.0 == 0.0) h.toInt().toString() else "%.1f".format(h)
