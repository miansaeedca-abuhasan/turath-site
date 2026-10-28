package org.turath.salat.ui

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
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import org.turath.salat.*
import java.time.ZonedDateTime

/** «My local masjid»: the masjid's name and place, and its congregation (iqamah) times, written by the user as they are on the masjid's own
 *  timetable. The five prayers and up to three Jumu'ah prayers are shown in a table beside the calculated start times, and the phone's
 *  vibration is set to start at the masjid's time (it can be changed on the vibration page afterwards). */
object LocalMasjid {
    fun name(pr: Prefs) = pr.sp.getString("lm_name", "") ?: ""
    fun city(pr: Prefs) = pr.sp.getString("lm_city", "") ?: ""
    fun iqamah(pr: Prefs, k: String) = pr.sp.getInt("lm_iq_$k", -1)
    fun setIqamah(pr: Prefs, k: String, m: Int) = pr.sp.edit().putInt("lm_iq_$k", m).apply()
    fun jumuah(pr: Prefs): List<Int> = (pr.sp.getString("lm_jum", "") ?: "").split(",").mapNotNull { it.toIntOrNull() }.take(3)
    fun setJumuah(pr: Prefs, l: List<Int>) = pr.sp.edit().putString("lm_jum", l.take(3).joinToString(",")).apply()

    /** the vibration of a prayer starts when the masjid's iqamah is, counted from the start of the prayer */
    fun applyVibration(pr: Prefs, key: String, begin: ZonedDateTime, iqamahMin: Int) {
        val off = (iqamahMin - (begin.hour * 60 + begin.minute)).coerceIn(0, 120)
        pr.setVibAfter(key, true); pr.setVibFrom(key, off)
    }
}

@Composable
fun LocalMasjidPage(s: AppState, back: () -> Unit) {
    val pr = s.prefs
    val place = pr.place
    var ver by remember { mutableIntStateOf(0) }
    @Suppress("UNUSED_VARIABLE") val v = ver
    var name by remember { mutableStateOf(LocalMasjid.name(pr)) }
    var city by remember { mutableStateOf(LocalMasjid.city(pr).ifEmpty { place?.name ?: "" }) }
    val primary = MaterialTheme.colorScheme.primary
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        TopBar(Tr["lmMenu"], back)
        var q by remember { mutableStateOf("") }
        var hits by remember { mutableStateOf<List<MosqueSearch.Hit>>(emptyList()) }
        var searching by remember { mutableStateOf(false) }
        var status by remember { mutableStateOf("") }          // "", "busy", "ok", "none"
        var site by remember { mutableStateOf(pr.sp.getString("lm_site", "") ?: "") }
        val scope = rememberCoroutineScope()
        val ctx = androidx.compose.ui.platform.LocalContext.current
        // the search starts only when the «Search» tab (or the keyboard's search key) is pressed, not while the name is being typed
        var go by remember { mutableIntStateOf(0) }
        var asked by remember { mutableStateOf("") }
        LaunchedEffect(go) {
            if (go == 0 || q.trim().length < 2) return@LaunchedEffect
            asked = q.trim(); hits = emptyList(); searching = true
            hits = withContext(Dispatchers.IO) { runCatching { MosqueSearch.byName(asked, place?.lat ?: 0.0, place?.lng ?: 0.0) }.getOrDefault(emptyList()) }
            searching = false
        }
        /** the times of the masjid: from its website; if that gives nothing, from the website a web search finds; what the user wrote stays when nothing is found */
        fun resolve(n: String, c: String, given: String) {
            status = "busy"
            scope.launch {
                var t: MosqueSite.Times? = null
                var url = given
                if (url.isNotBlank()) t = withContext(Dispatchers.IO) { runCatching { MosqueSite.fetch(url) }.getOrNull() }
                if ((t == null || t.found < 3) && url.isNotBlank()) {
                    // the times may be drawn by a script on the page: the page is opened in an invisible browser and read as it then looks
                    val h = MosqueRender.html(ctx, if (url.startsWith("http")) url else "https://$url")
                    val p = h?.let { MosqueSite.parse(it) }
                    if (p != null && p.found > (t?.found ?: 0)) t = p
                    // the page that holds the times may be another page of the site (drawn by a script too): the links to «prayer times» are opened the same way
                    if ((t == null || t.found < 3) && h != null) {
                        for (l in MosqueSite.prayerLinks(h, if (url.startsWith("http")) url else "https://$url").take(2)) {
                            val p3 = MosqueRender.html(ctx, l)?.let { MosqueSite.parse(it) }
                            if (p3 != null && p3.found > (t?.found ?: 0)) t = p3
                            if ((t?.found ?: 0) >= 5) break
                        }
                    }
                    // many masjid pages show the times of the Ad-Din display page (portal.ad-din.ca/public/...): that page is then read the same way
                    if ((t == null || t.found < 3) && h != null) {
                        val d = Regex("https?://portal\\.ad-din\\.ca/public/[^\"'\\s<>)]+").find(h)?.value?.replace("&amp;", "&")
                        if (d != null) {
                            val p2 = MosqueRender.html(ctx, d)?.let { MosqueSite.parse(it) }
                            if (p2 != null && p2.found > (t?.found ?: 0)) t = p2
                        }
                    }
                }
                if (t == null || t.found < 3) {
                    val w = withContext(Dispatchers.IO) { runCatching { MosqueSearch.viaWeb(n, c) }.getOrNull() }
                    if (w != null) { url = w.first; t = w.second }
                }
                if (t == null || t.iq.size + (if (t.maghribAtSunset) 1 else 0) < 3) { status = "none"; return@launch }
                site = url; pr.sp.edit().putString("lm_site", url).apply()
                val pl = pr.place
                val day = if (pl != null) Schedule.day(pr, pl, java.time.LocalDate.now(Schedule.zone(pl))) else null
                if (t.maghribAtSunset && day != null) LocalMasjid.setIqamah(pr, "MAGHRIB", day[P.MAGHRIB].let { it.hour * 60 + it.minute + t.maghribAfter })
                for ((k, m) in t.iq) { LocalMasjid.setIqamah(pr, k, m); day?.let { d -> LocalMasjid.applyVibration(pr, k, d[P.valueOf(k)], m) } }
                if (t.jumuah.isNotEmpty()) { LocalMasjid.setJumuah(pr, t.jumuah); day?.let { d -> LocalMasjid.applyVibration(pr, "JUMUAH", d[P.DHUHR], t.jumuah.min()) } }
                status = "ok"; ver++; s.changed()
            }
        }
        fun choose(n: String, c: String, w: String) {
            name = n; city = c; site = w; q = ""; asked = ""
            pr.sp.edit().putString("lm_name", n).putString("lm_city", c).putString("lm_site", w).apply()
            resolve(n, c, w)
        }
        Card0 {
            OutlinedTextField(q, { q = it }, Modifier.fillMaxWidth(), label = { Text(Tr["lmSearch"]) }, leadingIcon = { Icon(Icons.Outlined.Search, null) }, singleLine = true,
                keyboardOptions = androidx.compose.foundation.text.KeyboardOptions(imeAction = androidx.compose.ui.text.input.ImeAction.Search),
                keyboardActions = androidx.compose.foundation.text.KeyboardActions(onSearch = { go++ }),
                trailingIcon = { if (searching) CircularProgressIndicator(Modifier.size(20.dp), strokeWidth = 2.dp) else TextButton(onClick = { go++ }, enabled = q.trim().length >= 2) { Text(Tr["lmGo"], fontWeight = FontWeight.Bold) } })
            if (asked.isNotEmpty() && !searching) {
                for (m in hits) Row(Modifier.fillMaxWidth().clickable { choose(m.name, m.city.ifEmpty { place?.name ?: "" }, m.website) }.padding(vertical = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Column(Modifier.weight(1f)) {
                        Text(m.name, fontWeight = FontWeight.Bold, fontSize = 15.sp)
                        Text(listOf(m.address, Tr.num("%.1f".format(m.km)) + " " + Tr["km"]).filter { it.isNotBlank() }.joinToString("  ·  "), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .7f))
                    }
                    if (m.website.isNotBlank()) Icon(Icons.Outlined.Language, null, tint = primary)
                }
                // not in the list: the name as typed, its website looked for on the web
                TextButton(onClick = { choose(asked, place?.name ?: "", "") }) { Icon(Icons.Outlined.Language, null); Text("  " + Tr["lmWeb"] + " «" + asked + "»") }
            }
        }
        when (status) {
            "busy" -> Row(Modifier.padding(horizontal = 20.dp, vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) { CircularProgressIndicator(Modifier.size(18.dp), strokeWidth = 2.dp); Text("  " + Tr["lmReading"], fontSize = 13.sp) }
            "ok" -> Text(Tr["lmOk"], Modifier.padding(horizontal = 20.dp, vertical = 6.dp), fontSize = 13.sp, color = primary, fontWeight = FontWeight.Bold)
            "none" -> Card0 {
                Text(Tr["lmFail"], fontSize = 13.sp, color = Color(0xFFB3261E))
                OutlinedTextField(site, { site = it; pr.sp.edit().putString("lm_site", it).apply() }, Modifier.fillMaxWidth().padding(top = 8.dp), singleLine = true, label = { Text(Tr["lmSite"]) },
                    trailingIcon = { IconButton(onClick = { resolve(name, city, site) }) { Icon(Icons.Outlined.Refresh, null) } })
            }
        }
        if (place != null && name.isNotBlank()) {
            val now = s.now.withZoneSameInstant(Schedule.zone(place))
            val day = Schedule.day(pr, place, now.toLocalDate())
            val st = Schedule.state(pr, place, now)
            val zone = Schedule.zone(place)
            fun at(m: Int) = now.toLocalDate().atStartOfDay(zone).plusMinutes(m.toLong())
            fun pick(cur: Int, set: (Int) -> Unit) {
                val c = if (cur >= 0) cur else (now.hour * 60 + now.minute)
                android.app.TimePickerDialog(s.act, { _, h, m -> set(h * 60 + m); ver++; s.changed() }, c / 60, c % 60, android.text.format.DateFormat.is24HourFormat(s.act)).show()
            }
            Card(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp), shape = RoundedCornerShape(16.dp)) {
                Column {
                    Box(Modifier.fillMaxWidth().background(primary)) {
                        Column(Modifier.fillMaxWidth().padding(vertical = 14.dp, horizontal = 48.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                            Text(name, color = Color.White, fontSize = 26.sp, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                            if (city.isNotBlank()) Text(city, color = Color.White.copy(alpha = .9f), fontSize = 15.sp)
                        }
                        // refresh: the masjid's committee changes the times from time to time
                        Box(Modifier.align(Alignment.TopEnd).size(48.dp), contentAlignment = Alignment.Center) {
                            if (status == "busy") CircularProgressIndicator(Modifier.size(22.dp), strokeWidth = 2.dp, color = Color.White)
                            else IconButton(onClick = { resolve(name, city, site) }) { Icon(Icons.Outlined.Refresh, Tr["lmRefresh"], tint = Color.White) }
                        }
                    }
                    Row(Modifier.fillMaxWidth().background(primary.copy(alpha = .85f)).padding(horizontal = 16.dp, vertical = 12.dp)) {
                        Text(Tr["lmSalah"], Modifier.weight(1.2f), color = Color.White, fontWeight = FontWeight.Bold)
                        Text(Tr["lmBegins"], Modifier.weight(1f), color = Color.White, fontWeight = FontWeight.Bold, textAlign = TextAlign.Center)
                        Text(Tr["lmIqamah"], Modifier.weight(1f), color = Color.White, fontWeight = FontWeight.Bold, textAlign = TextAlign.End)
                    }
                    var n = 0
                    @Composable
                    fun row(label: String, begin: String, iq: Int?, hot: Boolean, onClick: (() -> Unit)?, onRemove: (() -> Unit)? = null) {
                        val bg = if (hot) primary else if (n++ % 2 == 0) MaterialTheme.colorScheme.surface else primary.copy(alpha = .10f)
                        val ink = if (hot) Color.White else MaterialTheme.colorScheme.onSurface
                        Row(Modifier.fillMaxWidth().background(bg).padding(horizontal = 16.dp, vertical = 14.dp), verticalAlignment = Alignment.CenterVertically) {
                            Text(label, Modifier.weight(1.2f), color = ink, fontSize = 16.sp, fontWeight = if (hot) FontWeight.Bold else FontWeight.Normal)
                            Text(begin, Modifier.weight(1f), color = ink, fontSize = 16.sp, textAlign = TextAlign.Center)
                            if (iq != null) {
                                Row(Modifier.weight(1f).clickable(enabled = onClick != null) { onClick?.invoke() }, horizontalArrangement = Arrangement.End, verticalAlignment = Alignment.CenterVertically) {
                                    Text(if (iq >= 0) s.fmt(at(iq)) else "— — —", color = if (iq >= 0) ink else ink.copy(alpha = .5f), fontSize = 16.sp, fontWeight = FontWeight.Bold)
                                    if (onRemove != null) Icon(Icons.Outlined.Close, Tr["delete"], Modifier.padding(start = 6.dp).size(18.dp).clickable { onRemove() }, tint = ink.copy(alpha = .7f))
                                }
                            } else Spacer(Modifier.weight(1f))
                        }
                    }
                    for (p in listOf(P.FAJR, P.SUNRISE, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)) {
                        val hot = st.current == p
                        if (p == P.SUNRISE) row(Tr.p(p).substringBefore(" ("), s.fmt(day[p]), null, hot, null)
                        else {
                            val k = p.name
                            row(Tr.p(p).substringBefore(" ("), s.fmt(day[p]), LocalMasjid.iqamah(pr, k), hot, {
                                pick(LocalMasjid.iqamah(pr, k)) { m -> LocalMasjid.setIqamah(pr, k, m); LocalMasjid.applyVibration(pr, k, day[p], m) }
                            })
                        }
                    }
                    val jum = LocalMasjid.jumuah(pr)
                    jum.forEachIndexed { i, m ->
                        row(Tr["JUMUAH"] + (if (jum.size > 1) " " + Tr.num(i + 1) else ""), s.fmt(day[P.DHUHR]), m, false, {
                            pick(m) { x ->
                                val l = jum.toMutableList(); l[i] = x; LocalMasjid.setJumuah(pr, l)
                                LocalMasjid.applyVibration(pr, "JUMUAH", day[P.DHUHR], l.min())
                            }
                        }, {
                            val l = jum.toMutableList(); l.removeAt(i); LocalMasjid.setJumuah(pr, l); ver++; s.changed()
                        })
                    }
                    if (jum.size < 3) TextButton(onClick = {
                        pick(-1) { x ->
                            val l = (jum + x).sorted(); LocalMasjid.setJumuah(pr, l)
                            LocalMasjid.applyVibration(pr, "JUMUAH", day[P.DHUHR], l.min())
                        }
                    }, Modifier.fillMaxWidth()) { Icon(Icons.Outlined.Add, null); Text("  " + Tr["lmAddJumuah"]) }
                }
            }
            Text(Tr["lmNote"], Modifier.padding(horizontal = 20.dp, vertical = 8.dp), fontSize = 13.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .7f))
        } else {
            Text(Tr["lmIntro"], Modifier.padding(20.dp), fontSize = 14.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .7f))
        }
        Spacer(Modifier.height(30.dp))
    }
}
