package org.turath.salat.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.turath.salat.*

/** the mosques round the phone (live location), nearest first; Ahl as-Sunnah only as far as the data allows */
@OptIn(ExperimentalLayoutApi::class)
@Composable
fun MosquesPage(s: AppState, back: () -> Unit) {
    val act = s.act
    var radius by remember { mutableIntStateOf(s.prefs.mosqRadius) }
    val place = s.prefs.place
    var hidden by remember { mutableStateOf(s.prefs.hiddenMosques) }
    var state by remember { mutableIntStateOf(0) }          // 0 loading, 1 list, 2 error
    var all by remember { mutableStateOf<List<Mosques.M>>(emptyList()) }
    var reload by remember { mutableIntStateOf(0) }
    LaunchedEffect(Unit) { if (!act.hasLocation()) { act.onPermResult = { reload++ }; act.askLocation() } }
    LaunchedEffect(reload, radius > 50) {
        state = 0
        val here = Mosques.here(act, s.prefs.place)
        if (here == null) { state = 2; return@LaunchedEffect }
        val r = withContext(Dispatchers.IO) { runCatching { Mosques.find(act, here.first, here.second, if (radius > 50) 100 else 50) } }
        r.onSuccess { all = it; state = 1 }.onFailure { state = 2 }
    }
    val shown = all.filter { it.km <= radius + 0.5 && it.id !in hidden }
    Column(Modifier.fillMaxSize()) {
        TopBar(Tr["mosques"], back)
        LazyColumn(Modifier.fillMaxSize(), contentPadding = PaddingValues(horizontal = 16.dp, vertical = 8.dp), verticalArrangement = Arrangement.spacedBy(10.dp)) {
            item {
                Text(Tr["mosqRadius"], fontSize = 13.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .7f))
                FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp), verticalArrangement = Arrangement.spacedBy(8.dp), modifier = Modifier.padding(top = 6.dp)) {
                    for (v in listOf(1, 2, 5, 10, 25, 50, 100)) ChoiceChip(radius == v, { radius = v; s.prefs.mosqRadius = v }, { Text(Tr.num(v) + " " + Tr["km"]) })
                }
                Spacer(Modifier.height(8.dp))
                // Google Maps knows every masjid and prayer room: the buttons open it round the phone's place
                Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    for ((q, k) in listOf("masjid" to "gmapsNearby", "prayer room" to "gmapsPrayer")) OutlinedButton(onClick = {
                        val la = place?.lat ?: 0.0; val ln = place?.lng ?: 0.0
                        val u = Uri.parse("geo:$la,$ln?q=" + Uri.encode(q))
                        runCatching { act.startActivity(Intent(Intent.ACTION_VIEW, u)) }.onFailure {
                            runCatching { act.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/maps/search/" + Uri.encode(q) + "/@$la,$ln,14z"))) }
                        }
                    }, Modifier.weight(1f), contentPadding = PaddingValues(horizontal = 8.dp, vertical = 4.dp)) { Text(Tr[k], fontSize = 12.sp, textAlign = androidx.compose.ui.text.style.TextAlign.Center) }
                }
            }
            if (state == 1) item { Text(Tr["mosqCount"] + ": " + Tr.num(shown.size) + "  (" + Tr.num(all.size) + ")", fontSize = 15.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary) }
            when {
                state == 0 -> item { Box(Modifier.fillMaxWidth().padding(32.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() } }
                state == 2 -> item {
                    Column(horizontalAlignment = Alignment.CenterHorizontally, modifier = Modifier.fillMaxWidth().padding(24.dp)) {
                        Text(Tr["mosqErr"], fontSize = 15.sp)
                        OutlinedButton(onClick = { reload++ }, Modifier.padding(top = 10.dp)) { Text("↻") }
                    }
                }
                shown.isEmpty() -> item { Text(Tr["mosqNone"], Modifier.padding(24.dp), fontSize = 15.sp) }
                else -> items(shown, key = { it.id }) { m ->
                    Card0 {
                        Column(Modifier.padding(14.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(m.name.ifEmpty { Tr["mosqUnnamed"] }, Modifier.weight(1f), fontSize = 17.sp, fontWeight = FontWeight.Bold)
                                Text(Tr.num("%.1f".format(m.km)) + " " + Tr["km"], fontSize = 14.sp, color = MaterialTheme.colorScheme.primary, fontWeight = FontWeight.Bold)
                            }
                            if (m.address.isNotEmpty()) Text(m.address, Modifier.padding(top = 4.dp), fontSize = 14.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .75f))
                            if (m.sunni) Text("✓ " + Tr["mosqSunni"], Modifier.padding(top = 4.dp), fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .6f))
                            Row(Modifier.padding(top = 8.dp), horizontalArrangement = Arrangement.spacedBy(6.dp)) {
                                OutlinedButton(onClick = {
                                    val txt = (m.name.ifEmpty { Tr["mosqUnnamed"] }) + "\n" + m.address.ifEmpty { "%.5f, %.5f".format(m.lat, m.lng) }
                                    act.getSystemService(ClipboardManager::class.java).setPrimaryClip(ClipData.newPlainText("address", txt))
                                    Toast.makeText(act, Tr["mosqCopied"], Toast.LENGTH_SHORT).show()
                                }, contentPadding = PaddingValues(horizontal = 10.dp)) { Text(Tr["mosqCopy"], fontSize = 13.sp, maxLines = 1) }
                                OutlinedButton(onClick = {
                                    val u = Uri.parse("geo:${m.lat},${m.lng}?q=${m.lat},${m.lng}(${Uri.encode(m.name.ifEmpty { Tr["mosqUnnamed"] })})")
                                    runCatching { act.startActivity(Intent(Intent.ACTION_VIEW, u)) }.onFailure {
                                        runCatching { act.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.openstreetmap.org/?mlat=${m.lat}&mlon=${m.lng}#map=18/${m.lat}/${m.lng}"))) }
                                    }
                                }, contentPadding = PaddingValues(horizontal = 10.dp)) { Text(Tr["mosqMap"], fontSize = 13.sp, maxLines = 1) }
                                TextButton(onClick = { hidden = hidden + m.id; s.prefs.hiddenMosques = hidden }, contentPadding = PaddingValues(horizontal = 10.dp)) { Text(Tr["mosqHide"], fontSize = 13.sp, maxLines = 1) }
                            }
                        }
                    }
                }
            }
            if (hidden.isNotEmpty()) item { TextButton(onClick = { hidden = emptySet(); s.prefs.hiddenMosques = hidden }) { Text(Tr["mosqRestore"] + " (" + Tr.num(hidden.size) + ")", fontSize = 13.sp) } }
            if (Mosques.info.isNotEmpty()) item { Text(Tr.num(shown.size) + " / " + Mosques.info, fontSize = 11.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .45f)) }
            if (Mosques.skipped.isNotEmpty()) item { Text(Tr["mosqHidden"] + " (" + Tr.num(Mosques.skipped.size) + "): " + Mosques.skipped.take(12).joinToString("، "), fontSize = 11.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .45f)) }
            item { Text(Tr["mosqNote"], fontSize = 12.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .55f), modifier = Modifier.padding(vertical = 10.dp)) }
        }
    }
}
