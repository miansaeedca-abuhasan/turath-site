package org.turath.salat.ui

import android.app.TimePickerDialog
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
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

/** the gregorian date whose daytime is hijri y-m-d (with the user's correction) */
fun gregOf(pr: Prefs, y: Int, m: Int, d: Int): LocalDate? = runCatching { LocalDate.from(HijrahDate.of(y, m, d)).minusDays(pr.hijriAdjust.toLong()) }.getOrNull()

fun monthLength(y: Int, m: Int): Int = runCatching { HijrahDate.of(y, m, 1).lengthOfMonth() }.getOrDefault(30)

/** the known days of the hijri year (only what is established: the Eids, Arafah, Ashura, the ten days, the battles of the Seerah);
 *  `d` = null: known by the month only */
data class IDay(val m: Int, val d: Int?, val to: Int?, val key: String)

val ISLAMIC_DAYS = listOf(
    IDay(1, 9, null, "dTasua"), IDay(1, 10, null, "dAshura"), IDay(1, null, null, "dKhaybar"),
    IDay(3, null, null, "dHijra"), IDay(5, null, null, "dMutah"), IDay(7, null, null, "dTabuk"),
    IDay(9, 1, null, "dRamadan"), IDay(9, 17, null, "dBadr"), IDay(9, null, null, "dFath"), IDay(9, 21, 30, "dLastTen"),
    IDay(10, 1, null, "dFitr"), IDay(10, null, null, "dUhud"), IDay(10, null, null, "dKhandaq"), IDay(10, null, null, "dHunayn"),
    IDay(11, null, null, "dHudaybiyyah"),
    IDay(12, 1, 10, "dTenDays"), IDay(12, 8, null, "dTarwiyah"), IDay(12, 9, null, "dArafah"), IDay(12, 10, null, "dAdha"), IDay(12, 11, 13, "dTashreeq"),
    IDay(12, null, null, "dFarewell"),
)

/** the special days of a hijri date (for the cells and the day's sheet) */
fun specialsOf(m: Int, d: Int): List<String> {
    val l = ISLAMIC_DAYS.filter { it.m == m && it.d != null && d >= it.d && d <= (it.to ?: it.d) }.map { Tr[it.key] }.toMutableList()
    if (d in 13..15 && !(m == 12 && d == 13)) l += Tr["whiteDays"]
    return l
}

/** a strong mark (Eid, Arafah, Ashura, Badr …) or a light one (a range like the ten days, the white days) */
fun strong(m: Int, d: Int) = ISLAMIC_DAYS.any { it.m == m && it.d == d && it.to == null }

@Composable
fun CalendarScreen(s: AppState) {
    val place = s.prefs.place ?: return
    val nowH = Schedule.hijriNow(s.prefs, place, s.now)   // the Hijri date changes at Maghrib; the English dates are the phone's (only the Hijri one can be adjusted, in Settings)
    var ym by remember { mutableIntStateOf(nowH.year * 12 + nowH.month - 1) }
    var dayOpen by remember { mutableStateOf<Int?>(null) }
    var edit by remember { mutableStateOf<CalEvent?>(null) }
    val y = ym / 12; val m = ym % 12 + 1
    val len = monthLength(y, m)
    val first = gregOf(s.prefs, y, m, 1) ?: return
    val ws = s.prefs.weekStart
    val lead = (first.dayOfWeek.value - ws + 7) % 7      // the week from the chosen first day
    val events = s.prefs.events
    fun eventsOn(d: Int): List<CalEvent> { val g = first.plusDays((d - 1).toLong()); val h = Hijri(y, m, d); return events.filter { it.on(g, h) } }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding().padding(8.dp)) {
        Row(Modifier.fillMaxWidth().padding(start = 44.dp), verticalAlignment = Alignment.CenterVertically) {
            Spacer(Modifier.weight(1f))
            IconButton(onClick = { ym = nowH.year * 12 + nowH.month - 1 }) { Icon(Icons.Outlined.Today, Tr["today"]) }
            IconButton(onClick = {
                edit = CalEvent(System.currentTimeMillis(), "", true, y, m, if (ym == nowH.year * 12 + nowH.month - 1) nowH.day else 1, "once", 9 * 60, null, 0, Snd.NOTIFY) }) {
                Icon(Icons.Outlined.Add, Tr["addEvent"])
            }
        }
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
        // full day names; when a name does not fit its column on this phone, the short names instead
        BoxWithConstraints(Modifier.fillMaxWidth()) {
            val tm = androidx.compose.ui.text.rememberTextMeasurer()
            val style = androidx.compose.ui.text.TextStyle(fontSize = 12.sp, fontWeight = FontWeight.Bold)
            val cell = with(androidx.compose.ui.platform.LocalDensity.current) { (maxWidth / 7).toPx() }
            val fits = (1..7).all { tm.measure(Tr.dayName(it), style).size.width <= cell - 4 }
            Row(Modifier.fillMaxWidth()) {
                for (i in 0 until 7) {
                    val v = (ws - 1 + i) % 7 + 1
                    Text(if (fits) Tr.dayName(v) else Tr.dayShort(v), Modifier.weight(1f), style = style, maxLines = 1, softWrap = false,
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
                        val sp = specialsOf(m, d).isNotEmpty()
                        val big = strong(m, d)
                        val bg = when { today -> MaterialTheme.colorScheme.primary; big -> Color(0xFF2E9E5B).copy(alpha = .35f); sp -> Gold.copy(alpha = .2f); else -> MaterialTheme.colorScheme.surface }
                        Column(Modifier.fillMaxSize().clip(RoundedCornerShape(10.dp)).background(bg).clickable { dayOpen = d }
                            .then(if (g.dayOfWeek.value == 1 || g.dayOfWeek.value == 4) Modifier.border(1.dp, Gold.copy(alpha = .5f), RoundedCornerShape(10.dp)) else Modifier),
                            horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
                            Text(Tr.num(d), fontSize = 20.sp, fontWeight = FontWeight.Bold, color = if (today) Color.White else MaterialTheme.colorScheme.onSurface)
                            Text(Tr.num(g.dayOfMonth), fontSize = 11.sp, color = if (today) Color.White.copy(alpha = .85f) else MaterialTheme.colorScheme.onSurface.copy(alpha = .55f))
                            if (eventsOn(d).isNotEmpty()) Box(Modifier.size(5.dp).clip(CircleShape).background(if (today) Color.White else Color(0xFF1F8FD1)))
                        }
                    }
                }
            }
        }
        Spacer(Modifier.height(10.dp))
        // this month: the known days, then what happened in it (month only), then the user's events
        val dayItems = (1..len).flatMap { d -> specialsOf(m, d).map { d to it } }.distinctBy { it.second }
        val monthItems = ISLAMIC_DAYS.filter { it.m == m && it.d == null }
        val myItems = (1..len).flatMap { d -> eventsOn(d).map { d to it } }
        if (dayItems.isNotEmpty() || monthItems.isNotEmpty() || myItems.isNotEmpty()) Card0 {
            for ((d, n) in dayItems) Row(Modifier.fillMaxWidth().clickable { dayOpen = d }.padding(vertical = 4.dp)) {
                Text(Tr.num(d) + " " + Tr.hijriMonth(m), Modifier.width(120.dp), color = MaterialTheme.colorScheme.onSurface.copy(alpha = .7f)); Text(n, color = MaterialTheme.colorScheme.primary)
            }
            if (monthItems.isNotEmpty()) {
                Text(Tr["inThisMonth"], Modifier.padding(top = 8.dp), fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .6f))
                for (it in monthItems) Text("• " + Tr[it.key], Modifier.padding(vertical = 3.dp), color = MaterialTheme.colorScheme.primary)
            }
            if (myItems.isNotEmpty()) {
                Text(Tr["myEvents"], Modifier.padding(top = 8.dp), fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .6f))
                for ((d, e) in myItems) Row(Modifier.fillMaxWidth().clickable { edit = e }.padding(vertical = 4.dp)) {
                    Text(Tr.num(d) + " " + Tr.hijriMonth(m), Modifier.width(120.dp), color = MaterialTheme.colorScheme.onSurface.copy(alpha = .7f))
                    Text(e.label.ifEmpty { Tr["event"] } + "  · " + whenText(e), color = Color(0xFF1F8FD1))
                }
            }
        }
        Text(Tr["calHint"], Modifier.padding(12.dp), fontSize = 13.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f))
    }
    dayOpen?.let { d ->
        val g = first.plusDays((d - 1).toLong())
        AlertDialog(onDismissRequest = { dayOpen = null },
            title = { Column { Text(Tr.num(d) + " " + Tr.hijriMonth(m) + " " + Tr.num(y)); Text(Tr.num(g.toString()), fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .6f)) } },
            text = {
                Column {
                    for (n in specialsOf(m, d)) Text("• $n", color = MaterialTheme.colorScheme.primary, modifier = Modifier.padding(vertical = 2.dp))
                    for (e in eventsOn(d)) Text("• " + e.label.ifEmpty { Tr["event"] } + " — " + whenText(e), Modifier.clickable { dayOpen = null; edit = e }.padding(vertical = 2.dp))
                    if (specialsOf(m, d).isEmpty() && eventsOn(d).isEmpty()) Text(Tr["noEvents"])
                }
            },
            confirmButton = { TextButton(onClick = { dayOpen = null; edit = CalEvent(System.currentTimeMillis(), "", true, y, m, d, "once", 9 * 60, null, 0, Snd.NOTIFY) }) {
                Icon(Icons.Outlined.Add, null); Text(" " + Tr["addEvent"]) } },
            dismissButton = { TextButton(onClick = { dayOpen = null }) { Text(Tr["close"]) } })
    }
    edit?.let { e -> EventEditor(s, e) { edit = null } }
}

/** «9:00 am» or «25 min after Asr» */
fun whenText(e: CalEvent): String = if (e.base != null)
    Tr.num(kotlin.math.abs(e.offset).toString()) + " " + Tr["min"] + " " + (if (e.offset < 0) Tr["before"] else Tr["after"]) + " " + Tr.p(e.base).substringBefore(" (")
else Tr.num("%d:%02d".format(e.atMin / 60, e.atMin % 60))

/** an event on a page of its own: name, date (hijri or gregorian), repeat, time (of the clock or with a prayer), sound */
@Composable
private fun EventEditor(s: AppState, e0: CalEvent, close: () -> Unit) {
    var e by remember { mutableStateOf(e0) }
    var snd by remember { mutableStateOf(false) }
    var withPrayer by remember { mutableStateOf(e0.base != null) }
    var before by remember { mutableStateOf(e0.offset < 0) }
    var mins by remember { mutableStateOf(kotlin.math.abs(e0.offset).toString()) }
    val exists = s.prefs.events.any { it.id == e0.id }
    // the gregorian date of the hijri date chosen (to switch between the two)
    val g = if (e0.hijri) gregOf(s.prefs, e0.y, e0.m, e0.d) else LocalDate.of(e0.y, e0.m, e0.d)
    val h = g?.let { Schedule.hijriOf(s.prefs, it) }
    fun save() {
        val n = mins.filter { it.isDigit() }.toIntOrNull() ?: 0
        val ne = if (withPrayer) e.copy(base = e.base ?: P.FAJR, offset = if (before) -n else n) else e.copy(base = null, offset = 0, atMin = maxOf(0, e.atMin))
        s.prefs.events = if (exists) s.prefs.events.map { if (it.id == ne.id) ne else it } else s.prefs.events + ne
        s.changed(); close()
    }
    androidx.compose.ui.window.Dialog(onDismissRequest = close, properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false)) {
        Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Column(Modifier.fillMaxSize()) {
                Row(Modifier.fillMaxWidth().statusBarsPadding().padding(4.dp), verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = close) { Icon(Icons.Outlined.Close, Tr["cancel"]) }
                    Text(Tr["event"], Modifier.weight(1f), fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    if (exists) IconButton(onClick = { s.prefs.events = s.prefs.events.filter { it.id != e0.id }; s.changed(); close() }) { Icon(Icons.Outlined.DeleteOutline, Tr["delete"], tint = Color(0xFFB3261E)) }
                    TextButton(onClick = { save() }) { Text(Tr["save"], fontSize = 17.sp) }
                }
                Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp)) {
                    OutlinedTextField(e.label, { e = e.copy(label = it) }, placeholder = { Text(Tr["eventName"]) }, singleLine = true, modifier = Modifier.fillMaxWidth(),
                        textStyle = androidx.compose.ui.text.TextStyle(fontSize = 20.sp))
                    Spacer(Modifier.height(12.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.Event, null); Text("  " + Tr["date"], fontWeight = FontWeight.Bold) }
                    Row(Modifier.padding(vertical = 4.dp)) {
                        FilterChip(e.hijri, { if (h != null) e = e.copy(hijri = true, y = h.year, m = h.month, d = h.day) }, { Text(Tr.num(h?.day ?: 0) + " " + (h?.let { Tr.hijriMonth(it.month) } ?: "") + " " + Tr.num(h?.year ?: 0)) })
                        Spacer(Modifier.width(8.dp))
                        FilterChip(!e.hijri, { if (g != null) e = e.copy(hijri = false, y = g.year, m = g.monthValue, d = g.dayOfMonth) }, { Text(Tr.num(g?.toString() ?: "")) })
                    }
                    Row(Modifier.horizontalScroll(rememberScrollState())) {
                        for ((k, n) in listOf("once" to "repOnce", "month" to "repMonth", "year" to "repYear")) { FilterChip(e.repeat == k, { e = e.copy(repeat = k) }, { Text(Tr[n]) }); Spacer(Modifier.width(6.dp)) }
                    }
                    Spacer(Modifier.height(12.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.Schedule, null); Text("  " + Tr["timing"], fontWeight = FontWeight.Bold) }
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        RadioButton(!withPrayer, { withPrayer = false }); Text(Tr["atClock"]); Spacer(Modifier.width(12.dp))
                        RadioButton(withPrayer, { withPrayer = true }); Text(Tr["withPrayer"])
                    }
                    if (!withPrayer) OutlinedButton(onClick = {
                        TimePickerDialog(s.act, { _, hh, mm -> e = e.copy(atMin = hh * 60 + mm) }, maxOf(0, e.atMin) / 60, maxOf(0, e.atMin) % 60, s.prefs.h24).show()
                    }) { Text(Tr.num("%d:%02d".format(maxOf(0, e.atMin) / 60, maxOf(0, e.atMin) % 60)), fontSize = 20.sp) }
                    else {
                        Row(verticalAlignment = Alignment.CenterVertically) {
                            OutlinedTextField(mins, { mins = it.filter { c -> c.isDigit() }.take(3) }, Modifier.width(90.dp), singleLine = true,
                                keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = androidx.compose.ui.text.input.KeyboardType.Number))
                            Text("  " + Tr["minutes"])
                            Spacer(Modifier.width(12.dp))
                            FilterChip(before, { before = true }, { Text(Tr["beforeT"]) }); Spacer(Modifier.width(6.dp))
                            FilterChip(!before, { before = false }, { Text(Tr["afterT"]) })
                        }
                        Row(Modifier.horizontalScroll(rememberScrollState())) {
                            for (p in listOf(P.FAJR, P.SUNRISE, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)) {
                                FilterChip((e.base ?: P.FAJR) == p, { e = e.copy(base = p) }, { Text(Tr.p(p).substringBefore(" (")) }); Spacer(Modifier.width(6.dp))
                            }
                        }
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(Modifier.fillMaxWidth().clickable { snd = true }.padding(vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Outlined.MusicNote, null); Text("  " + Tr["sound"], Modifier.weight(1f), fontWeight = FontWeight.Bold)
                        Text(Tr.snd(e.sound), color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
    if (snd) SoundPicker(s, Tr["sound"], e.sound, SoundService.choices(s.act, SndUse.REMINDER)) { v -> if (v != null) e = e.copy(sound = v); snd = false }
}

/** kept for the widget code and older callers: Ramadan, the Eids, Arafah, Ashura, the white days */
fun special(m: Int, d: Int): String? = specialsOf(m, d).firstOrNull()
