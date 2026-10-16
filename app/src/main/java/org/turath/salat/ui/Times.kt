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
                        if (five && s.prefs.vibrateMode) IconButton(onClick = { s.prefs.setVibrateFor(p, !s.prefs.vibrateFor(p)); s.changed() }) {
                            Icon(if (s.prefs.vibrateFor(p)) Icons.Outlined.Vibration else Icons.Outlined.PhoneAndroid, null,
                                tint = if (s.prefs.vibrateFor(p)) Gold else Color.Gray)
                        }
                        val snd = s.prefs.sound(p)
                        IconButton(onClick = { pick = p }) {
                            Icon(when { snd == Snd.SILENT -> Icons.AutoMirrored.Outlined.VolumeOff; snd.bird -> Icons.Outlined.Park; else -> Icons.AutoMirrored.Outlined.VolumeUp },
                                null, tint = if (snd == Snd.SILENT) Color.Gray else MaterialTheme.colorScheme.primary)
                        }
                    } else Spacer(Modifier.width(48.dp))
                }
                if (p == P.ISHA || p == P.SUNRISE) HorizontalDivider(Modifier.padding(vertical = 4.dp))
            }
        }
        Text(Tr["hijriChange"], Modifier.padding(16.dp), fontSize = 13.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f))
    }
    pick?.let { p -> SoundPicker(s, Tr.p(p), s.prefs.sound(p), SoundService.choices(s.act, p == P.FAJR, p in FIVE), p == P.FAJR) { v -> if (v != null) { s.prefs.setSound(p, v); s.changed() }; pick = null } }
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
                        val g = when { x.adhan -> "gAdhan"; x.short -> "gShort"; x.bird -> "gBirds"; else -> "gPhone" }
                        if (g != group) { group = g; Text(Tr[g], Modifier.padding(start = 20.dp, end = 20.dp, top = 16.dp, bottom = 4.dp), color = MaterialTheme.colorScheme.primary, fontSize = 14.sp, fontWeight = FontWeight.Bold) }
                        Row(Modifier.fillMaxWidth().clickable {
                            sel = x
                            if (x == Snd.SILENT || playing == x) { Preview.stop(); playing = null }
                            else { Preview.play(ctx, x, fajr) { playing = null }; playing = x }
                        }.padding(horizontal = 8.dp, vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
                            RadioButton(selected = sel == x, onClick = null, modifier = Modifier.padding(12.dp))
                            Text(Tr.snd(x), Modifier.weight(1f), fontSize = 16.sp)
                            if (playing == x) Icon(Icons.Outlined.GraphicEq, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.padding(end = 12.dp))
                        }
                    }
                    Text(Tr["volNote"], Modifier.padding(20.dp), fontSize = 12.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f))
                }
            }
        }
    }
}
