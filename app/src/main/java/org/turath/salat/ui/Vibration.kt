package org.turath.salat.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.turath.salat.*

/** the phone on vibrate at prayer time: for each of the five prayers and for Jumu'ah on its own */
@Composable
fun VibrationPage(s: AppState, back: () -> Unit) {
    val pr = s.prefs
    val act = s.act
    @Suppress("UNUSED_VARIABLE") val tick = s.now          // the permission is checked again as the screen is drawn again
    var ver by remember { mutableIntStateOf(0) }
    @Suppress("UNUSED_VARIABLE") val v = ver
    Column(Modifier.fillMaxSize().verticalScroll(rememberScrollState())) {
        TopBar(Tr["vibPage"], back)
        Text(Tr["vibNote"], Modifier.padding(horizontal = 16.dp, vertical = 4.dp), fontSize = 13.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .7f))
        if (act.needDnd()) Card0 {
            Text(Tr["vibNeed"], Modifier.fillMaxWidth().clickable { act.askDnd() }.padding(vertical = 6.dp), color = Color(0xFFB3261E), fontWeight = FontWeight.Bold)
        }
        for (k in listOf("FAJR", "DHUHR", "ASR", "MAGHRIB", "ISHA", "JUMUAH")) {
            val on = pr.vibOn(k)
            Card0 {
                SwitchRow(if (k == "JUMUAH") Tr["JUMUAH"] else Tr[k], on) { x -> pr.setVibOn(k, x); ver++; s.changed(); if (x && act.needDnd()) act.askDnd() }
                val iq = if (k == "JUMUAH") LocalMasjid.jumuah(pr).minOrNull() ?: -1 else LocalMasjid.iqamah(pr, k)
                val byIq = iq >= 0 && pr.vibByIq(k)
                if (on && iq >= 0) {
                    SwitchRow(Tr["vibFollowIq"], pr.vibByIq(k), Tr["vibIqAt"] + " " + Tr.num(iq / 60) + ":" + Tr.num(iq % 60).padStart(2, '0')) { x -> pr.setVibByIq(k, x); ver++; s.changed() }
                }
                if (on && byIq) {
                    var lead by remember(k) { mutableFloatStateOf(pr.vibLead(k).toFloat()) }
                    Text(Tr.num(lead.toInt()) + " " + Tr["min"] + " " + Tr["vibBeforeIq"], fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Slider(lead, { lead = it }, valueRange = 0f..60f, steps = 59, onValueChangeFinished = { pr.setVibLead(k, lead.toInt()); s.changed() })
                    var len by remember(k) { mutableFloatStateOf(pr.vibLen(k).toFloat()) }
                    Text(Tr["vibLasts"] + ": " + Tr.num(len.toInt()) + " " + Tr["min"], fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Slider(len, { len = it }, valueRange = 0f..120f, steps = 119, onValueChangeFinished = { pr.setVibLen(k, len.toInt()); s.changed() })
                } else if (on) {
                    Row(verticalAlignment = Alignment.CenterVertically) {
                        Text(Tr["vibFromAdhan"], Modifier.weight(1f), fontSize = 14.sp)
                        ChoiceChip(!pr.vibAfter(k), { pr.setVibAfter(k, false); ver++; s.changed() }, { Text(Tr["before"]) }, Modifier.padding(end = 6.dp))
                        ChoiceChip(pr.vibAfter(k), { pr.setVibAfter(k, true); ver++; s.changed() }, { Text(Tr["after"]) })
                    }
                    var from by remember(k) { mutableFloatStateOf(pr.vibFrom(k).toFloat()) }
                    Text(Tr.num(from.toInt()) + " " + Tr["min"] + " " + (if (pr.vibAfter(k)) Tr["after"] else Tr["before"]), fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Slider(from, { from = it }, valueRange = 0f..120f, steps = 119, onValueChangeFinished = { pr.setVibFrom(k, from.toInt()); s.changed() })
                    var len by remember(k) { mutableFloatStateOf(pr.vibLen(k).toFloat()) }
                    Text(Tr["vibLasts"] + ": " + Tr.num(len.toInt()) + " " + Tr["min"], fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Slider(len, { len = it }, valueRange = 0f..120f, steps = 119, onValueChangeFinished = { pr.setVibLen(k, len.toInt()); s.changed() })
                }
            }
        }
        Spacer(Modifier.height(30.dp))
    }
}
