package org.turath.salat.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.VolumeOff
import androidx.compose.material.icons.automirrored.outlined.VolumeUp
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
import java.time.format.DateTimeFormatter
import java.time.format.TextStyle
import java.util.Locale

@Composable
fun TimesScreen(s: AppState) {
    val place = s.prefs.place ?: return
    var offset by remember { mutableIntStateOf(0) }
    var pick by remember { mutableStateOf<P?>(null) }
    var pickJum by remember { mutableStateOf(false) }
    val date = s.now.withZoneSameInstant(Schedule.zone(place)).toLocalDate().plusDays(offset.toLong())
    val t = Schedule.day(s.prefs, place, date)
    val loc = Locale(Tr.lang)
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState()).statusBarsPadding()) {
        Spacer(Modifier.height(44.dp))
        Row(Modifier.fillMaxWidth().padding(8.dp), verticalAlignment = Alignment.CenterVertically) {
            IconButton(onClick = { offset-- }) { Icon(Icons.Outlined.ChevronLeft, null) }
            Column(Modifier.weight(1f).clickable { offset = 0 }, horizontalAlignment = Alignment.CenterHorizontally) {
                Text(date.dayOfWeek.getDisplayName(TextStyle.FULL, loc), fontSize = 20.sp, fontWeight = FontWeight.Bold)
                Text(Tr.hijri(Schedule.hijriOf(s.prefs, date)), color = MaterialTheme.colorScheme.primary, fontSize = 17.sp)
                Text(Tr.num(date.format(DateTimeFormatter.ofPattern("d MMMM yyyy", loc))), fontSize = 14.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f))
            }
            IconButton(onClick = { offset++ }) { Icon(Icons.Outlined.ChevronRight, null) }
        }
        Card0 {
            for (p in P.entries) {
                val five = p in FIVE
                val zawal = p == P.ZAWAL
                Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                    Text(s.fmt(t[p]), fontSize = if (five) 20.sp else 16.sp, fontWeight = if (five) FontWeight.Medium else FontWeight.Normal, modifier = Modifier.width(112.dp))
                    Text(Tr.p(p), Modifier.weight(1f), fontSize = if (five) 19.sp else 15.sp,
                        color = when { zawal -> Color(0xFFB3261E); five -> MaterialTheme.colorScheme.onSurface; else -> MaterialTheme.colorScheme.onSurface.copy(alpha = .7f) })
                    if (p in FIVE || p == P.ISHRAQ || p == P.CHASHT || p == P.TAHAJJUD) {
                        // three choices, as in Salatuk: the sound (tap again to choose which), a notification only, silent
                        val snd = s.prefs.sound(p)
                        val mode = when (snd) { Snd.SILENT -> 2; Snd.NOTIFY -> 1; else -> 0 }
                        val on = MaterialTheme.colorScheme.primary; val off = MaterialTheme.colorScheme.onSurface.copy(alpha = .35f)
                        IconButton(onClick = { if (mode == 0) pick = p else { s.prefs.setSound(p, s.prefs.lastSound(p)); s.changed() } }, Modifier.size(38.dp)) {
                            Icon(if (snd.bird) Icons.Outlined.Park else Icons.AutoMirrored.Outlined.VolumeUp, Tr["mSound"], tint = if (mode == 0) on else off)
                        }
                        IconButton(onClick = { s.prefs.setSound(p, Snd.NOTIFY); s.changed() }, Modifier.size(38.dp)) { Icon(Icons.Outlined.Vibration, Tr["mNotify"], tint = if (mode == 1) on else off) }
                        IconButton(onClick = { s.prefs.setSound(p, Snd.SILENT); s.changed() }, Modifier.size(38.dp)) { Icon(Icons.AutoMirrored.Outlined.VolumeOff, Tr["mSilent"], tint = if (mode == 2) on else off) }
                    } else Spacer(Modifier.width(114.dp))
                }
                if (p == P.ISHA || p == P.SUNRISE) HorizontalDivider(Modifier.padding(vertical = 4.dp))
            }
            // Friday: the adhan of Jumu'ah (Dhuhr on Fridays)
            Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(Tr["JUMUAH"], Modifier.weight(1f).padding(start = 112.dp), fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .7f))
                IconButton(onClick = { pickJum = true }, Modifier.size(38.dp)) { Icon(Icons.AutoMirrored.Outlined.VolumeUp, Tr["mSound"], tint = MaterialTheme.colorScheme.primary) }
                Spacer(Modifier.width(76.dp))
            }
            // the middle of the night (from Maghrib to the next Fajr)
            val nf = Schedule.day(s.prefs, place, date.plusDays(1))[P.FAJR]
            val mid = t[P.MAGHRIB].plusSeconds(java.time.Duration.between(t[P.MAGHRIB], nf).seconds / 2)
            Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
                Text(s.fmt(mid), fontSize = 16.sp, modifier = Modifier.width(112.dp))
                Text(Tr["midnight"], Modifier.weight(1f), fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .7f))
            }
        }
        Text(Tr["hijriChange"], Modifier.padding(16.dp), fontSize = 13.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f))
    }
    if (pickJum) SoundPicker(s, Tr["JUMUAH"], s.prefs.jumuahSound, SoundService.choices(s.act, SndUse.PRAYER, false)) { v -> if (v != null) { s.prefs.jumuahSound = v; s.changed() }; pickJum = false }
    pick?.let { p -> SoundPicker(s, Tr.p(p), s.prefs.sound(p), SoundService.choices(s.act, if (p in FIVE) SndUse.PRAYER else SndUse.NAFL, p == P.FAJR), p == P.FAJR) { v -> if (v != null) { s.prefs.setSound(p, v); s.changed() }; pick = null } }
}

/** choose a sound on a page of its own: a tap chooses it and plays it (at the volume the adhan will have) */
@Composable
fun SoundPicker(s: AppState, title: String, cur: Snd, list: List<Snd>, fajr: Boolean = false, done: (Snd?) -> Unit) {
    var sel by remember { mutableStateOf(cur) }
    var playing by remember { mutableStateOf<Snd?>(null) }
    val ctx = s.act
    DisposableEffect(Unit) { onDispose { Preview.stop() } }
    androidx.compose.ui.window.Dialog(onDismissRequest = { done(null) }, properties = androidx.compose.ui.window.DialogProperties(usePlatformDefaultWidth = false)) {
        Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
            Column(Modifier.fillMaxSize()) {
                Row(Modifier.fillMaxWidth().statusBarsPadding().padding(4.dp), verticalAlignment = Alignment.CenterVertically) {
                    IconButton(onClick = { done(null) }) { Icon(Icons.Outlined.Close, Tr["cancel"]) }
                    Text(title, Modifier.weight(1f), fontSize = 20.sp, fontWeight = FontWeight.Bold)
                    TextButton(onClick = { done(sel) }) { Text(Tr["save"], fontSize = 17.sp) }
                }
                Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
                    var group = ""
                    for (x in list) {
                        val g = when (x.city) { "makkah" -> "gMakkah"; "madinah" -> "gMadinah"; "other" -> "gOther"; "birds" -> "gBirds"; else -> "gPhone" }
                        if (g != group) { group = g; Text(Tr[g], Modifier.padding(start = 20.dp, end = 20.dp, top = 16.dp, bottom = 4.dp), color = MaterialTheme.colorScheme.primary, fontSize = 14.sp, fontWeight = FontWeight.Bold) }
                        Row(Modifier.fillMaxWidth().clickable {
                            sel = x
                            if (x == Snd.SILENT || x == Snd.NOTIFY || playing == x) { Preview.stop(); playing = null }
                            else { Preview.play(ctx, x, fajr) { playing = null }; playing = x }
                        }.padding(horizontal = 8.dp, vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(selected = sel == x, onClick = null, modifier = Modifier.padding(12.dp))
                            Text(Tr.sndShort(x), Modifier.weight(1f), fontSize = 16.sp)
                            if (playing == x) Icon(Icons.Outlined.GraphicEq, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.padding(end = 12.dp))
                        }
                    }
                    Text(Tr["volNote"], Modifier.padding(20.dp), fontSize = 12.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f))
                }
            }
        }
    }
}
