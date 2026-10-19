package org.turath.salat.ui

import android.content.Context
import android.graphics.Paint
import android.graphics.Typeface
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.nativeCanvas
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.Dp
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.turath.salat.*
import java.time.Duration
import java.time.LocalDate
import java.time.ZonedDateTime
import kotlin.math.cos
import kotlin.math.sin

/** how a date is written: day-month-year (as on the widget), month-day-year, year-month-day, or as the phone is set */
object DateFmt {
    fun order(ctx: Context, pr: Prefs): CharArray = order(ctx, pr.dateFmt)
    fun sample(ctx: Context, fmt: Int, d: LocalDate) = join(order(ctx, fmt), d.dayOfMonth, d.monthValue, d.year)
    fun order(ctx: Context, fmt: Int): CharArray = when (fmt) {
        0 -> charArrayOf('d', 'M', 'y')
        1 -> charArrayOf('M', 'd', 'y')
        2 -> charArrayOf('y', 'M', 'd')
        else -> runCatching { android.text.format.DateFormat.getDateFormatOrder(ctx) }.getOrDefault(charArrayOf('d', 'M', 'y'))
    }
    private fun join(o: CharArray, d: Int, m: Int, y: Int) =
        Tr.num(o.joinToString("-") { when (it) { 'd', 'D' -> d.toString(); 'M', 'L' -> m.toString(); else -> y.toString() } })
    fun greg(ctx: Context, pr: Prefs, d: LocalDate) = join(order(ctx, pr), d.dayOfMonth, d.monthValue, d.year)
    /** the Hijri date in numbers (the month's name is shown only where the date is picked) */
    fun hijri(ctx: Context, pr: Prefs, h: Hijri) = join(order(ctx, pr), h.day, h.month, h.year)
}

// ---------------------------------------------------------------- backgrounds of the app

val BG_NAMES = listOf("bgPlain", "bgSky", "bgPaper", "bgDawn", "bgMint")

/** the picture behind every screen: null = the plain colour */
fun bgBrush(style: Int, dark: Boolean): Brush? {
    val (a, b) = when (style) {
        1 -> if (dark) 0xFF1B2A3C to 0xFF111316 else 0xFFCFE3F5 to 0xFFF6F6F6
        2 -> if (dark) 0xFF2A2620 to 0xFF16140F else 0xFFF1E8D4 to 0xFFFAF7F0
        3 -> if (dark) 0xFF3A2430 to 0xFF14101A else 0xFFF6D8C3 to 0xFFFCF0E8
        4 -> if (dark) 0xFF173026 to 0xFF0F1613 else 0xFFCFEADA to 0xFFF3F8F5
        else -> return null
    }
    return Brush.verticalGradient(listOf(Color(a), Color(b)))
}

@Composable
fun BackgroundPicker(pr: Prefs, dark: Boolean, onPick: (Int) -> Unit) {
    var sel by remember { mutableIntStateOf(pr.bgStyle) }
    Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(vertical = 4.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        BG_NAMES.forEachIndexed { i, n ->
            val sh = RoundedCornerShape(14.dp)
            Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.clickable { sel = i; pr.bgStyle = i; onPick(i) }) {
                Box(Modifier.size(width = 64.dp, height = 88.dp).clip(sh)
                    .background(bgBrush(i, dark) ?: Brush.verticalGradient(listOf(MaterialTheme.colorScheme.background, MaterialTheme.colorScheme.background)))
                    .border(if (sel == i) 3.dp else 1.dp, if (sel == i) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = .4f), sh))
                Text(Tr[n], fontSize = 12.sp, modifier = Modifier.padding(top = 4.dp), color = MaterialTheme.colorScheme.onSurface.copy(alpha = .75f))
            }
        }
    }
}

// ---------------------------------------------------------------- the clock

const val CLOCK_STYLES = 6
val CLOCK_NAMES = listOf("clkClassic", "clkNight", "clkGold", "clkMinimal", "clkSector", "clkDigital")

/** the home clock in one of six looks; with `st`/`cd` null it is only a picture (the choice list) */
@Composable
fun ClockFace(style: Int, now: ZonedDateTime, st: Schedule.State?, cd: Countdown?, size: Dp) {
    val ink = MaterialTheme.colorScheme.onBackground
    val acc = MaterialTheme.colorScheme.primary
    val surface = MaterialTheme.colorScheme.surface
    Canvas(Modifier.size(size)) {
        val c = Offset(this.size.width / 2, this.size.height / 2)
        val r = this.size.minDimension / 2 - this.size.minDimension * .035f
        val u = r / 100f          // 1 unit = 1 % of the radius, so every look scales to any size
        val sec = now.second.toFloat()
        fun hand(deg: Double, len: Float, w: Float, col: Color) {
            val a = Math.toRadians(deg - 90)
            drawLine(col, c, Offset(c.x + len * cos(a).toFloat(), c.y + len * sin(a).toFloat()), w, StrokeCap.Round)
        }
        val hDeg = (now.hour % 12 + now.minute / 60.0) * 30
        val mDeg = (now.minute + now.second / 60.0) * 6
        val sDeg = now.second * 6.0
        fun numerals(col: Color, rad: Float, sizeU: Float, bold: Boolean) {
            val p = Paint().apply { color = col.toArgb(); textSize = sizeU * u; isAntiAlias = true; textAlign = Paint.Align.CENTER; isFakeBoldText = bold }
            for (i in 1..12) {
                val a = Math.toRadians(i * 30.0 - 90)
                drawContext.canvas.nativeCanvas.drawText(Tr.num(i), c.x + rad * cos(a).toFloat(), c.y + rad * sin(a).toFloat() + sizeU * u * .35f, p)
            }
        }
        fun progress(col: Color, w: Float) {
            val from = st?.currentAt; val to = st?.nextAt
            if (from != null && to != null) {
                val total = Duration.between(from, to).seconds.toFloat().coerceAtLeast(1f)
                val done = (Duration.between(from, now).seconds / total).coerceIn(0f, 1f)
                drawArc(col, -90f, 360f * done, false, Offset(c.x - r, c.y - r), Size(2 * r, 2 * r), style = Stroke(w, cap = StrokeCap.Round))
            }
        }
        fun ticks(col: Color, from: Float, long: Float, count: Int, w: Float) {
            for (i in 0 until count) {
                val a = Math.toRadians(i * 360.0 / count - 90)
                val r1 = r - (if (i % (count / 12) == 0) long else from) * u
                drawLine(col, Offset(c.x + r1 * cos(a).toFloat(), c.y + r1 * sin(a).toFloat()), Offset(c.x + (r - 2 * u) * cos(a).toFloat(), c.y + (r - 2 * u) * sin(a).toFloat()), w)
            }
        }
        when (style) {
            1 -> {   // night: a dark face, light hands, gold ring
                drawCircle(Color(0xFF14171C), r, c)
                drawCircle(Gold.copy(alpha = .35f), r, c, style = Stroke(3 * u))
                progress(Gold, 3 * u)
                ticks(Color.White.copy(alpha = .55f), 6f, 11f, 60, 1.2f * u)
                numerals(Color.White, r - 25 * u, 12f, true)
                hand(hDeg, r * .48f, 5 * u, Color.White); hand(mDeg, r * .72f, 3.5f * u, Color.White)
                hand(sDeg, r * .8f, 1.6f * u, Gold); drawCircle(Gold, 5 * u, c)
            }
            2 -> {   // gold: a cream face in a gold ring, dark hands
                drawCircle(Color(0xFFF6EDD3), r, c)
                drawCircle(Color(0xFFB8913A), r, c, style = Stroke(9 * u))
                ticks(Color(0xFF6E5B22), 5f, 10f, 60, 1.2f * u)
                numerals(Color(0xFF4A3D14), r - 27 * u, 12f, true)
                progress(Color(0xFFB8913A).copy(alpha = .55f), 2 * u)
                hand(hDeg, r * .46f, 5.5f * u, Color(0xFF4A3D14)); hand(mDeg, r * .7f, 3.8f * u, Color(0xFF4A3D14))
                hand(sDeg, r * .78f, 1.5f * u, Color(0xFFC0392B)); drawCircle(Color(0xFFB8913A), 5 * u, c)
            }
            3 -> {   // minimal: no face, twelve dots, thin hands
                for (i in 0 until 12) {
                    val a = Math.toRadians(i * 30.0 - 90)
                    drawCircle(ink.copy(alpha = if (i % 3 == 0) .75f else .35f), (if (i % 3 == 0) 3.2f else 2f) * u, Offset(c.x + (r - 6 * u) * cos(a).toFloat(), c.y + (r - 6 * u) * sin(a).toFloat()))
                }
                progress(acc.copy(alpha = .8f), 1.6f * u)
                hand(hDeg, r * .5f, 3.2f * u, ink); hand(mDeg, r * .74f, 2.2f * u, ink)
                hand(sDeg, r * .8f, 1f * u, acc); drawCircle(acc, 3.5f * u, c)
            }
            4 -> {   // sector: the time left until the next prayer is a coloured slice of the dial
                drawCircle(surface, r, c)
                drawCircle(ink.copy(alpha = .12f), r, c, style = Stroke(3 * u))
                val next = st?.nextAt?.withZoneSameInstant(now.zone)
                if (next != null) {
                    val nowA = (now.hour % 12 + now.minute / 60.0 + now.second / 3600.0) * 30
                    val nxtA = (next.hour % 12 + next.minute / 60.0) * 30
                    var sweep = ((nxtA - nowA) % 360 + 360) % 360
                    if (Duration.between(now, next).toHours() >= 12) sweep = 360.0
                    drawArc(acc.copy(alpha = .75f), (nowA - 90).toFloat(), sweep.toFloat(), true, Offset(c.x - r * .92f, c.y - r * .92f), Size(r * 1.84f, r * 1.84f))
                }
                numerals(ink, r - 20 * u, 12f, false)
                hand(hDeg, r * .5f, 5 * u, ink); hand(mDeg, r * .72f, 3.5f * u, ink)
                hand(sDeg, r * .8f, 1.5f * u, Gold); drawCircle(ink, 4.5f * u, c)
            }
            5 -> {   // digital: the time in big figures inside a ring that fills towards the next prayer
                drawCircle(surface, r, c)
                drawCircle(ink.copy(alpha = .12f), r, c, style = Stroke(5 * u))
                progress(acc, 5 * u)
                val h12 = if (now.hour % 12 == 0) 12 else now.hour % 12
                val big = Paint().apply { color = ink.toArgb(); textSize = 34 * u; isAntiAlias = true; textAlign = Paint.Align.CENTER; typeface = Typeface.create(Typeface.DEFAULT, Typeface.BOLD) }
                drawContext.canvas.nativeCanvas.drawText(Tr.num("%d:%02d".format(h12, now.minute)), c.x, c.y + 8 * u, big)
                val small = Paint().apply { color = acc.toArgb(); textSize = 15 * u; isAntiAlias = true; textAlign = Paint.Align.CENTER }
                drawContext.canvas.nativeCanvas.drawText(Tr.num("%02d".format(now.second)), c.x, c.y + 32 * u, small)
                val ampm = Paint().apply { color = ink.copy(alpha = .55f).toArgb(); textSize = 13 * u; isAntiAlias = true; textAlign = Paint.Align.CENTER }
                drawContext.canvas.nativeCanvas.drawText(if (now.hour < 12) "AM" else "PM", c.x, c.y - 24 * u, ampm)
            }
            else -> {   // classic
                drawCircle(surface, r, c)
                drawCircle(ink.copy(alpha = .12f), r, c, style = Stroke(5 * u))
                progress(acc, 5 * u)
                numerals(ink, r - 22 * u, 12f, false)
                hand(hDeg, r * .5f, 4.5f * u, ink); hand(mDeg, r * .72f, 3f * u, ink)
                hand(sDeg, r * .78f, 1.4f * u, acc); drawCircle(acc, 4.5f * u, c)
            }
        }
    }
}

/** the six clock looks side by side: tap one */
@Composable
fun ClockPicker(pr: Prefs, now: ZonedDateTime, onPick: (Int) -> Unit) {
    var sel by remember { mutableIntStateOf(pr.clockStyle) }
    Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(vertical = 4.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
        for (i in 0 until CLOCK_STYLES) {
            val sh = RoundedCornerShape(16.dp)
            Column(horizontalAlignment = Alignment.CenterHorizontally,
                modifier = Modifier.clip(sh).clickable { sel = i; pr.clockStyle = i; onPick(i) }
                    .border(if (sel == i) 3.dp else 1.dp, if (sel == i) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = .4f), sh).padding(8.dp)) {
                ClockFace(i, now, null, null, 84.dp)
                Text(Tr[CLOCK_NAMES[i]], fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .75f))
            }
        }
    }
}

// ---------------------------------------------------------------- small shared pieces of the new look

/** a choice shown as a rounded box: a small title and (optionally) a value; the chosen one is grey with a line round it */
@Composable
fun ChoiceCard(modifier: Modifier, title: String, value: String?, selected: Boolean, onClick: () -> Unit) {
    val sh = RoundedCornerShape(14.dp)
    Column(modifier.clip(sh)
        .background(if (selected) MaterialTheme.colorScheme.secondaryContainer else Color.Transparent)
        .border(if (selected) 2.dp else 1.dp, if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = .45f), sh)
        .clickable(onClick = onClick).padding(vertical = 10.dp, horizontal = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
        Text(title, fontSize = if (value == null) 15.sp else 12.sp, textAlign = TextAlign.Center,
            fontWeight = if (value == null) FontWeight.Medium else FontWeight.Normal,
            color = MaterialTheme.colorScheme.onSurface.copy(alpha = if (value == null) 1f else .65f))
        if (value != null) Text(value, fontSize = 17.sp, fontWeight = FontWeight.Bold, maxLines = 1, color = MaterialTheme.colorScheme.onSurface)
    }
}

/** a small choice box: the chosen one is grey with a blue line round it, the others have a thin grey line */
@Composable
fun ChoiceChip(selected: Boolean, onClick: () -> Unit, label: @Composable () -> Unit, modifier: Modifier = Modifier) {
    val sh = RoundedCornerShape(12.dp)
    Box(modifier.clip(sh)
        .background(if (selected) MaterialTheme.colorScheme.secondaryContainer else Color.Transparent)
        .border(if (selected) 2.dp else 1.dp, if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = .45f), sh)
        .clickable(onClick = onClick).padding(horizontal = 14.dp, vertical = 9.dp), contentAlignment = Alignment.Center) { label() }
}

/** a full-width choice box for a list of options (instead of a radio button) */
@Composable
fun ChoiceRow(selected: Boolean, onClick: () -> Unit, content: @Composable () -> Unit) {
    val sh = RoundedCornerShape(14.dp)
    Box(Modifier.fillMaxWidth().padding(vertical = 3.dp).clip(sh)
        .background(if (selected) MaterialTheme.colorScheme.secondaryContainer else Color.Transparent)
        .border(if (selected) 2.dp else 1.dp, if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline.copy(alpha = .45f), sh)
        .clickable(onClick = onClick).padding(horizontal = 14.dp, vertical = 11.dp)) { content() }
}
