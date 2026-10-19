package org.turath.salat.ui

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.turath.salat.*

/** a row of colour circles: 0 … count-1 from Pal.COLORS, then (when `black`) black; «automatic» first when `auto`. -1 = automatic */
@Composable
fun Swatches(selected: Int, count: Int, auto: Boolean, black: Boolean, onPick: (Int) -> Unit) {
    val ring = MaterialTheme.colorScheme.onSurface
    Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState()).padding(vertical = 6.dp), verticalAlignment = Alignment.CenterVertically) {
        if (auto) { ChoiceChip(selected == -1, { onPick(-1) }, { Text(Tr["autoCol"]) }); Spacer(Modifier.width(10.dp)) }
        val all = (0 until count).toList() + (if (black) listOf(Pal.COLORS.size) else emptyList())
        for (i in all) {
            val c = Color(Pal.ink(i))
            Box(Modifier.size(36.dp).clip(CircleShape).background(c)
                .border(if (selected == i) BorderStroke(3.dp, ring) else BorderStroke(1.dp, ring.copy(alpha = .35f)), CircleShape)
                .clickable { onPick(i) })
            Spacer(Modifier.width(10.dp))
        }
    }
}

@Composable
private fun Label(t: String) = Text(t, fontWeight = FontWeight.Bold, fontSize = 15.sp, color = MaterialTheme.colorScheme.onSurface, modifier = Modifier.padding(top = 10.dp))

/** the prayer widget's border colour, text colour, moving-line colour and text size */
@Composable
fun WidgetLook(pr: Prefs, changed: () -> Unit) {
    var accent by remember { mutableIntStateOf(pr.widgetAccent) }
    var ink by remember { mutableIntStateOf(pr.widgetInk) }
    var tick by remember { mutableIntStateOf(pr.widgetTicker) }
    var size by remember { mutableIntStateOf(pr.widgetSize) }
    Column {
        Label(Tr["wBorderCol"])
        Swatches(accent, Pal.COLORS.size, false, false) { accent = it; pr.widgetAccent = it; changed() }
        Label(Tr["wFontCol"])
        Swatches(ink, Pal.COLORS.size, true, true) { ink = it; pr.widgetInk = it; changed() }
        Label(Tr["wTickerCol"])
        Swatches(tick, Pal.COLORS.size, true, true) { tick = it; pr.widgetTicker = it; changed() }
        Label(Tr["wFontSize"] + ": " + Tr.num(size) + "%")
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState())) {
            for (v in listOf(80, 90, 100, 115, 130, 150)) {
                ChoiceChip(size == v, { size = v; pr.widgetSize = v; changed() }, { Text(Tr.num(v)) }, Modifier.padding(end = 6.dp))
            }
        }
    }
}

/** the app's main colour and text size */
@Composable
fun AppLook(s: AppState) {
    val pr = s.prefs
    var acc by remember { mutableIntStateOf(pr.appAccent) }
    var size by remember { mutableIntStateOf(pr.appFont) }
    Column {
        Label(Tr["appColour"])
        Swatches(acc, 7, true, false) { acc = it; pr.appAccent = it; s.changed() }
        Label(Tr["appFontSize"] + ": " + Tr.num(size) + "%")
        Row(Modifier.fillMaxWidth().horizontalScroll(rememberScrollState())) {
            for (v in listOf(85, 100, 115, 130, 150)) {
                ChoiceChip(size == v, { size = v; pr.appFont = v; s.changed() }, { Text(Tr.num(v)) }, Modifier.padding(end = 6.dp))
            }
        }
    }
}
