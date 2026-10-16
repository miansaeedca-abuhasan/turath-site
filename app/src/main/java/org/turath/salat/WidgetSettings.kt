package org.turath.salat

import android.appwidget.AppWidgetManager
import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalLayoutDirection
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.LayoutDirection
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

/** the widgets' look (as in Salatuk): shown when a widget is placed, and from its ⚙ — transparency, light or dark */
class WidgetSettings : ComponentActivity() {
    override fun onCreate(b: Bundle?) {
        super.onCreate(b)
        val id = intent?.getIntExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, AppWidgetManager.INVALID_APPWIDGET_ID) ?: AppWidgetManager.INVALID_APPWIDGET_ID
        // placing the widget goes on even if this screen is left with «back»
        setResult(RESULT_OK, Intent().putExtra(AppWidgetManager.EXTRA_APPWIDGET_ID, id))
        val pr = Prefs(this)
        Tr.lang = pr.lang
        setContent {
            var alpha by remember { mutableIntStateOf(pr.widgetAlpha) }
            var light by remember { mutableStateOf(pr.widgetLight) }
            MaterialTheme(colorScheme = darkColorScheme(primary = Color(0xFFE0B54A))) {
                CompositionLocalProvider(LocalLayoutDirection provides if (Tr.rtl) LayoutDirection.Rtl else LayoutDirection.Ltr) {
                    Surface(Modifier.fillMaxSize(), color = Color(0xFF121212)) {
                        Column(Modifier.fillMaxSize().statusBarsPadding().padding(20.dp)) {
                            Row(verticalAlignment = Alignment.CenterVertically) {
                                Text(Tr["widgets"], Modifier.weight(1f), fontSize = 26.sp, fontWeight = FontWeight.Bold, color = Color.White)
                                TextButton(onClick = { Widget.update(this@WidgetSettings); finish() }) { Text(Tr["save"], fontSize = 18.sp) }
                            }
                            // a small preview of the background
                            Box(Modifier.fillMaxWidth().padding(vertical = 16.dp).height(70.dp).clip(RoundedCornerShape(18.dp)).background(Color(0xFF6A7F95))) {
                                Box(Modifier.fillMaxSize().clip(RoundedCornerShape(18.dp)).background((if (light) Color.White else Color(0xFF121A24)).copy(alpha = (100 - alpha) / 100f)),
                                    contentAlignment = Alignment.Center) {
                                    Text(Tr.p(P.ASR) + "  −1:24:00", color = if (light) Color(0xFF1B1B1B) else Color.White, fontSize = 22.sp, fontWeight = FontWeight.Bold)
                                }
                            }
                            Text(Tr["wBackground"], fontWeight = FontWeight.Bold, color = Color.White, fontSize = 18.sp)
                            for ((v, n) in listOf(false to "wDark", true to "wLight")) Row(Modifier.fillMaxWidth().clickable { light = v; pr.widgetLight = v; Widget.update(this@WidgetSettings) },
                                verticalAlignment = Alignment.CenterVertically) {
                                RadioButton(light == v, { light = v; pr.widgetLight = v; Widget.update(this@WidgetSettings) }); Text(Tr[n], color = Color.White, fontSize = 16.sp)
                            }
                            Spacer(Modifier.height(12.dp))
                            Text(Tr["transparency"], fontWeight = FontWeight.Bold, color = Color.White, fontSize = 18.sp)
                            for (v in listOf(0, 20, 40, 60, 80, 100)) Row(Modifier.fillMaxWidth().clickable { alpha = v; pr.widgetAlpha = v; Widget.update(this@WidgetSettings) },
                                verticalAlignment = Alignment.CenterVertically) {
                                RadioButton(alpha == v, { alpha = v; pr.widgetAlpha = v; Widget.update(this@WidgetSettings) }); Text(Tr.num(v) + "%", color = Color.White, fontSize = 16.sp)
                            }
                        }
                    }
                }
            }
        }
    }
}
