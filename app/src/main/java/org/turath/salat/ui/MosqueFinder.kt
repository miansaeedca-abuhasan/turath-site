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
    LaunchedEffect(km, reload) {
        list = null; err = false
        list = withContext(Dispatchers.IO) { runCatching { Mosques.find(ctx, place.lat, place.lng, km) }.getOrNull() }
        if (list == null) err = true
    }
    Column(Modifier.fillMaxSize()) {
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(horizontal = 12.dp), verticalAlignment = Alignment.CenterVertically) {
            Text(Tr["radius"] + ": ", fontSize = 14.sp)
            for (k in listOf(3, 5, 10, 15, 25, 50)) {
                FilterChip(km == k, { km = k; s.prefs.sp.edit().putInt("mosqueKm", k).apply() }, { Text(Tr.num(k) + " " + Tr["km"]) })
                Spacer(Modifier.width(6.dp))
            }
        }
        Text(Tr["mosqueTap"], Modifier.padding(horizontal = 16.dp, vertical = 4.dp), fontSize = 12.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .6f))
        when {
            err -> Column(Modifier.padding(16.dp)) {
                Text(Tr["mosqueErr"], color = Color(0xFFB3261E))
                TextButton(onClick = { reload++ }) { Text(Tr["retry"]) }
            }
            list == null -> Box(Modifier.fillMaxWidth().padding(30.dp), contentAlignment = Alignment.Center) { CircularProgressIndicator() }
            list!!.isEmpty() -> Text(Tr["mosqueNone"], Modifier.padding(16.dp))
            else -> {
                Text(Tr.num(list!!.size) + " " + Tr["mosquesFound"], Modifier.padding(horizontal = 16.dp), fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
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
                                    IconButton(onClick = {
                                        runCatching { ctx.startActivity(Intent(Intent.ACTION_VIEW, Uri.parse("geo:${m.lat},${m.lng}?q=${m.lat},${m.lng}(${Uri.encode(m.name)})"))) }
                                    }) { Icon(Icons.Outlined.Map, Tr["openMap"]) }
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
