package org.turath.salat.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.ChevronLeft
import androidx.compose.material.icons.outlined.ChevronRight
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.turath.salat.*
import java.time.LocalDate
import java.time.chrono.HijrahDate
import java.time.temporal.ChronoField
import java.time.temporal.ChronoUnit

/** the gregorian date whose daytime is hijri y-m-d (with the user's correction) */
fun gregOf(pr: Prefs, y: Int, m: Int, d: Int): LocalDate? = runCatching { LocalDate.from(HijrahDate.of(y, m, d)).minusDays(pr.hijriAdjust.toLong()) }.getOrNull()

fun monthLength(y: Int, m: Int): Int = runCatching { HijrahDate.of(y, m, 1).lengthOfMonth() }.getOrDefault(30)

/** special days: Ramadan, the two Eids, Arafah, Ashura, the white days */
fun special(m: Int, d: Int): String? = when {
    m == 9 -> Tr["ramadan"]
    m == 10 && d == 1 || m == 12 && d == 10 -> Tr["eid"]
    m == 12 && d == 9 -> Tr["arafah"]
    m == 1 && (d == 9 || d == 10) -> Tr["ashura"]
    d in 13..15 -> Tr["whiteDays"]
    else -> null
}

@Composable
fun CalendarScreen(s: AppState) {
    val place = s.prefs.place ?: return
    val nowH = Schedule.hijriNow(s.prefs, place, s.now)
    var ym by remember { mutableStateOf(nowH.year * 12 + nowH.month - 1) }
    val y = ym / 12; val m = ym % 12 + 1
    val len = monthLength(y, m)
    val first = gregOf(s.prefs, y, m, 1) ?: return
    val ws = s.prefs.weekStart
    val lead = (first.dayOfWeek.value - ws + 7) % 7      // the week from the chosen first day
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding().padding(8.dp)) {
        Spacer(Modifier.height(40.dp))
        Row(verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = { ym-- }) { Icon(Icons.Outlined.ChevronLeft, null) }
            Column(Modifier.weight(1f), horizontalAlignment = Alignment.CenterHorizontally) {
                Text(Tr.hijriMonth(m) + " " + Tr.num(y), fontSize = 24.sp, fontWeight = FontWeight.Bold)
                val last = first.plusDays((len - 1).toLong())
                val loc = java.util.Locale(Tr.lang)
                Text(Tr.num(first.month.getDisplayName(java.time.format.TextStyle.FULL, loc) + (if (last.month != first.month) " – " + last.month.getDisplayName(java.time.format.TextStyle.FULL, loc) else "") + " " + last.year),
                    color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f))
            }
            IconButton(onClick = { ym++ }) { Icon(Icons.Outlined.ChevronRight, null) }
        }
        // full day names; when a name does not fit its column on this phone, the English short names instead
        BoxWithConstraints(Modifier.fillMaxWidth()) {
            val tm = androidx.compose.ui.text.rememberTextMeasurer()
            val style = androidx.compose.ui.text.TextStyle(fontSize = 12.sp, fontWeight = FontWeight.Bold)
            val cell = with(androidx.compose.ui.platform.LocalDensity.current) { (maxWidth / 7).toPx() }
            val fits = (1..7).all { tm.measure(Tr.dayName(it), style).size.width <= cell - 4 }
            val en = listOf("Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun")
            Row(Modifier.fillMaxWidth()) {
                for (i in 0 until 7) {
                    val v = (ws - 1 + i) % 7 + 1
                    Text(if (fits) Tr.dayName(v) else en[v - 1], Modifier.weight(1f), style = style, maxLines = 1, softWrap = false,
                        color = if (v == 5) Gold else MaterialTheme.colorScheme.primary, textAlign = androidx.compose.ui.text.style.TextAlign.Center)
                }
            }
        }
        val cells = lead + len
        for (row in 0 until (cells + 6) / 7) Row(Modifier.fillMaxWidth()) {
            for (col in 0 until 7) {
                val d = row * 7 + col - lead + 1
                Box(Modifier.weight(1f).aspectRatio(.8f).padding(2.dp)) {
                    if (d in 1..len) {
                        val g = first.plusDays((d - 1).toLong())
                        val today = y == nowH.year && m == nowH.month && d == nowH.day
                        val sp = special(m, d)
                        val bg = when { today -> MaterialTheme.colorScheme.primary; sp != null -> Gold.copy(alpha = .22f); else -> MaterialTheme.colorScheme.surface }
                        Column(Modifier.fillMaxSize().clip(RoundedCornerShape(10.dp)).background(bg)
                            .then(if (g.dayOfWeek.value == 1 || g.dayOfWeek.value == 4) Modifier.border(1.dp, Gold.copy(alpha = .5f), RoundedCornerShape(10.dp)) else Modifier),
                            horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                            Text(Tr.num(d), fontSize = 20.sp, fontWeight = FontWeight.Bold, color = if (today) Color.White else MaterialTheme.colorScheme.onSurface)
                            Text(Tr.num(g.dayOfMonth), fontSize = 11.sp, color = if (today) Color.White.copy(alpha = .85f) else MaterialTheme.colorScheme.onSurface.copy(alpha = .55f))
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(10.dp))
        // the special days of this month
        val list = (1..len).mapNotNull { d -> special(m, d)?.let { d to it } }.filter { m != 9 || it.first == 1 }
        if (list.isNotEmpty()) Card0 {
            for ((d, n) in list.distinctBy { it.second + if (it.second == Tr["whiteDays"]) "" else it.first.toString() }) Row(Modifier.padding(vertical = 3.dp)) {
                Text(Tr.num(d) + " " + Tr.hijriMonth(m), Modifier.weight(1f)); Text(n, color = MaterialTheme.colorScheme.primary)
            }
        }
        Text(Tr["hijriChange"], Modifier.padding(12.dp), fontSize = 13.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f))
    }
}
