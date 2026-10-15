package org.turath.salat.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import org.turath.salat.*
import java.time.ZonedDateTime

/** shared state of the screens: the settings, the time now (every second) and a counter that redraws after a change */
class AppState(val act: MainActivity) {
    val prefs = Prefs(act)
    var version by mutableIntStateOf(0)
    var now by mutableStateOf(ZonedDateTime.now())
    // kept here so that a redraw after a change does not leave the screen the user is on
    var tab by mutableIntStateOf(0)
    var settings by mutableStateOf(false)
    var sub by mutableStateOf("")          // a sub-page of settings ("city", "adjust" …) or of onboarding
    fun changed() { version++; Thread { Alarms.schedule(act) }.start() }
    fun fmt(t: ZonedDateTime) = Alarms.fmt(prefs, t)
}

val Gold = Color(0xFFE0B54A)
val Ink = Color(0xFF14213D)
val Teal = Color(0xFF0E6F78)

/** colours of the sky at this hour (night, dawn, day, afternoon, sunset) */
fun sky(st: Schedule.State?, t: DayTimes?, now: ZonedDateTime): Brush {
    if (t == null) return Brush.verticalGradient(listOf(Color(0xFF0E6F78), Color(0xFF14213D)))
    val c = when {
        now.isBefore(t[P.FAJR]) || !now.isBefore(t[P.ISHA]) -> listOf(Color(0xFF07111F), Color(0xFF15294A))
        now.isBefore(t[P.SUNRISE]) -> listOf(Color(0xFF1B3366), Color(0xFFC98263))
        now.isBefore(t[P.ASR]) -> listOf(Color(0xFF1F6FB2), Color(0xFF7FC0EA))
        now.isBefore(t[P.MAGHRIB].minusMinutes(40)) -> listOf(Color(0xFF2A6CA6), Color(0xFFE6B565))
        now.isBefore(t[P.MAGHRIB].plusMinutes(20)) -> listOf(Color(0xFF51336F), Color(0xFFE07A4C))
        else -> listOf(Color(0xFF15264A), Color(0xFF3B2E66))
    }
    return Brush.verticalGradient(c)
}

@Composable
fun App(act: MainActivity) {
    val s = remember { AppState(act) }
    Tr.lang = s.prefs.lang.ifEmpty { "ur" }
    LaunchedEffect(Unit) { while (true) { s.now = ZonedDateTime.now(); delay(1000) } }
    val dark = androidx.compose.foundation.isSystemInDarkTheme()
    val scheme = if (dark) darkColorScheme(primary = Gold, secondary = Color(0xFF6FC3C9), surface = Color(0xFF111A24), background = Color(0xFF0A1118))
    else lightColorScheme(primary = Teal, secondary = Gold, surface = Color(0xFFFFFFFF), background = Color(0xFFF3F1EC))
    MaterialTheme(colorScheme = scheme) {
        CompositionLocalProvider(LocalLayoutDirection provides if (Tr.rtl) LayoutDirection.Rtl else LayoutDirection.Ltr) {
            key(s.version, Tr.lang) {
                if (s.prefs.place == null || s.prefs.lang.isEmpty()) Onboard(s) else Main(s)
            }
        }
    }
}

private data class Tab(val key: String, val icon: ImageVector)

@Composable
fun Main(s: AppState) {
    val tabs = listOf(Tab("tHome", Icons.Outlined.WbTwilight), Tab("tTimes", Icons.Outlined.FormatListBulleted),
        Tab("tRem", Icons.Outlined.Alarm), Tab("tCal", Icons.Outlined.CalendarMonth), Tab("tQibla", Icons.Outlined.Explore))
    if (s.settings) { SettingsScreen(s) { s.settings = false; s.sub = "" }; return }
    Scaffold(
        containerColor = MaterialTheme.colorScheme.background,
        bottomBar = {
            NavigationBar {
                tabs.forEachIndexed { i, t ->
                    NavigationBarItem(selected = s.tab == i, onClick = { s.tab = i }, icon = { Icon(t.icon, null) },
                        label = { Text(Tr[t.key], fontSize = 12.sp, maxLines = 1) })
                }
            }
        }
    ) { pad ->
        Box(Modifier.padding(bottom = pad.calculateBottomPadding()).fillMaxSize()) {
            when (s.tab) {
                0 -> HomeScreen(s) { s.settings = true }
                1 -> TimesScreen(s)
                2 -> RemindersScreen(s)
                3 -> CalendarScreen(s)
                else -> QiblaScreen(s)
            }
        }
    }
}

@Composable
fun SectionTitle(t: String) = Text(t, style = MaterialTheme.typography.titleMedium, fontWeight = FontWeight.Bold,
    color = MaterialTheme.colorScheme.primary, modifier = Modifier.padding(start = 16.dp, end = 16.dp, top = 20.dp, bottom = 6.dp))

@Composable
fun Card0(content: @Composable ColumnScope.() -> Unit) = Card(
    Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 5.dp),
    shape = MaterialTheme.shapes.large,
    colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.surface),
    elevation = CardDefaults.cardElevation(1.dp)
) { Column(Modifier.padding(14.dp), content = content) }

/** «+ 00:14:42» / «− 01:05:09» */
fun hms(sec: Long): String {
    val a = kotlin.math.abs(sec)
    return Tr.num("%02d:%02d:%02d".format(a / 3600, a / 60 % 60, a % 60))
}

fun Modifier.skyBg(b: Brush) = this.background(b)
