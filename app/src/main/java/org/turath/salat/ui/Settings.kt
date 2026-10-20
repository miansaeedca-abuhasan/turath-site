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
    ChoiceRow(sel, onClick) { Text(label, fontSize = 15.sp) }
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
            if (pr.school == "hanafi") Text(Tr["hanafiVibNote"], Modifier.padding(horizontal = 4.dp, vertical = 6.dp), fontSize = 13.sp, color = MaterialTheme.colorScheme.primary)
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
        Card0 { Stepper(Tr.hijri(Schedule.hijriNow(pr, pr.place!!, s.now)), pr.hijriAdjust, -3, 3, 1) { pr.hijriAdjust = it; s.changed() } }
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
                for (v in listOf(1, 6, 7)) ChoiceChip(pr.weekStart == v, { pr.weekStart = v; s.changed() }, { Text(Tr.dayName(v)) }, Modifier.padding(end = 8.dp))
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

/** the local area's name from the phone's address lookup (needs the system's geocoder, which works without the app having internet access); null when it has no answer */
@Suppress("DEPRECATION")
fun areaName(ctx: android.content.Context, lat: Double, lng: Double): String? = runCatching {
    if (!android.location.Geocoder.isPresent()) return null
    val g = android.location.Geocoder(ctx, java.util.Locale(if (Tr.lang == "en") "en" else Tr.lang))
    val a = if (Build.VERSION.SDK_INT >= 33) {
        val box = arrayOfNulls<List<android.location.Address>>(1); val latch = java.util.concurrent.CountDownLatch(1)
        g.getFromLocation(lat, lng, 1, object : android.location.Geocoder.GeocodeListener {
            override fun onGeocode(addresses: MutableList<android.location.Address>) { box[0] = addresses; latch.countDown() }
            override fun onError(errorMessage: String?) { latch.countDown() }
        })
        latch.await(6, java.util.concurrent.TimeUnit.SECONDS); box[0]?.firstOrNull()
    } else g.getFromLocation(lat, lng, 1)?.firstOrNull()
    a?.subLocality?.takeIf { it.isNotBlank() }
}.getOrNull()

class Found(val place: Place, val sub: String)

/** any town or neighbourhood typed by name, from the phone's address lookup (works without the app having internet access); the time zone comes from the nearest listed city */
@Suppress("DEPRECATION")
fun geoSearch(ctx: android.content.Context, q: String, cc: String?, near: Place?): List<Found> = runCatching {
    if (!android.location.Geocoder.isPresent()) return emptyList()
    val g = android.location.Geocoder(ctx, java.util.Locale(Tr.lang))
    fun ask(box: DoubleArray?): List<android.location.Address> = if (Build.VERSION.SDK_INT >= 33) {
        val out = arrayOfNulls<List<android.location.Address>>(1); val latch = java.util.concurrent.CountDownLatch(1)
        val cb = object : android.location.Geocoder.GeocodeListener {
            override fun onGeocode(addresses: MutableList<android.location.Address>) { out[0] = addresses; latch.countDown() }
            override fun onError(errorMessage: String?) { latch.countDown() }
        }
        if (box != null) g.getFromLocationName(q, 8, box[0], box[1], box[2], box[3], cb) else g.getFromLocationName(q, 8, cb)
        latch.await(8, java.util.concurrent.TimeUnit.SECONDS); out[0] ?: emptyList()
    } else (if (box != null) g.getFromLocationName(q, 8, box[0], box[1], box[2], box[3]) else g.getFromLocationName(q, 8)) ?: emptyList()
    // the places near the user's own place first (a «Malton» in Ontario before the one in Yorkshire), then the rest of the world
    val close = if (near != null) ask(doubleArrayOf(near.lat - 1.5, near.lng - 2.0, near.lat + 1.5, near.lng + 2.0)) else emptyList()
    val list: List<android.location.Address> = close + ask(null).filter { a -> close.none { it.latitude == a.latitude && it.longitude == a.longitude } }
    list.filter { it.hasLatitude() && it.hasLongitude() && (cc == null || it.countryCode == cc) }.mapNotNull { a ->
        // the name that was typed (Malton) rather than the big city around it (Mississauga)
        val ql = q.lowercase()
        val name = (listOfNotNull(a.subLocality, a.featureName, a.locality).firstOrNull { it.isNotBlank() && it.lowercase().contains(ql) }
            ?: a.subLocality ?: a.locality ?: a.featureName)?.takeIf { it.isNotBlank() } ?: return@mapNotNull null
        val tz = Cities.nearest(ctx, a.latitude, a.longitude)?.tz ?: return@mapNotNull null
        Found(Place(name, a.countryCode ?: "", a.latitude, a.longitude, tz), listOfNotNull(a.locality?.takeIf { it != name }, a.adminArea, a.countryName).distinct().joinToString(", "))
    }.distinctBy { it.place.name + it.sub }
}.getOrDefault(emptyList())

/** the phone's location: the area's name from the phone's address lookup, the time zone from the nearest city */
@SuppressLint("MissingPermission")
fun gps(s: AppState) {
    val act = s.act
    if (!act.hasLocation()) { act.onPermResult = { if (act.hasLocation()) gps(s) }; act.askLocation(); return }
    val lm = act.getSystemService(LocationManager::class.java)
    fun use(l: android.location.Location?) {
        if (l == null) return
        Thread {
            val c = Cities.nearest(act, l.latitude, l.longitude) ?: return@Thread
            // the name of the neighbourhood or town where the phone is (the phone's own address lookup); the nearest city of the list only as a fallback
            // the neighbourhood the phone's address lookup gives; else the nearest listed town within 8 km (Malton and the like); else the nearest city
            val near = Cities.nearestTown(act, l.latitude, l.longitude, 8.0)
            // a name the user chose before for this spot (Malton) comes first
            val mine = s.prefs.labels.filter { Cities.dist(l.latitude, l.longitude, it.lat, it.lng) <= 6.0 }.minByOrNull { Cities.dist(l.latitude, l.longitude, it.lat, it.lng) }
            val here = mine?.name ?: areaName(act, l.latitude, l.longitude) ?: near?.let { Cities.display(it, Tr.lang) }
            act.runOnUiThread {
                s.prefs.place = Place(here ?: c.name, c.country, l.latitude, l.longitude, c.tz); s.prefs.placeByGps = true; s.sub = ""; s.page = ""; s.changed()
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
            leadingIcon = { Icon(Icons.Outlined.Search, null) }, placeholder = { Text(Tr["cityHint"]) })
        if (!world && cc == null) TextButton(onClick = { gps(s) }, Modifier.padding(horizontal = 8.dp)) { Icon(Icons.Outlined.MyLocation, null); Text(" " + Tr["useGps"]) }
        var found by remember { mutableStateOf<List<Found>>(emptyList()) }
        LaunchedEffect(q, cc) {
            found = emptyList()
            if (q.trim().length >= 3) { kotlinx.coroutines.delay(700); found = kotlinx.coroutines.withContext(kotlinx.coroutines.Dispatchers.IO) { geoSearch(act, q.trim(), cc, s.prefs.place) } }
        }
        val pickFound: (Found) -> Unit = { f ->
            if (world) s.prefs.worldCities = s.prefs.worldCities + f.place
            else { s.prefs.place = f.place; s.prefs.placeByGps = false; s.prefs.addLabel(f.place) }
            s.changed(); done()
        }
        val pick: (Cities.City) -> Unit = { c ->
            if (world) s.prefs.worldCities = s.prefs.worldCities + c.place()
            else { s.prefs.place = c.place(); s.prefs.placeByGps = false }
            s.changed(); done()
        }
        LazyColumn(Modifier.fillMaxSize()) {
            if (cc == null) {
                val qq = q.trim().lowercase()
                items(found) { f -> ListItem(headlineContent = { Text(f.place.name) }, supportingContent = { Text(f.sub) }, leadingContent = { Icon(Icons.Outlined.Place, null) }, modifier = Modifier.clickable { pickFound(f) }) }
                // a city typed straight away (3 letters or more) is searched in all countries
                if (qq.length >= 3) items(Cities.search(act, qq)) { c ->
                    ListItem(headlineContent = { Text(Cities.display(c, Tr.lang)) }, supportingContent = { Text(Cities.countryName(c.country, Tr.lang)) }, modifier = Modifier.clickable { pick(c) })
                }
                items(countries.filter { qq.isEmpty() || it.second.lowercase().contains(qq) || it.first.lowercase() == qq }) { (code, name) ->
                    ListItem(headlineContent = { Text(name) }, trailingContent = { Text(code) }, modifier = Modifier.clickable { cc = code; q = "" })
                }
            } else {
                items(Cities.inCountry(act, cc!!, q).take(400)) { c ->
                    ListItem(headlineContent = { Text(Cities.display(c, Tr.lang)) }, supportingContent = { if (Cities.display(c, Tr.lang) != c.name) Text(c.name) },
                        modifier = Modifier.clickable { pick(c) })
                }
                items(found) { f -> ListItem(headlineContent = { Text(f.place.name) }, supportingContent = { Text(f.sub) }, leadingContent = { Icon(Icons.Outlined.Place, null) }, modifier = Modifier.clickable { pickFound(f) }) }
            }
        }
    }
}
