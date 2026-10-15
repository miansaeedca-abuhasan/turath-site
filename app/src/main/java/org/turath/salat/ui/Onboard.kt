package org.turath.salat.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import org.turath.salat.*

/** first start: the language, then the country and city (or the phone's location), then the permissions the alarms need */
@Composable
fun Onboard(s: AppState) {
    val pr = s.prefs
    if (pr.lang.isEmpty()) {
        Column(Modifier.fillMaxSize().background(Brush.verticalGradient(listOf(Color(0xFF0E6F78), Color(0xFF14213D)))).padding(24.dp),
            horizontalAlignment = Alignment.CenterHorizontally, verticalArrangement = Arrangement.Center) {
            Text("صلاۃ خیرالقرون", color = Color.White, fontSize = 34.sp, fontWeight = FontWeight.Bold)
            Text("صلاة خير القرون · Salat Khair al-Quroon", color = Gold, fontSize = 15.sp)
            Spacer(Modifier.height(40.dp))
            for ((k, n) in listOf("ur" to "اردو", "ar" to "العربية", "en" to "English"))
                Button(onClick = { pr.lang = k; Tr.lang = k; Alarms.channels(s.act); s.changed() }, Modifier.fillMaxWidth().padding(vertical = 6.dp).height(54.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = Color.White.copy(alpha = .15f))) { Text(n, fontSize = 20.sp, color = Color.White) }
        }
        return
    }
    Column(Modifier.fillMaxSize()) {
        Text(Tr["welcome"], Modifier.statusBarsPadding().padding(16.dp), fontSize = 18.sp, fontWeight = FontWeight.Bold, color = MaterialTheme.colorScheme.primary)
        Box(Modifier.weight(1f)) {
            CityPicker(s, false) {
                // the alarms need these; each opens the phone's own permission screen
                if (s.act.needNotifications()) s.act.askNotifications()
            }
        }
    }
}
