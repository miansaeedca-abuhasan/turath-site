package org.turath.salat.ui

import android.content.ClipData
import android.content.ClipboardManager
import android.content.Intent
import android.net.Uri
import android.widget.Toast
import androidx.compose.foundation.ExperimentalFoundationApi
import androidx.compose.foundation.combinedClickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
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
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.turath.salat.*

/** mosques and musallas around: name and distance; a tap copies the address, the map button opens it in maps */
@OptIn(ExperimentalFoundationApi::class)
@Composable
fun MosqueFinder(s: AppState) {
    val place = s.prefs.place ?: return
    val ctx = s.act
    var km by remember { mutableIntStateOf(s.prefs.sp.getInt("mosqueKm", 15)) }
    var list by remember { mutableStateOf<List<Mosques.M>?>(null) }
    var err by remember { mutableStateOf(false) }
    var reload by remember { mutableIntStateOf(0) }
    // the centre of the search: the phone's location now (the city's centre only until it is known)
    var center by remember { mutableStateOf<Pair<Double, Double>?>(null) }
    var live by remember { mutableStateOf(false) }
    var asked by remember { mutableIntStateOf(0) }
    LaunchedEffect(asked) {
        if (!ctx.hasLocation()) { if (asked == 0) center = place.lat to place.lng; return@LaunchedEffect }
        currentLocation(ctx) { l -> if (l != null) { center = l.latitude to l.longitude; live = true } else if (center == null) center = place.lat to place.lng }
    }
    LaunchedEffect(km, reload, center) {
        val c = center ?: return@LaunchedEffect
        list = null; err = false
        list = withContext(Dispatchers.IO) { runCatching { Mosques.find(ctx, c.first, c.second, km) }.getOrNull() }
        if (list == null) err = true
    }
    Column(Modifier.fillMaxSize()) {
        // one short line: where the search is around, and Google Maps as an icon
        Row(Modifier.fillMaxWidth().padding(start = 16.dp, end = 4.dp), verticalAlignment = Alignment.CenterVertically) {
            Icon(if (live) Icons.Outlined.MyLocation else Icons.Outlined.LocationCity, null, tint = MaterialTheme.colorScheme.primary, modifier = Modifier.size(16.dp))
            Text(" " + (if (live) Tr["aroundYou"] else Tr["aroundCity"] + " " + place.name), Modifier.weight(1f), fontSize = 12.sp, maxLines = 1)
            if (!live) TextButton(onClick = { ctx.onPermResult = { asked++ }; if (ctx.hasLocation()) asked++ else ctx.askLocation() }) { Text(Tr["useGps"], fontSize = 12.sp) }
            IconButton(onClick = {
                runCatching { ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("geo:${center?.first ?: place.lat},${center?.second ?: place.lng}?q=" + Uri.encode("mosque")))) }
            }) { Icon(Icons.Outlined.Map, Tr["gmapsNearby"], tint = Color(0xFF34A853)) }
        }
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(Tr["radius"] + ": ", fontSize = 14.sp)
            for (k in listOf(3, 5, 10, 15, 25, 50)) {
                FilterChip(km == k, { km = k; s.prefs.sp.edit().putInt("mosqueKm", k).apply() }, { Text(Tr.num(k) + " " + Tr["km"]) })
                Spacer(Modifier.width(6.dp))
            }
        }
        Text((list?.let { Tr.num(it.size) + " " + Tr["mosquesFound"] + " · " } ?: "") + Tr["mosqueTapShort"], Modifier.padding(horizontal = 16.dp, vertical = 2.dp), fontSize = 11.sp,
            color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f), maxLines = 1)
        when {
            err -> Column(Modifier.padding(16.dp)) {
                Text(Tr["mosqueErr"], color = Color(0xFFB3261E))
                TextButton(onClick = { reload++ }) { Text(Tr["retry"]) }
            }
            list == null -> Box(Modifier.fillMaxWidth().padding(30.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            list!!.isEmpty() -> Text(Tr["mosqueNone"], Modifier.padding(16.dp))
            else -> {
                LazyColumn(Modifier.fillMaxSize()) {
                    items(list!!, key = { it.id }) { m ->
                        var addr by remember(m.id) { mutableStateOf(m.address) }
                        LaunchedEffect(m.id) { if (addr.isEmpty()) addr = withContext(Dispatchers.IO) { Mosques.address(ctx, m) }.also { m.address = it } }
                        var menu by remember { mutableStateOf(false) }
                        ListItem(
                            leadingContent = { Icon(Icons.Outlined.Mosque, null, tint = MaterialTheme.colorScheme.primary) },
                            headlineContent = { Text(m.name, fontWeight = FontWeight.Medium) },
                            supportingContent = { Text(addr, fontSize = 13.sp, maxLines = 2) },
                            trailingContent = {
                                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                                    Text(Tr.num("%.1f".format(m.km)) + " " + Tr["km"], fontWeight = FontWeight.Bold)
                                    Row {
                                    IconButton(onClick = {
                                        runCatching { ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}"))) }
                                    }) { Icon(Icons.Outlined.Directions, Tr["openMap"]) }
                                    IconButton(onClick = {
                                        ctx.getSystemService(ClipboardManager::class.java).setPrimaryClip(ClipData.newPlainText(m.name, m.name + "\n" + Mosques.address(ctx, m)))
                                        Toast.makeText(ctx, Tr["copied"], Toast.LENGTH_SHORT).show()
                                    }) { Icon(Icons.Outlined.ContentCopy, Tr["copyAddr"]) }
                                    }
                                }
                            },
                            modifier = Modifier.combinedClickable(
                                onClick = {
                                    val text = m.name + "\n" + Mosques.address(ctx, m)
                                    ctx.getSystemService(ClipboardManager::class.java).setPrimaryClip(ClipData.newPlainText(m.name, text))
                                    Toast.makeText(ctx, Tr["copied"], Toast.LENGTH_SHORT).show()
                                },
                                onLongClick = { menu = true })
                        )
                        DropdownMenu(menu, { menu = false }) {
                            DropdownMenuItem(text = { Text(Tr["hideMosque"]) }, onClick = {
                                Mosques.hide(s.prefs, m.id); list = list!!.filter { it.id != m.id }; menu = false
                            })
                        }
                        HorizontalDivider()
                    }
                    item { Text(Tr["mosqueSrc"], Modifier.padding(16.dp), fontSize = 12.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f)) }
                }
            }
        }
    }
}
