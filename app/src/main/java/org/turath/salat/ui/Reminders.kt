package org.turath.salat.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.turath.salat.*

@Composable
fun Stepper(label: String, value: Int, min: Int, max: Int, step: Int = 5, set: (Int) -> Unit) {
    Row(Modifier.fillMaxWidth().padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
        Text(label, Modifier.weight(1f), fontSize = 15.sp)
        IconButton(onClick = { set((value - step).coerceAtLeast(min)) }) { Icon(Icons.Outlined.RemoveCircleOutline, null) }
        Text(Tr.num(value), fontSize = 18.sp, fontWeight = FontWeight.Bold, modifier = Modifier.widthIn(min = 36.dp))
        IconButton(onClick = { set((value + step).coerceAtMost(max)) }) { Icon(Icons.Outlined.AddCircleOutline, null) }
    }
}

@Composable
fun SwitchRow(label: String, on: Boolean, sub: String = "", set: (Boolean) -> Unit) {
    Row(Modifier.fillMaxWidth().clickable { set(!on) }.padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        Column(Modifier.weight(1f)) {
            Text(label, fontSize = 16.sp, fontWeight = FontWeight.Medium)
            if (sub.isNotEmpty()) Text(sub, fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .6f))
        }
        Switch(checked = on, onCheckedChange = set)
    }
}

@Composable
fun RemindersScreen(s: AppState) {
    val pr = s.prefs
    var edit by remember { mutableStateOf<Reminder?>(null) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding()) {
        Row(Modifier.fillMaxWidth().padding(start = 52.dp, end = 8.dp, top = 6.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(Tr["tRem"], Modifier.weight(1f), fontSize = 28.sp, fontWeight = FontWeight.Bold)
            IconButton(onClick = { edit = Reminder(System.currentTimeMillis(), "", listOf(P.FAJR), -15, 127, Snd.NOTIFY, true) }) { Icon(Icons.Outlined.Add, Tr["newRem"], Modifier.size(30.dp)) }
        }
        for (r in pr.reminders.sortedByDescending { it.id }) Card0 {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { edit = r }) {
                Column(Modifier.weight(1f)) {
                    Row { Days(r.days) }
                    Text(r.label.ifEmpty { Tr["remTitle"] }, fontSize = 19.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(vertical = 2.dp))
                    Text(Tr.num(minText(r.minutes)) + " " + (if (r.minutes < 0) Tr["before"] else Tr["after"]) + " " + r.bases.joinToString("، ") { Tr.p(it).substringBefore(" (") }, fontSize = 14.sp,
                        color = MaterialTheme.colorScheme.onSurface.copy(alpha = .7f))
                }
                Switch(checked = r.on, onCheckedChange = { v -> pr.reminders = pr.reminders.map { if (it.id == r.id) it.copy(on = v) else it }; s.changed() })
            }
        }
        // the voluntary prayers, ready made
        for (p in listOf(P.TAHAJJUD, P.ISHRAQ, P.CHASHT)) {
            val on = pr.sound(p) != Snd.SILENT
            Card0 {
                SwitchRow(Tr.p(p), on, if (on) Tr.snd(pr.sound(p)) else Tr["off"]) { pr.setSound(p, if (it) (if (p == P.TAHAJJUD) Snd.CHORUS else Snd.NIGHTINGALE) else Snd.SILENT); s.changed() }
            }
        }
        Card0 {
            SwitchRow(Tr["azkarM"], pr.azkarMorning, Tr["azkarMNote"]) { pr.azkarMorning = it; s.changed() }
            SwitchRow(Tr["azkarE"], pr.azkarEvening, Tr["azkarENote"]) { pr.azkarEvening = it; s.changed() }
        }
        Text(Tr["remHint"], Modifier.padding(16.dp), fontSize = 13.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .55f))
    }
    edit?.let { r -> ReminderEditor(s, r) { edit = null } }
}

private fun minText(m: Int): String { val a = kotlin.math.abs(m); return when { a >= 60 && a % 60 == 0 -> "${a / 60} ${Tr["hr"]}"; a >= 60 -> "${a / 60} ${Tr["hr"]} ${a % 60} ${Tr["min"]}"; else -> "$a ${Tr["min"]}" } }

@Composable
private fun dayLabels(): List<String> = if (Tr.lang == "en") Tr["days"].split(',', '،') else List(7) { Tr.dayWidget(it + 1) }

@Composable
private fun Days(bits: Int) {
    dayLabels().forEachIndexed { i, n ->
        Text(n, Modifier.padding(end = 7.dp), color = if ((bits shr i) and 1 == 1) MaterialTheme.colorScheme.primary else Color.Gray.copy(alpha = .6f), fontWeight = FontWeight.Bold, fontSize = if (Tr.lang == "en") 12.sp else 11.sp)
    }
}

/** a reminder on a page of its own: name, prayers, how long before / after, days, sound */
@OptIn(ExperimentalLayoutApi::class)
@Composable
private fun ReminderEditor(s: AppState, r0: Reminder, close: () -> Unit) {
    var r by remember { mutableStateOf(r0) }
    var before by remember { mutableStateOf(r0.minutes <= 0) }
    val a0 = kotlin.math.abs(r0.minutes)
    var hours by remember { mutableStateOf(a0 >= 60 && a0 % 60 == 0) }
    var num by remember { mutableStateOf((if (a0 >= 60 && a0 % 60 == 0) a0 / 60 else a0).toString()) }
    var snd by remember { mutableStateOf(false) }
    val exists = s.prefs.reminders.any { it.id == r0.id }
    fun save() {
        val n = num.filter { it.isDigit() }.toIntOrNull() ?: 0
        val mins = if (hours) n * 60 else n
        val nr = r.copy(minutes = if (before) -mins else mins, bases = r.bases.ifEmpty { listOf(P.FAJR) })
        s.prefs.reminders = if (exists) s.prefs.reminders.map { if (it.id == nr.id) nr else it } else s.prefs.reminders + nr
        s.changed(); close()
    }
    androidx.compose.ui.window.Dialog(onDismissRequest = close, properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false)) {
        Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Column(Modifier.fillMaxSize()) {
                Row(Modifier.fillMaxWidth().statusBarsPadding().padding(4.dp), verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = close) { Icon(Icons.Outlined.Close, Tr["cancel"]) }
                    Spacer(Modifier.weight(1f))
                    if (exists) IconButton(onClick = { s.prefs.reminders = s.prefs.reminders.filter { it.id != r0.id }; s.changed(); close() }) { Icon(Icons.Outlined.DeleteOutline, Tr["delete"], tint = Color(0xFFB3261E)) }
                    TextButton(onClick = { save() }) { Text(Tr["save"], fontSize = 17.sp) }
                }
                Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(horizontal = 20.dp)) {
                    OutlinedTextField(r.label, { r = r.copy(label = it) }, placeholder = { Text(Tr["remName"]) }, singleLine = true, modifier = Modifier.fillMaxWidth(), textStyle = androidx.compose.ui.text.TextStyle(fontSize = 20.sp))
                    Spacer(Modifier.height(10.dp))
                    Text(Tr["prayersFor"], fontWeight = FontWeight.Bold)
                    FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        for (p in listOf(P.FAJR, P.SUNRISE, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)) {
                            val on = p in r.bases
                            ChoiceChip(on, { r = r.copy(bases = if (on) r.bases - p else r.bases + p) }, { Text(Tr.p(p).substringBefore(" (")) })
                        }
                    }
                    Spacer(Modifier.height(14.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.Schedule, null); Text("  " + Tr["timing"], fontWeight = FontWeight.Bold) }
                    Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        OutlinedTextField(num, { num = it.filter { c -> c.isDigit() }.take(3) }, Modifier.width(96.dp), singleLine = true,
                            keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(keyboardType = androidx.compose.ui.text.input.KeyboardType.Number))
                        ChoiceChip(!hours, { hours = false }, { Text(Tr["minutes"], fontSize = 14.sp) })
                        ChoiceChip(hours, { hours = true }, { Text(Tr["hours"], fontSize = 14.sp) })
                    }
                    Row(Modifier.padding(vertical = 8.dp), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        ChoiceChip(before, { before = true }, { Text(Tr["beforeT"], fontSize = 14.sp) })
                        ChoiceChip(!before, { before = false }, { Text(Tr["afterT"], fontSize = 14.sp) })
                    }
                    Spacer(Modifier.height(10.dp))
                    Row(verticalAlignment = Alignment.CenterVertically) { Icon(Icons.Outlined.Repeat, null); Text("  " + Tr["repeatOn"], fontWeight = FontWeight.Bold) }
                    Row(Modifier.fillMaxWidth().padding(vertical = 6.dp)) { Days2(r.days) { r = r.copy(days = it) } }
                    Spacer(Modifier.height(10.dp))
                    Row(Modifier.fillMaxWidth().clickable { r = r.copy(sound = if (r.sound == Snd.NOTIFY) Snd.NIGHTINGALE else Snd.NOTIFY) }.padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
                        Checkbox(r.sound == Snd.NOTIFY, { c -> r = r.copy(sound = if (c) Snd.NOTIFY else Snd.NIGHTINGALE) }); Text(Tr["NOTIFY"])
                    }
                    if (r.sound != Snd.NOTIFY) Row(Modifier.fillMaxWidth().clickable { snd = true }.padding(vertical = 10.dp), verticalAlignment = Alignment.CenterVertically) {
                        Icon(Icons.Outlined.MusicNote, null); Text("  " + Tr["sound"], Modifier.weight(1f), fontWeight = FontWeight.Bold)
                        Text(Tr.snd(r.sound), color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
    if (snd) SoundPicker(s, Tr["sound"], r.sound, SoundService.choices(s.act, SndUse.REMINDER)) { v -> if (v != null) r = r.copy(sound = v); snd = false }
}

@Composable
private fun RowScope.Days2(bits: Int, set: (Int) -> Unit) {
    val en = Tr.lang == "en"
    dayLabels().forEachIndexed { i, n ->
        val on = (bits shr i) and 1 == 1
        ChoiceChip(on, { set(bits xor (1 shl i)) }, { Text(n, fontWeight = FontWeight.Bold, fontSize = if (en) 15.sp else 13.sp, maxLines = 1) }, Modifier.weight(1f).padding(horizontal = 2.dp))
    }
}
