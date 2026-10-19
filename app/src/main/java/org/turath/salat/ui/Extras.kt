package org.turath.salat.ui

import android.content.Intent
import android.net.Uri
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.turath.salat.*
import org.turath.salat.Preview
import java.time.ZonedDateTime

/** pages opened from the menu */

@Composable
fun LanguagePage(s: AppState, back: () -> Unit) {
    Column(Modifier.fillMaxSize()) {
        TopBar(Tr["language"], back)
        for ((k, n) in listOf("ur" to "اردو", "ar" to "العربية", "en" to "English"))
            ListItem(headlineContent = { Text(n, fontSize = 20.sp) }, leadingContent = { RadioButton(s.prefs.lang == k, null) },
                modifier = Modifier.clickable { s.prefs.lang = k; Tr.lang = k; Alarms.channels(s.act); s.page = ""; s.changed() })
    }
}

/** day / night look of the app, and the widgets' background */
@Composable
fun LookPage(s: AppState, back: () -> Unit) {
    val pr = s.prefs
    var alpha by remember { mutableIntStateOf(pr.widgetAlpha) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        TopBar(Tr["look"], back)
        SectionTitle(Tr["clockStyle"])
        Card0 { ClockPicker(pr, s.now) { s.changed() } }
        SectionTitle(Tr["background"])
        Card0 { BackgroundPicker(pr, isDark(s, androidx.compose.foundation.isSystemInDarkTheme())) { s.changed() } }
        SectionTitle(Tr["dateFmt"])
        Card0 {
            val today = java.time.LocalDate.now()
            for ((k, n) in listOf(0 to "dfDMY", 1 to "dfMDY", 2 to "dfYMD", 3 to "dfPhone"))
                Row(Modifier.fillMaxWidth().clickable { pr.dateFmt = k; Widget.update(s.act); s.changed() }.padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
                    RadioButton(pr.dateFmt == k, { pr.dateFmt = k; Widget.update(s.act); s.changed() })
                    Column { Text(Tr[n], fontSize = 15.sp); Text(DateFmt.sample(s.act, k, today), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .55f)) }
                }
        }
        SectionTitle(Tr["theme"])
        Card0 {
            for ((k, n) in listOf("time" to "themeTime", "light" to "themeLight", "dark" to "themeDark", "phone" to "themePhone"))
                Row(Modifier.fillMaxWidth().clickable { pr.theme = k; s.changed() }.padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
                    RadioButton(pr.theme == k, { pr.theme = k; s.changed() }); Text(Tr[n], fontSize = 15.sp)
                }
        }
        Card0 { AppLook(s) }
        SectionTitle(Tr["widgets"])
        Card0 {
            Text(Tr["widgetsHow"], fontSize = 14.sp)
            Spacer(Modifier.height(10.dp))
            Text(Tr["transparency"] + ": " + Tr.num(alpha) + "%", fontWeight = FontWeight.Bold)
            Row(verticalAlignment = Alignment.CenterVertically) {
                for (v in listOf(0, 20, 40, 60, 80, 100)) {
                    FilterChip(alpha == v, { alpha = v; pr.widgetAlpha = v; Widget.update(s.act) }, { Text(Tr.num(v)) }, Modifier.padding(end = 4.dp))
                }
            }
            SwitchRow(Tr["widgetLight"], pr.widgetLight) { pr.widgetLight = it; Widget.update(s.act); s.changed() }
            WidgetLook(pr) { Widget.update(s.act) }
        }
        Spacer(Modifier.height(30.dp))
    }
}

@Composable
fun WorldPage(s: AppState, back: () -> Unit) {
    if (s.sub == "add") { CityPicker(s, true) { s.sub = "" }; return }
    val place = s.prefs.place ?: return
    val now = s.now.withZoneSameInstant(Schedule.zone(place))
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(Modifier.weight(1f)) { TopBar(Tr["world"], back) }
            IconButton(onClick = { s.sub = "add" }, Modifier.statusBarsPadding()) { Icon(Icons.Outlined.Add, Tr["addCity"]) }
        }
        WorldList(s, now)
        Spacer(Modifier.height(20.dp))
    }
}

/** fasting, Ramadan (suhoor alarm, iftar countdown, taraweeh) and Friday */
@Composable
fun FastingPage(s: AppState, back: () -> Unit) {
    val pr = s.prefs
    var suhoorSnd by remember { mutableStateOf(false) }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        TopBar(Tr["fastingMenu"], back)
        SectionTitle(Tr["ramadan"])
        Card0 {
            SwitchRow(Tr["ramadanFast"], pr.ramadan, Tr["ramadanNote"]) { pr.ramadan = it; s.changed() }
        }
        SectionTitle(Tr["fasting"])
        Card0 {
            SwitchRow(Tr["fAshura"], pr.ashura) { pr.ashura = it; s.changed() }
            SwitchRow(Tr["fArafah"], pr.arafah) { pr.arafah = it; s.changed() }
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
        SectionTitle(Tr["takbirat"])
        Card0 {
            SwitchRow(Tr["tkFitr"], pr.takbirFitr) { pr.takbirFitr = it; s.changed() }
            SwitchRow(Tr["tkHijjah"], pr.takbirHijjah) { pr.takbirHijjah = it; s.changed() }
            SwitchRow(Tr["tkTashreeq"], pr.takbirTashreeq) { pr.takbirTashreeq = it; s.changed() }
        }
        Spacer(Modifier.height(20.dp))
    }
    if (suhoorSnd) SoundPicker(s, Tr["suhoor"], pr.suhoorSound, SoundService.choices(s.act, SndUse.REMINDER).filter { it != Snd.NOTIFY }) { v -> if (v != null) { pr.suhoorSound = v; s.changed() }; suhoorSnd = false }
}

/** the salawat reminder on unlocking the phone: which recordings, how often, the user's own files */
@Composable
fun DuroodPage(s: AppState, back: () -> Unit) {
    val pr = s.prefs; val ctx = s.act
    var sel by remember { mutableStateOf(Durood.chosen(pr)) }
    var playing by remember { mutableIntStateOf(-1) }
    DisposableEffect(Unit) { onDispose { Preview.stop() } }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        TopBar(Tr["duroodMenu"], back)
        Card0 {
            SwitchRow(Tr["durood"], Durood.on(pr), Tr["duroodNote"]) { pr.sp.edit().putBoolean("durood", it).apply(); Durood.start(ctx); s.changed() }
            if (Durood.on(pr)) {
                Stepper(Tr["duroodGap"], Durood.gapMinutes(pr), 0, 120, 5) { pr.sp.edit().putInt("duroodGap", it).apply(); s.changed() }
                SwitchRow(Tr["duroodRandom"], pr.sp.getBoolean("duroodRandom", true)) { pr.sp.edit().putBoolean("duroodRandom", it).apply(); s.changed() }
            }
        }
        SectionTitle(Tr["duroodWhich"])
        Card0 {
            Durood.PHRASES.forEachIndexed { i, t ->
                Row(Modifier.fillMaxWidth().clickable {
                    if (playing == i) { Preview.stop(); playing = -1 } else { Durood.rawUri(ctx, i)?.let { Preview.playUri(ctx, it) }; playing = i }
                }.padding(vertical = 2.dp), verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(i in sel, { v -> sel = if (v) sel + i else sel - i; Durood.setChosen(pr, sel); Durood.start(ctx) })
                    Text(t, Modifier.weight(1f), fontSize = 18.sp, textAlign = TextAlign.Start)
                    Icon(if (playing == i) Icons.Outlined.StopCircle else Icons.Outlined.PlayCircle, Tr["test"], tint = MaterialTheme.colorScheme.primary)
                }
            }
        }
        Spacer(Modifier.height(20.dp))
    }
}

@Composable
fun AboutPage(s: AppState, back: () -> Unit) {
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        TopBar(Tr["about"], back)
        Card0 {
            Text(Tr["app"], fontSize = 22.sp, fontWeight = FontWeight.Bold)
            Text(Tr["aboutText"], fontSize = 15.sp, modifier = Modifier.padding(vertical = 8.dp))
            Text("turathkhairalquroon.com", color = MaterialTheme.colorScheme.primary, modifier = Modifier.clickable {
                runCatching { s.act.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://turathkhairalquroon.com"))) } })
        }
        SectionTitle(Tr["credits"])
        Card0 {
            Text("• GeoNames (geonames.org) — CC BY 4.0: cities, coordinates, time zones.\n" +
                "• Prayer-time formulas: PrayTimes.org method (sun declination and equation of time).\n" +
                "• Hijri calendar: Umm al-Qura (Java HijrahDate).\n" +
                "• Adhan recordings: Shaikh Ali Ahmad Mulla, Shaikh Hamad al-Daghriri (Masjid al-Haram), Shaikh Essam Bukhari (Masjid an-Nabawi), Shaikh Abdul Basit Abdus Samad, Shaikh Saleh al-Nabet, Shaikh Nur ad-Din Hamza al-Maghribi — from the collection of Turath Khair al-Quroon.\n" +
                "• Birdsong (Wikimedia Commons / xeno-canto, shortened): Nightingale — Phoenicurus ochruros (XC416395), Blackbird — Olivier Grimm (XC561032), Wren — Borja (XC425718), Dawn chorus — Alexander Wendt: CC BY-SA 4.0; Robin — Dan Stowell (XC124862): CC BY-SA 3.0; Morning birds — BigSoundBank: CC0; Canaries 1–10: a recording supplied by the app\u0027s owner, cut into ten calls; Siskin, Woodlark, Sedge Warbler (W1CDR, Wikimedia Commons), Blackcap and Golden Oriole (DM550, Slovakia), Red-whiskered bulbul: CC BY-SA 4.0; Song Thrush (near Basel): CC BY-SA 3.0.",
                fontSize = 12.sp)
        }
        Spacer(Modifier.height(20.dp))
    }
}

@Composable
fun WorldList(s: AppState, now: ZonedDateTime) {
    val myOff = now.offset.totalSeconds
    for (c in s.prefs.worldCities) key(c.name, c.lat) {
        var open by remember { mutableStateOf(true) }
        val z = Schedule.zone(c)
        val there = now.withZoneSameInstant(z)
        val st = Schedule.state(s.prefs, c, there)
        val diff = (there.offset.totalSeconds - myOff) / 3600.0
        val t = Schedule.day(s.prefs, c, there.toLocalDate())
        val cd = Countdown(there, st, t)
        Card0 {
            Row(Modifier.fillMaxWidth().clickable { open = !open }, verticalAlignment = Alignment.CenterVertically) {
                Column(Modifier.weight(1f)) {
                    Text(when (c.name) { "Makkah" -> Tr["wMakkah"]; "Madinah" -> Tr["wMadinah"]; "Al-Quds" -> Tr["wQuds"]; else -> c.name }, fontSize = 19.sp, fontWeight = FontWeight.Bold)
                    Text(when { diff > 0 -> Tr.num(fmtH(diff)) + " " + Tr["hoursAhead"]; diff < 0 -> Tr.num(fmtH(-diff)) + " " + Tr["hoursBehind"]; else -> Tr["sameTime"] },
                        fontSize = 13.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .6f))
                }
                Text(s.fmt(there), fontSize = 18.sp, fontWeight = FontWeight.Medium)
                if (s.prefs.fixedCities.none { it.name == c.name }) IconButton(onClick = { s.prefs.worldCities = s.prefs.worldCities.filter { it != c }; s.changed() }) { Icon(Icons.Outlined.Close, Tr["delete"]) }
                Icon(if (open) Icons.Outlined.ExpandLess else Icons.Outlined.ExpandMore, null, tint = MaterialTheme.colorScheme.onSurface.copy(alpha = .6f))
            }
            if (!open) Row(Modifier.padding(top = 8.dp)) {
                Text(Tr.p(cd.prayer).substringBefore(" (") + "  " + s.fmt(if (cd.up) st.currentAt!! else st.nextAt), Modifier.weight(1f), color = MaterialTheme.colorScheme.primary)
                Text(cd.text, fontFamily = FontFamily.Monospace)
            } else {
                Spacer(Modifier.height(8.dp))
                // the five prayers of that city today; the next (or just-begun) one is marked with its count
                for (p in listOf(P.FAJR, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)) {
                    val on = p == cd.prayer
                    Row(Modifier.fillMaxWidth().padding(vertical = 2.dp).clip(RoundedCornerShape(10.dp))
                        .background(if (on) MaterialTheme.colorScheme.secondaryContainer else androidx.compose.ui.graphics.Color.Transparent)
                        .padding(horizontal = 12.dp, vertical = 9.dp), verticalAlignment = Alignment.CenterVertically) {
                        Text(s.fmt(t[p]), Modifier.width(100.dp), fontSize = 16.sp, fontWeight = if (on) FontWeight.Bold else FontWeight.Normal)
                        Text(Tr.p(p).substringBefore(" ("), Modifier.weight(1f), fontSize = 16.sp, fontWeight = if (on) FontWeight.Bold else FontWeight.Normal)
                        if (on) Text(cd.text, fontFamily = FontFamily.Monospace, fontSize = 15.sp, color = MaterialTheme.colorScheme.primary)
                    }
                }
            }
        }
    }
}

