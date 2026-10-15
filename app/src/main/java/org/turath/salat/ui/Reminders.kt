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
    var suhoorSnd by remember { mutableStateOf(false) }
    var ppSnd by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding()) {
        Text(Tr["tRem"], Modifier.padding(16.dp), fontSize = 28.sp, fontWeight = FontWeight.Bold)
        SectionTitle(Tr["durood"])
        Card0 {
            SwitchRow(Tr["durood"], Durood.on(pr), Tr["duroodNote"]) { pr.sp.edit().putBoolean("durood", it).apply(); Durood.start(s.act); s.changed() }
            if (Durood.on(pr)) Stepper(Tr["duroodGap"], Durood.gapMinutes(pr), 0, 120, 5) { pr.sp.edit().putInt("duroodGap", it).apply(); s.changed() }
        }
        SectionTitle(Tr["fasting"])
        Card0 {
            SwitchRow(Tr["ramadanFast"], pr.ramadan, Tr["ramadanNote"]) { pr.ramadan = it; s.changed() }
            SwitchRow(Tr["taraweeh"], pr.taraweehVib) { v -> pr.taraweehVib = v; s.changed(); if (v && s.act.needDnd()) s.act.askDnd() }
            if (pr.taraweehVib) Stepper(Tr["taraweehMin"], pr.taraweehMinutes, 60, 120, 15) { pr.taraweehMinutes = it; s.changed() }
            HorizontalDivider()
            SwitchRow(Tr["monThu"], pr.monThu) { pr.monThu = it; s.changed() }
            HorizontalDivider()
            SwitchRow(Tr["beed"], pr.beed, Tr["beedNote"]) { pr.beed = it; s.changed() }
            HorizontalDivider()
            Stepper(Tr["suhoor"] + " — " + Tr["minBeforeFajr"], pr.suhoorBefore, 10, 120) { pr.suhoorBefore = it; s.changed() }
            Row(Modifier.fillMaxWidth().clickable { suhoorSnd = true }.padding(vertical = 8.dp)) {
                Text(Tr["sound"], Modifier.weight(1f)); Text(Tr.snd(pr.suhoorSound), color = MaterialTheme.colorScheme.primary)
            }
            Stepper(Tr["iftar"] + " — " + Tr["minBeforeMaghrib"], pr.iftarBefore, 5, 60) { pr.iftarBefore = it; s.changed() }
        }
        SectionTitle(Tr["prePost"])
        Card0 {
            Text(Tr["prePostNote"], fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .6f))
            for (p in FIVE) {
                Text(Tr.p(p), fontSize = 17.sp, fontWeight = FontWeight.Bold, modifier = Modifier.padding(top = 8.dp))
                Stepper(Tr["before"] + " (" + Tr["min"] + ")", pr.before(p), 0, 120, 5) { pr.setBefore(p, it); s.changed() }
                Stepper(Tr["after"] + " (" + Tr["min"] + ")", pr.after(p), 0, 120, 5) { pr.setAfter(p, it); s.changed() }
            }
            Row(Modifier.fillMaxWidth().clickable { ppSnd = true }.padding(vertical = 10.dp)) {
                Text(Tr["sound"], Modifier.weight(1f)); Text(Tr.snd(pr.prePostSound), color = MaterialTheme.colorScheme.primary)
            }
        }
        SectionTitle(Tr["nafl"])
        Card0 {
            for (p in listOf(P.TAHAJJUD, P.ISHRAQ, P.CHASHT)) {
                val on = pr.sound(p) != Snd.SILENT
                SwitchRow(Tr.p(p), on, if (on) Tr.snd(pr.sound(p)) else "") { pr.setSound(p, if (it) (if (p == P.TAHAJJUD) Snd.CHORUS else Snd.NIGHTINGALE) else Snd.SILENT); s.changed() }
            }
        }
        Row(Modifier.fillMaxWidth().padding(end = 8.dp), verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.weight(1f)) { SectionTitle(Tr["custom"]) }
            IconButton(onClick = { edit = Reminder(System.currentTimeMillis(), "", P.FAJR, -30, 127, Snd.NOTIFY, true) }) { Icon(Icons.Outlined.Add, Tr["newRem"]) }
        }
        for (r in pr.reminders) Card0 {
            Row(verticalAlignment = Alignment.CenterVertically, modifier = Modifier.clickable { edit = r }) {
                Column(Modifier.weight(1f)) {
                    Text(r.label.ifEmpty { Tr["remTitle"] }, fontSize = 18.sp, fontWeight = FontWeight.Bold)
                    Row { Days(r.days) }
                    Text(Tr.num(minText(r.minutes)) + " " + (if (r.minutes < 0) Tr["before"] else Tr["after"]) + " " + Tr.p(r.base), fontSize = 15.sp)
                }
                Switch(checked = r.on, onCheckedChange = { v -> pr.reminders = pr.reminders.map { if (it.id == r.id) it.copy(on = v) else it }; s.changed() })
            }
        }
        Spacer(Modifier.height(24.dp))
    }
    edit?.let { r -> ReminderEditor(s, r) { edit = null } }
    if (ppSnd) SoundPicker(s, Tr["prePost"], pr.prePostSound, SoundService.choices(s.act, false).filter { it != Snd.SILENT }) { v -> if (v != null) { pr.prePostSound = v; s.changed() }; ppSnd = false }
    if (suhoorSnd) SoundPicker(s, Tr["suhoor"], pr.suhoorSound, SoundService.choices(s.act, false).filter { it != Snd.SILENT }) { v -> if (v != null) { pr.suhoorSound = v; s.changed() }; suhoorSnd = false }
}

private fun minText(m: Int): String { val a = kotlin.math.abs(m); return if (a >= 60) "${a / 60} ${Tr["hr"]} ${a % 60} ${Tr["min"]}" else "$a ${Tr["min"]}" }

@Composable
private fun Days(bits: Int) {
    val names = Tr["days"].split(',', '،')
    names.forEachIndexed { i, n ->
        Text(n, Modifier.padding(end = 8.dp), color = if ((bits shr i) and 1 == 1) Gold else Color.Gray, fontWeight = FontWeight.Bold, fontSize = 14.sp)
    }
}

@Composable
private fun ReminderEditor(s: AppState, r0: Reminder, close: () -> Unit) {
    var r by remember { mutableStateOf(r0) }
    var before by remember { mutableStateOf(r0.minutes <= 0) }
    var mins by remember { mutableIntStateOf(kotlin.math.abs(r0.minutes)) }
    var snd by remember { mutableStateOf(false) }
    val exists = s.prefs.reminders.any { it.id == r0.id }
    AlertDialog(onDismissRequest = close, title = { Text(Tr["newRem"]) },
        text = {
            Column(Modifier.verticalScroll(rememberScrollState())) {
                OutlinedTextField(r.label, { r = r.copy(label = it) }, label = { Text(Tr["label"]) }, singleLine = true, modifier = Modifier.fillMaxWidth())
                Spacer(Modifier.height(8.dp))
                Row { Days2(r.days) { r = r.copy(days = it) } }
                Stepper(Tr["min"], mins, 0, 600, 5) { mins = it }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    FilterChip(before, { before = true }, { Text(Tr["before"]) }); Spacer(Modifier.width(8.dp))
                    FilterChip(!before, { before = false }, { Text(Tr["after"]) })
                }
                Row(Modifier.horizontalScroll(rememberScrollState())) {
                    for (p in listOf(P.FAJR, P.SUNRISE, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)) {
                        FilterChip(r.base == p, { r = r.copy(base = p) }, { Text(Tr.p(p)) }); Spacer(Modifier.width(6.dp))
                    }
                }
                Row(Modifier.fillMaxWidth().clickable { snd = true }.padding(vertical = 10.dp)) { Text(Tr["sound"], Modifier.weight(1f)); Text(Tr.snd(r.sound), color = MaterialTheme.colorScheme.primary) }
            }
        },
        confirmButton = { TextButton(onClick = {
            val nr = r.copy(minutes = if (before) -mins else mins)
            s.prefs.reminders = if (exists) s.prefs.reminders.map { if (it.id == nr.id) nr else it } else s.prefs.reminders + nr
            s.changed(); close()
        }) { Text(Tr["save"]) } },
        dismissButton = { Row {
            if (exists) TextButton(onClick = { s.prefs.reminders = s.prefs.reminders.filter { it.id != r0.id }; s.changed(); close() }) { Text(Tr["delete"], color = Color(0xFFB3261E)) }
            TextButton(onClick = close) { Text(Tr["cancel"]) }
        } })
    if (snd) SoundPicker(s, Tr["sound"], r.sound, SoundService.choices(s.act, false)) { v -> if (v != null) r = r.copy(sound = v); snd = false }
}

@Composable
private fun Days2(bits: Int, set: (Int) -> Unit) {
    Tr["days"].split(',', '،').forEachIndexed { i, n ->
        val on = (bits shr i) and 1 == 1
        Text(n, Modifier.clickable { set(bits xor (1 shl i)) }.padding(horizontal = 6.dp, vertical = 4.dp), color = if (on) Gold else Color.Gray, fontWeight = FontWeight.Bold, fontSize = 17.sp)
    }
}

