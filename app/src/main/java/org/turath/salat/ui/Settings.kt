package org.turath.salat.ui

import android.annotation.SuppressLint
import android.location.LocationManager
import android.os.Build
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
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

private val LANGS = listOf("ur" to "اردو", "ar" to "العربية", "en" to "English")

@Composable
fun TopBar(title: String, back: () -> Unit) {
    Row(Modifier.fillMaxWidth().statusBarsPadding().padding(4.dp), verticalAlignment = Alignment.CenterVertically) {
        IconButton(onClick = back) { Icon(Icons.AutoMirrored.Outlined.ArrowBack, null) }
        Text(title, fontSize = 22.sp, fontWeight = FontWeight.Bold)
    }
}

@Composable
private fun Choice(label: String, sel: Boolean, onClick: () -> Unit) {
    Row(Modifier.fillMaxWidth().clickable(onClick = onClick).padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        RadioButton(selected = sel, onClick = onClick); Text(label, fontSize = 15.sp)
    }
}

@Composable
private fun Perm(label: String, need: Boolean, ask: () -> Unit) {
    if (!need) return
    Row(Modifier.fillMaxWidth().padding(vertical = 4.dp), verticalAlignment = Alignment.CenterVertically) {
        Icon(Icons.Outlined.WarningAmber, null, tint = Color(0xFFB3261E))
        Text(label, Modifier.weight(1f).padding(horizontal = 8.dp), fontSize = 14.sp)
        TextButton(onClick = ask) { Text(Tr["allow"]) }
    }
}

@Composable
fun SettingsScreen(s: AppState, back: () -> Unit) {
    val pr = s.prefs; val act = s.act
    var tick by remember { mutableIntStateOf(0) }       // redraw after returning from a system permission screen
    LaunchedEffect(Unit) { act.onPermResult = { tick++ } }
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        TopBar(Tr["settings"], back)
        key(tick) {
            Card0 {
                Perm(Tr["permNotif"], act.needNotifications()) { act.askNotifications() }
                Perm(Tr["permAlarm"], act.needExact()) { act.askExact() }
                Perm(Tr["permBattery"], act.needBattery()) { act.askBattery() }
                if (!act.needNotifications() && !act.needExact() && !act.needBattery()) Text("✓", color = Color(0xFF2E9E5B))
            }
        }
        SectionTitle(Tr["soundSet"])
        Card0 {
            Text(Tr["volSource"], fontSize = 14.sp)
            Choice(Tr["volMedia"], pr.volStream == "media") { pr.volStream = "media"; s.changed() }
            Choice(Tr["volRing"], pr.volStream == "ring") { pr.volStream = "ring"; s.changed() }
            Choice(Tr["volAlarm"], pr.volStream == "alarm") { pr.volStream = "alarm"; s.changed() }
            HorizontalDivider()
            SwitchRow(Tr["adhanSilent"], pr.adhanInSilent, Tr["adhanSilentNote"]) { pr.adhanInSilent = it; s.changed() }
            HorizontalDivider()
            SwitchRow(Tr["persistent"], pr.persistent, Tr["persistentNote"]) { pr.persistent = it; Widget.update(s.act); s.changed() }
        }
        SectionTitle(Tr["school"])
        Card0 {
            Choice(Tr["shafii"], pr.school == "shafii") { pr.school = "shafii"; s.changed() }
            Choice(Tr["hanafi"], pr.school == "hanafi") { pr.school = "hanafi"; s.changed() }
        }
        SectionTitle(Tr["method"])
        Card0 {
            Choice(Tr["mAuto"] + " — " + Tr[PrayerCalc.defaultMethod(pr.place?.country ?: "")], pr.method.isEmpty()) { pr.method = ""; s.changed() }
            for (m in PrayerCalc.METHODS) Choice(Tr[m.key], pr.method == m.key) { pr.method = m.key; s.changed() }
        }
        SectionTitle(Tr["adjust"])
        Card0 {
            for (p in listOf(P.FAJR, P.SUNRISE, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)) Stepper(Tr.p(p), pr.adjust(p), -30, 30, 1) { pr.setAdjust(p, it); s.changed() }
            // Tahajjud (the last third of the night): the calculated time, moved earlier or later by up to 200 minutes
            Stepper(Tr.p(P.TAHAJJUD), pr.adjust(P.TAHAJJUD), -200, 200, 5) { pr.setAdjust(P.TAHAJJUD, it); s.changed() }
        }
        SectionTitle(Tr["naflTimes"])
        Card0 {
            Stepper(Tr["ishraqAfter"], pr.ishraqAfter, 5, 60, 1) { pr.ishraqAfter = it; s.changed() }
            Stepper(Tr["chashtAfter"], pr.chashtAfter, 20, 240, 5) { pr.chashtAfter = it; s.changed() }
            Stepper(Tr["zawalBefore"], pr.zawalBefore, 0, 30, 1) { pr.zawalBefore = it; s.changed() }
        }
        SectionTitle(Tr["vibPage"])
        Card0 { Text(Tr["vibPage"] + "  ›", Modifier.fillMaxWidth().clickable { s.page = "vibration"; s.sub = "" }.padding(vertical = 8.dp), fontSize = 16.sp) }
        SectionTitle(Tr["hijriAdj"])
        Card0 { Stepper(Tr.hijri(Schedule.hijriNow(pr, pr.place!!, s.now)), pr.hijriAdjust, -2, 2, 1) { pr.hijriAdjust = it; s.changed() } }
        SectionTitle(Tr["dst"])
        Card0 {
            Choice(Tr["dstAuto"], pr.dst == "auto") { pr.dst = "auto"; s.changed() }
            Choice(Tr["dstOn"], pr.dst == "on") { pr.dst = "on"; s.changed() }
            Choice(Tr["dstOff"], pr.dst == "off") { pr.dst = "off"; s.changed() }
            HorizontalDivider()
            SwitchRow(Tr["h24"], pr.h24) { pr.h24 = it; s.changed() }
        }
        SectionTitle(Tr["weekStart"])
        Card0 {
            Row(Modifier.horizontalScroll(rememberScrollState())) {
                for (v in listOf(1, 6, 7)) FilterChip(pr.weekStart == v, { pr.weekStart = v; s.changed() }, { Text(Tr.dayName(v)) }, Modifier.padding(end = 8.dp))
            }
        }
        Spacer(Modifier.height(30.dp))
    }
}

/** the phone's location now (a fresh fix when it can, else the last known), on the main thread */
@SuppressLint("MissingPermission")
fun currentLocation(act: org.turath.salat.MainActivity, done: (android.location.Location?) -> Unit) {
    val lm = act.getSystemService(LocationManager::class.java)
    val last = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER)
        .mapNotNull { runCatching { lm.getLastKnownLocation(it) }.getOrNull() }.maxByOrNull { it.time }
    if (last != null && System.currentTimeMillis() - last.time < 2 * 60_000) { done(last); return }
    val prov = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER).firstOrNull { runCatching { lm.isProviderEnabled(it) }.getOrDefault(false) }
    if (prov == null || Build.VERSION.SDK_INT < 30) { done(last); return }
    var sent = false
    lm.getCurrentLocation(prov, null, act.mainExecutor) { l -> if (!sent) { sent = true; done(l ?: last) } }
    // no answer in 12 seconds: the last known place
    android.os.Handler(android.os.Looper.getMainLooper()).postDelayed({ if (!sent) { sent = true; done(last) } }, 12_000)
}

/** the phone's location: the nearest city gives the name and the time zone */
@SuppressLint("MissingPermission")
fun gps(s: AppState) {
    val act = s.act
    if (!act.hasLocation()) { act.onPermResult = { if (act.hasLocation()) gps(s) }; act.askLocation(); return }
    val lm = act.getSystemService(LocationManager::class.java)
    fun use(l: android.location.Location?) {
        if (l == null) return
        Thread {
            val c = Cities.nearest(act, l.latitude, l.longitude) ?: return@Thread
            act.runOnUiThread {
                s.prefs.place = Place(c.name, c.country, l.latitude, l.longitude, c.tz); s.prefs.placeByGps = true; s.sub = ""; s.page = ""; s.changed()
            }
        }.start()
    }
    val last = listOf(LocationManager.GPS_PROVIDER, LocationManager.NETWORK_PROVIDER, LocationManager.PASSIVE_PROVIDER)
        .mapNotNull { runCatching { lm.getLastKnownLocation(it) }.getOrNull() }.maxByOrNull { it.time }
    if (last != null && System.currentTimeMillis() - last.time < 3 * 3600_000) { use(last); return }
    if (Build.VERSION.SDK_INT >= 30) lm.getCurrentLocation(LocationManager.NETWORK_PROVIDER.takeIf { lm.isProviderEnabled(it) } ?: LocationManager.GPS_PROVIDER, null, act.mainExecutor) { use(it ?: last) }
    else use(last)
}

/** country, then city (or a search over all cities); for the world list it adds a city */
@Composable
fun CityPicker(s: AppState, world: Boolean, done: () -> Unit) {
    val act = s.act
    var cc by remember { mutableStateOf<String?>(null) }
    var q by remember { mutableStateOf("") }
    val countries = remember(Tr.lang) { Cities.countries(act, Tr.lang) }
    Column(Modifier.fillMaxSize()) {
        TopBar(if (cc == null) Tr["country"] else Cities.countryName(cc!!, Tr.lang)) { if (cc != null) { cc = null; q = "" } else done() }
        OutlinedTextField(q, { q = it }, Modifier.fillMaxWidth().padding(horizontal = 12.dp), singleLine = true,
            leadingIcon = { Icon(Icons.Outlined.Search, null) }, placeholder = { Text(Tr["search"]) })
        if (!world && cc == null) TextButton(onClick = { gps(s) }, Modifier.padding(horizontal = 8.dp)) { Icon(Icons.Outlined.MyLocation, null); Text(" " + Tr["useGps"]) }
        val pick: (Cities.City) -> Unit = { c ->
            if (world) s.prefs.worldCities = s.prefs.worldCities + c.place()
            else { s.prefs.place = c.place(); s.prefs.placeByGps = false }
            s.changed(); done()
        }
        LazyColumn(Modifier.fillMaxSize()) {
            if (cc == null) {
                val qq = q.trim().lowercase()
                // a city typed straight away (3 letters or more) is searched in all countries
                if (qq.length >= 3) items(Cities.search(act, qq)) { c ->
                    ListItem(headlineContent = { Text(Cities.display(c, Tr.lang)) }, supportingContent = { Text(Cities.countryName(c.country, Tr.lang)) }, modifier = Modifier.clickable { pick(c) })
                }
                items(countries.filter { qq.isEmpty() || it.second.lowercase().contains(qq) || it.first.lowercase() == qq }) { (code, name) ->
                    ListItem(headlineContent = { Text(name) }, trailingContent = { Text(code) }, modifier = Modifier.clickable { cc = code; q = "" })
                }
            } else items(Cities.inCountry(act, cc!!, q).take(400)) { c ->
                ListItem(headlineContent = { Text(Cities.display(c, Tr.lang)) }, supportingContent = { if (Cities.display(c, Tr.lang) != c.name) Text(c.name) },
                    modifier = Modifier.clickable { pick(c) })
            }
        }
    }
}
