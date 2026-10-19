package org.turath.salat.ui

import android.content.Intent
import android.media.AudioManager
import android.net.Uri
import androidx.activity.compose.BackHandler
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.selection.SelectionContainer
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.VolumeUp
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import org.turath.salat.*
import java.time.ZonedDateTime

/** shared state of the screens: the settings, the time now (every second) and a counter that redraws after a change */
class AppState(val act: MainActivity) {
    val prefs = Prefs(act)
    var version by mutableIntStateOf(0)
    var now by mutableStateOf(ZonedDateTime.now())
    // kept here so that a redraw after a change does not leave the screen the user is on
    var tab by mutableIntStateOf(0)
    var page by mutableStateOf("")        // a page opened from the menu ("settings", "widgets" …), "" = the tabs
    var sub by mutableStateOf("")         // a sub-page of a page ("city" …)
    fun changed() { version++; Thread { runCatching { Alarms.schedule(act) } }.start() }
    fun fmt(t: ZonedDateTime) = Alarms.fmt(prefs, t)
}

val Gold = Color(0xFFE0B54A)
val Ink = Color(0xFF14213D)
val Teal = Color(0xFF0E6F78)
val Blue = Color(0xFF1F8FD1)

/** dark from Maghrib to sunrise and light by day (the user can fix one) */
fun isDark(s: AppState, phoneDark: Boolean): Boolean = when (s.prefs.theme) {
    "dark" -> true; "light" -> false; "phone" -> phoneDark
    else -> {
        val place = s.prefs.place
        if (place == null) phoneDark else {
            val now = s.now.withZoneSameInstant(Schedule.zone(place))
            val t = Schedule.day(s.prefs, place, now.toLocalDate())
            now.isBefore(t[P.SUNRISE]) || !now.isBefore(t[P.MAGHRIB])
        }
    }
}

@Composable
fun App(act: MainActivity) {
    val s = remember { AppState(act) }
    Tr.lang = s.prefs.lang.ifEmpty { "en" }
    LaunchedEffect(Unit) { while (true) { s.now = ZonedDateTime.now(); delay(1000) } }
    LaunchedEffect(act.tabRequest) { if (act.tabRequest >= 0) { s.page = ""; s.sub = ""; s.tab = act.tabRequest; act.tabRequest = -1 } }
    val dark = isDark(s, androidx.compose.foundation.isSystemInDarkTheme())
    val acc = s.prefs.appAccent.takeIf { it >= 0 }?.let { Color(Pal.COLORS[it]) }
    val scheme = if (dark) darkColorScheme(primary = acc ?: Gold, secondary = Color(0xFF6FC3C9), surface = Color(0xFF1A1D22), background = Color(0xFF111316),
        surfaceContainer = Color(0xFF1A1D22), onSurface = Color(0xFFEDEDED), onBackground = Color(0xFFEDEDED),
        secondaryContainer = Color(0xFF363B43), onSecondaryContainer = Color(0xFFEDEDED), primaryContainer = Color(0xFF363B43), onPrimaryContainer = Color(0xFFEDEDED))
    else lightColorScheme(primary = acc ?: Blue, secondary = Gold, surface = Color(0xFFFFFFFF), background = Color(0xFFF6F6F6), surfaceContainer = Color(0xFFFFFFFF),
        secondaryContainer = Color(0xFFE3E5E9), onSecondaryContainer = Color(0xFF1B1F27), primaryContainer = Color(0xFFE3E5E9), onPrimaryContainer = Color(0xFF1B1F27))
    val baseDensity = androidx.compose.ui.platform.LocalDensity.current
    MaterialTheme(colorScheme = scheme) {
        CompositionLocalProvider(LocalLayoutDirection provides if (Tr.rtl) LayoutDirection.Rtl else LayoutDirection.Ltr,
            androidx.compose.ui.platform.LocalDensity provides androidx.compose.ui.unit.Density(baseDensity.density, baseDensity.fontScale * s.prefs.appFont / 100f)) {
            Surface(Modifier.fillMaxSize(), color = MaterialTheme.colorScheme.background) {
              // the app's logo, faint, behind every screen
              val bg = bgBrush(s.prefs.bgStyle, dark)
              Box(Modifier.fillMaxSize().then(if (bg != null) Modifier.background(bg) else Modifier)) {
                androidx.compose.foundation.Image(androidx.compose.ui.res.painterResource(org.turath.salat.R.drawable.logo), null,
                    Modifier.align(Alignment.Center).fillMaxWidth(0.85f), alpha = if (dark) 0.07f else 0.09f)
                key(Tr.lang) {
                    // read here so that a change of settings draws the screens again, keeping where the user is (scroll, open page)
                    @Suppress("UNUSED_VARIABLE") val v = s.version
                    CrashReport(s)
                    if (s.prefs.place == null || s.prefs.lang.isEmpty()) Onboard(s) else Main(s)
                }
              }
            }
        }
    }
}

/** the app stopped last time: the report is shown on the screen (copy it, or send it by email) so the error can be found and fixed */
@Composable
fun CrashReport(s: AppState) {
    var text by remember { mutableStateOf(s.prefs.sp.getString("crash", null)) }
    val t = text ?: return
    fun clear() { s.prefs.sp.edit().remove("crash").apply(); text = null }
    AlertDialog(onDismissRequest = { clear() }, title = { Text(Tr["crashTitle"]) },
        text = {
            Column {
                Text(Tr["crashText"], fontSize = 14.sp)
                Spacer(Modifier.height(8.dp))
                Box(Modifier.fillMaxWidth().heightIn(max = 260.dp).background(MaterialTheme.colorScheme.onSurface.copy(alpha = .06f)).verticalScroll(rememberScrollState()).padding(6.dp)) {
                    SelectionContainer { Text(t.take(2500), fontSize = 10.sp, lineHeight = 13.sp, fontFamily = androidx.compose.ui.text.font.FontFamily.Monospace) }
                }
            }
        },
        confirmButton = {
            Row {
                TextButton(onClick = {
                    runCatching { s.act.getSystemService(android.content.ClipboardManager::class.java).setPrimaryClip(android.content.ClipData.newPlainText("crash", t)) }
                    android.widget.Toast.makeText(s.act, Tr["crashCopied"], android.widget.Toast.LENGTH_SHORT).show()
                }) { Text(Tr["crashCopy"]) }
                TextButton(onClick = {
                    runCatching { s.act.startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:turathkhairalquroon@gmail.com"))
                        .putExtra(Intent.EXTRA_SUBJECT, "Salat app crash " + runCatching { s.act.packageManager.getPackageInfo(s.act.packageName, 0).versionName }.getOrDefault(""))
                        .putExtra(Intent.EXTRA_TEXT, t)) }
                    clear()
                }) { Text(Tr["crashSend"]) }
            }
        },
        dismissButton = { TextButton(onClick = { clear() }) { Text(Tr["cancel"]) } })
}

private data class NavTab(val key: String, val icon: ImageVector)

@Composable
fun Main(s: AppState) {
    val tabs = listOf(NavTab("tHome", Icons.Outlined.Home), NavTab("tTimes", Icons.Outlined.FormatListBulleted),
        NavTab("tRem", Icons.Outlined.Alarm), NavTab("tCal", Icons.Outlined.CalendarMonth), NavTab("tQibla", Icons.Outlined.Explore), NavTab("world", Icons.Outlined.Public))
    if (s.page.isNotEmpty()) {
        BackHandler { if (s.sub.isNotEmpty()) s.sub = "" else s.page = "" }
        Page(s) { if (s.sub.isNotEmpty()) s.sub = "" else s.page = "" }
        return
    }
    val drawer = rememberDrawerState(DrawerValue.Closed)
    val scope = rememberCoroutineScope()
    var volume by remember { mutableStateOf(false) }
    BackHandler(drawer.isOpen) { scope.launch { drawer.close() } }
    // back from any tab leads to Home, and from Home leaves the app
    BackHandler(!drawer.isOpen && s.tab != 0) { s.tab = 0 }
    ModalNavigationDrawer(drawerState = drawer, drawerContent = {
        ModalDrawerSheet(Modifier.width(300.dp)) {
            Menu(s) { key ->
                scope.launch { drawer.close() }
                if (key == "volume") volume = true else { s.page = key; s.sub = if (key == "city") "city" else "" }
            }
        }
    }) {
        Scaffold(
            containerColor = Color.Transparent,
            bottomBar = {
                NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
                    // Home in the middle of the bar (the tab numbers stay as they are)
                    listOf(1, 2, 0, 3, 4, 5).forEach { i -> val t = tabs[i]
                        NavigationBarItem(selected = s.tab == i, onClick = { s.tab = i }, icon = { Icon(t.icon, Tr[t.key]) },
                            label = { Text(Tr[t.key], fontSize = 10.sp, maxLines = 1, softWrap = false) })
                    }
                }
            }
        ) { pad ->
            Box(Modifier.padding(bottom = pad.calculateBottomPadding()).fillMaxSize()) {
                when (s.tab) {
                    0 -> HomeScreen(s)
                    1 -> TimesScreen(s)
                    2 -> RemindersScreen(s)
                    3 -> CalendarScreen(s)
                    4 -> QiblaScreen(s)
                    else -> WorldPage(s) { s.tab = 0 }
                }
                // the menu button (top corner, as in the other screens)
                // the prayer times of other cities (Makkah, Madinah, al-Quds …) from the Today screen
                if (s.tab == 0) IconButton(onClick = { s.page = "world"; s.sub = "" }, Modifier.statusBarsPadding().padding(4.dp).align(Alignment.TopEnd)) {
                    Icon(Icons.Outlined.Public, Tr["world"])
                }
                if (s.tab != 4 && s.tab != 5) IconButton(onClick = { scope.launch { drawer.open() } }, Modifier.statusBarsPadding().padding(4.dp).align(Alignment.TopStart)) {
                    Icon(Icons.Outlined.Menu, Tr["menu"])
                }
            }
        }
    }
    if (volume) VolumeDialog(s) { volume = false }
}

@Composable
private fun Menu(s: AppState, open: (String) -> Unit) {
    val place = s.prefs.place
    Column(Modifier.fillMaxHeight().verticalScroll(rememberScrollState())) {
        Row(Modifier.fillMaxWidth().background(Brush.verticalGradient(listOf(Teal, Ink))).statusBarsPadding().padding(20.dp), verticalAlignment = Alignment.CenterVertically) {
            androidx.compose.foundation.Image(androidx.compose.ui.res.painterResource(org.turath.salat.R.drawable.logo), null, Modifier.size(56.dp).clip(androidx.compose.foundation.shape.RoundedCornerShape(14.dp)))
            Spacer(Modifier.width(14.dp))
            Column {
                Text(Tr["app"], color = Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                Text(place?.name ?: "", color = Gold, fontSize = 15.sp)
            }
        }
        @Composable fun item(key: String, icon: ImageVector, label: String) =
            NavigationDrawerItem(label = { Text(label, fontSize = 16.sp) }, selected = false, onClick = { open(key) }, icon = { Icon(icon, null) },
                modifier = Modifier.padding(horizontal = 8.dp))
        Spacer(Modifier.height(8.dp))
        item("city", Icons.Outlined.PushPin, Tr["location"])
        item("language", Icons.Outlined.Language, Tr["language"])
        item("volume", Icons.AutoMirrored.Outlined.VolumeUp, Tr["volume"])
        item("vibration", Icons.Outlined.Vibration, Tr["vibPage"])
        item("settings", Icons.Outlined.Settings, Tr["settings"])
        item("look", Icons.Outlined.Palette, Tr["look"])
        HorizontalDivider(Modifier.padding(vertical = 6.dp))
        item("world", Icons.Outlined.Public, Tr["world"])
        item("fasting", Icons.Outlined.NightsStay, Tr["fastingMenu"])
        item("durood", Icons.Outlined.FavoriteBorder, Tr["duroodMenu"])
        HorizontalDivider(Modifier.padding(vertical = 6.dp))
        item("email", Icons.Outlined.Email, Tr["contact"])
        item("about", Icons.Outlined.Info, Tr["about"])
    }
}

/** a page from the menu */
@Composable
private fun Page(s: AppState, back: () -> Unit) {
    when (s.page) {
        "city" -> CityPicker(s, false) { s.page = ""; s.sub = "" }
        "language" -> LanguagePage(s, back)
        "settings" -> SettingsScreen(s, back)
        "vibration" -> VibrationPage(s, back)
        "look" -> LookPage(s, back)
        "world" -> WorldPage(s, back)
        "fasting" -> FastingPage(s, back)
        "durood" -> DuroodPage(s, back)
        "about" -> AboutPage(s, back)
        "email" -> {
            LaunchedEffect(Unit) {
                runCatching { s.act.startActivity(Intent(Intent.ACTION_SENDTO, Uri.parse("mailto:turathkhairalquroon@gmail.com")).putExtra(Intent.EXTRA_SUBJECT, Tr["app"])) }
                s.page = ""
            }
        }
        else -> LaunchedEffect(Unit) { s.page = "" }
    }
}

/** the volume the adhan and the other sounds follow, with a test */
@Composable
fun VolumeDialog(s: AppState, close: () -> Unit) {
    val ctx = s.act
    val am = ctx.getSystemService(AudioManager::class.java)
    var src by remember { mutableStateOf(s.prefs.volStream) }
    val stream = when (src) { "ring" -> AudioManager.STREAM_RING; "alarm" -> AudioManager.STREAM_ALARM; else -> AudioManager.STREAM_MUSIC }
    val max = am.getStreamMaxVolume(stream)
    var v by remember(src) { mutableFloatStateOf(am.getStreamVolume(stream).toFloat()) }
    var playing by remember { mutableStateOf(false) }
    DisposableEffect(Unit) { onDispose { Preview.stop() } }
    AlertDialog(onDismissRequest = close, title = { Text(Tr["volume"]) },
        text = {
            Column {
                Text(Tr["volSource"], fontSize = 14.sp)
                for ((k, n) in listOf("media" to "volMedia", "ring" to "volRing", "alarm" to "volAlarm"))
                    Row(Modifier.fillMaxWidth().clickable { src = k; s.prefs.volStream = k }, verticalAlignment = Alignment.CenterVertically) {
                        RadioButton(src == k, { src = k; s.prefs.volStream = k }); Text(Tr[n], fontSize = 15.sp)
                    }
                Slider(v, { v = it; runCatching { am.setStreamVolume(stream, it.toInt(), 0) } }, valueRange = 0f..max.toFloat(), steps = (max - 1).coerceAtLeast(0))
                TextButton(onClick = {
                    if (playing) Preview.stop() else Preview.play(ctx, s.prefs.sound(P.DHUHR).takeIf { it.raw != null } ?: Snd.SHORT_HAYYA) { playing = false }
                    playing = !playing
                }) { Icon(if (playing) Icons.Outlined.StopCircle else Icons.Outlined.PlayCircle, null); Text("  " + Tr["test"]) }
                Text(Tr["volNote"], fontSize = 12.sp, color = MaterialTheme.colorScheme.onSurface.copy(alpha = .6f))
            }
        },
        confirmButton = { TextButton(onClick = close) { Text(Tr["ok"]) } })
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
