package org.turath.salat.ui

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.background
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
        val ctx = androidx.compose.ui.platform.LocalContext.current
        val place = pr.place
        val zone = place?.let { Schedule.zone(it) } ?: java.time.ZoneId.systemDefault()
        val today = java.time.LocalDate.now(zone)
        val keys = listOf("FAJR", "DHUHR", "ASR", "MAGHRIB", "ISHA", "JUMUAH")
        fun pOf(k: String) = if (k == "JUMUAH") P.DHUHR else P.valueOf(k)
        fun ram(d: java.time.LocalDate) = Schedule.hijriOf(pr, d).month == 9 || Schedule.hijriOf(pr, d.plusDays(1)).month == 9
        fun win(k: String, d: java.time.LocalDate) = VibWin.window(pr, k, Schedule.day(pr, place!!, d)[pOf(k)], d, zone, ram(d))
        fun say(m: String) = android.widget.Toast.makeText(ctx, m, android.widget.Toast.LENGTH_LONG).show()
        fun pick(w: java.time.ZonedDateTime, done: (java.time.LocalTime) -> Unit) {
            android.app.TimePickerDialog(ctx, android.R.style.Theme_Holo_Light_Dialog, { _, h, m -> done(java.time.LocalTime.of(h, m)) }, w.hour, w.minute, pr.h24).show()
        }
        /** sets the window of prayer k to [ns, ne] if the rules allow it */
        fun setWin(k: String, ns: java.time.ZonedDateTime, ne0: java.time.ZonedDateTime) {
            if (place == null) return
            var ne = ne0
            if (!ne.isAfter(ns)) ne = ne.plusDays(1)
            val len = java.time.Duration.between(ns, ne).toMinutes().toInt()
            val mx = VibWin.maxLen(k, ram(today))
            if (len > mx) { say(Tr["vibTMax"].replace("{a}", Tr.num(mx))); return }
            if (len <= 0) { say(Tr["vibTEnd"]); return }
            val begin = Schedule.day(pr, place, today)[pOf(k)]
            val iq = VibWin.iqamah(pr, k)
            val byIq = iq >= 0 && pr.vibByIq(k)
            val lead = if (byIq) java.time.Duration.between(ns, today.atTime(iq / 60, iq % 60).atZone(zone)).toMinutes().toInt() else 0
            val diff = java.time.Duration.between(begin, ns).toMinutes().toInt()
            if (byIq && (lead < 0 || lead > 60)) { say(Tr["vibTLead"]); return }
            if (!byIq && Math.abs(diff) > 120) { say(Tr["vibTFrom"]); return }
            for (o in keys) {
                if (o == k || !pr.vibOn(o) || pr.vibLen(o) <= 0) continue
                if ((o == "JUMUAH" && k == "DHUHR") || (o == "DHUHR" && k == "JUMUAH")) continue
                for (dd in -1L..1L) {
                    val ow = win(o, today.plusDays(dd))
                    if (ns.isBefore(ow.second) && ow.first.isBefore(ne)) { say(Tr["vibTOver"]); return }
                }
            }
            if (byIq) pr.setVibLead(k, lead) else { pr.setVibAfter(k, diff >= 0); pr.setVibFrom(k, Math.abs(diff)) }
            pr.setVibLen(k, len)
            ver++; s.changed()
        }
        for (k in keys) {
            val on = pr.vibOn(k)
            Fold(s, if (k == "JUMUAH") Tr["JUMUAH"] else Tr[k], k) {
            Card0 {
                SwitchRow(if (k == "JUMUAH") Tr["JUMUAH"] else Tr[k], on) { x -> pr.setVibOn(k, x); ver++; s.changed(); if (x && act.needDnd()) act.askDnd() }
                val iq = VibWin.iqamah(pr, k)
                if (on && iq >= 0) {
                    SwitchRow(Tr["vibFollowIq"], pr.vibByIq(k), Tr["vibIqAt"] + " " + Alarms.fmt(pr, java.time.ZonedDateTime.now().withHour(iq / 60).withMinute(iq % 60))) { x -> pr.setVibByIq(k, x); ver++; s.changed() }
                }
                if (on && place != null) {
                    val w = win(k, today)
                    val len = java.time.Duration.between(w.first, w.second).toMinutes().toInt()
                    val sum = if (VibWin.byIq(pr, k)) Tr["vibSumIq"].replace("{a}", Tr.num(pr.vibLead(k)))
                        else if (pr.vibFrom(k) == 0) Tr["vibSumAt"]
                        else Tr[if (pr.vibAfter(k)) "vibSumAfter" else "vibSumBefore"].replace("{a}", Tr.num(pr.vibFrom(k)))
                    Text(sum.replace("{b}", Tr.num(len)), Modifier.fillMaxWidth().padding(vertical = 4.dp), fontWeight = FontWeight.Bold, fontSize = 15.sp)
                    Row(Modifier.fillMaxWidth().padding(vertical = 6.dp), horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                        for (isStart in listOf(true, false)) {
                            val z = if (isStart) w.first else w.second
                            Column(Modifier.weight(1f).clip(androidx.compose.foundation.shape.RoundedCornerShape(14.dp))
                                .background(MaterialTheme.colorScheme.primary.copy(alpha = .10f))
                                .clickable {
                                    pick(z) { t ->
                                        if (isStart) setWin(k, today.atTime(t).atZone(zone), w.second)
                                        else setWin(k, w.first, w.first.toLocalDate().atTime(t).atZone(zone))
                                    }
                                }.padding(vertical = 12.dp), horizontalAlignment = Alignment.CenterHorizontally) {
                                Text(Tr[if (isStart) "vibStart" else "vibEnd"], fontSize = 13.sp, color = MaterialTheme.colorScheme.onBackground.copy(alpha = .7f))
                                Text(Alarms.fmt(pr, z), fontSize = 22.sp, fontWeight = FontWeight.Bold)
                            }
                        }
                    }
                }
            }
            }
        }
        Spacer(Modifier.height(30.dp))
    }
}
