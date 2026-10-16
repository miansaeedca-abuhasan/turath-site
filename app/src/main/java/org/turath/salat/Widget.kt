package org.turath.salat

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.os.SystemClock
import android.widget.RemoteViews
import java.time.LocalDate
import java.time.ZonedDateTime
import java.time.chrono.HijrahDate
import java.time.format.TextStyle
import java.util.Locale

/** the prayer widget (4×2): city and date, the current / next prayer with a live count, the six times */
class Widget : AppWidgetProvider() {
    override fun onUpdate(ctx: Context, mgr: AppWidgetManager, ids: IntArray) = update(ctx)

    companion object {
        private val IDS = intArrayOf(R.id.w0, R.id.w1, R.id.w2, R.id.w3, R.id.w4, R.id.w5)
        private val NAMES = intArrayOf(R.id.n0, R.id.n1, R.id.n2, R.id.n3, R.id.n4, R.id.n5)
        private val COLS = intArrayOf(R.id.c0, R.id.c1, R.id.c2, R.id.c3, R.id.c4, R.id.c5)
        private val SIX = listOf(P.FAJR, P.SUNRISE, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA)
        const val GOLD = 0xFFE0B54A.toInt()

        /** all the app's widgets */
        fun update(ctx: Context) {
            runCatching { prayer(ctx, Widget::class.java, R.layout.widget, true) }
            runCatching { prayer(ctx, WidgetSmall::class.java, R.layout.widget_small, false) }
            runCatching { WidgetCal.draw(ctx) }
        }

        fun ink(pr: Prefs) = if (pr.widgetLight) Color.parseColor("#1B1B1B") else Color.WHITE
        fun dim(pr: Prefs) = if (pr.widgetLight) Color.parseColor("#99000000") else Color.parseColor("#CCFFFFFF")

        /** the background with the chosen transparency, light or dark */
        fun background(v: RemoteViews, pr: Prefs) {
            v.setImageViewResource(R.id.bg, if (pr.widgetLight) R.drawable.wbg_light else R.drawable.wbg_dark)
            v.setInt(R.id.bg, "setImageAlpha", 255 * (100 - pr.widgetAlpha) / 100)
        }

        private fun prayer(ctx: Context, cls: Class<*>, layout: Int, full: Boolean) {
            val mgr = AppWidgetManager.getInstance(ctx)
            val ids = mgr.getAppWidgetIds(ComponentName(ctx, cls))
            if (ids.isEmpty()) return
            val pr = Prefs(ctx); val place = pr.place ?: return
            Tr.lang = pr.lang.ifEmpty { "ur" }
            val now = ZonedDateTime.now(Schedule.zone(place))
            val t = Schedule.day(pr, place, now.toLocalDate())
            val st = Schedule.state(pr, place, now)
            val v = RemoteViews(ctx.packageName, layout)
            background(v, pr)
            val ink = ink(pr); val dim = dim(pr)
            v.setTextViewText(R.id.city, place.name)
            v.setTextColor(R.id.prayer, ink); v.setTextColor(R.id.count, ink)
            // within 30 minutes of a prayer's time: count up from it; otherwise: count down to the next
            val upFrom = st.currentAt?.takeIf { st.current != P.SUNRISE && now.isBefore(it.plusMinutes(30)) }
            val base = SystemClock.elapsedRealtime() - System.currentTimeMillis()
            val shown = if (upFrom != null) st.current!! else st.next
            v.setTextViewText(R.id.prayer, Tr.p(shown).substringBefore(" ("))
            if (upFrom != null) {
                v.setChronometer(R.id.count, base + upFrom.toInstant().toEpochMilli(), "+%s", true)
                v.setChronometerCountDown(R.id.count, false)
            } else {
                v.setChronometer(R.id.count, base + st.nextAt.toInstant().toEpochMilli(), "−%s", true)
                v.setChronometerCountDown(R.id.count, true)
            }
            if (full) {
                SIX.forEachIndexed { i, p ->
                    val on = p == shown
                    v.setTextViewText(NAMES[i], Tr.p(p).substringBefore(" ("))
                    v.setTextViewText(IDS[i], Alarms.fmt(pr, t[p]).replace(" صبح", "").replace(" شام", "").replace(" am", "").replace(" pm", ""))
                    v.setTextColor(NAMES[i], if (on) GOLD else dim)
                    v.setTextColor(IDS[i], if (on) GOLD else ink)
                    v.setInt(COLS[i], "setBackgroundResource", if (on) R.drawable.wcal_special else R.drawable.wcal_none)
                }
                val h = Schedule.hijriNow(pr, place, now)
                val loc = Locale(Tr.lang)
                v.setTextViewText(R.id.date, now.dayOfWeek.getDisplayName(TextStyle.FULL, loc))
                v.setTextViewText(R.id.date2, Tr.hijri(h) + "   ·   " + Tr.num(now.toLocalDate().format(java.time.format.DateTimeFormatter.ofPattern("d-M-yyyy"))))
                v.setTextColor(R.id.date, dim); v.setTextColor(R.id.date2, dim)
            }
            v.setOnClickPendingIntent(R.id.root, PendingIntent.getActivity(ctx, 5, Intent(ctx, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE))
            mgr.updateAppWidget(ids, v)
        }
    }
}

/** the small prayer widget (4×1): the prayer and its count */
class WidgetSmall : AppWidgetProvider() {
    override fun onUpdate(ctx: Context, mgr: AppWidgetManager, ids: IntArray) = Widget.update(ctx)
}

/** the hijri calendar widget: a month with its gregorian dates; ‹ › change the month, the title goes back to this month */
class WidgetCal : AppWidgetProvider() {
    override fun onUpdate(ctx: Context, mgr: AppWidgetManager, ids: IntArray) = draw(ctx)

    override fun onReceive(ctx: Context, i: Intent) {
        val pr = Prefs(ctx)
        when (i.action) {
            "org.turath.salat.CAL_PREV" -> { pr.sp.edit().putInt("wcalOff", pr.sp.getInt("wcalOff", 0) - 1).apply(); draw(ctx) }
            "org.turath.salat.CAL_NEXT" -> { pr.sp.edit().putInt("wcalOff", pr.sp.getInt("wcalOff", 0) + 1).apply(); draw(ctx) }
            "org.turath.salat.CAL_TODAY" -> { pr.sp.edit().putInt("wcalOff", 0).apply(); draw(ctx) }
            else -> super.onReceive(ctx, i)
        }
    }

    companion object {
        private val ROWS = intArrayOf(R.id.r0, R.id.r1, R.id.r2, R.id.r3, R.id.r4, R.id.r5)
        private val HEADS = intArrayOf(R.id.d0, R.id.d1, R.id.d2, R.id.d3, R.id.d4, R.id.d5, R.id.d6)

        private fun act(ctx: Context, a: String, code: Int) = PendingIntent.getBroadcast(ctx, code,
            Intent(ctx, WidgetCal::class.java).setAction(a), PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)

        fun draw(ctx: Context) {
            val mgr = AppWidgetManager.getInstance(ctx)
            val ids = mgr.getAppWidgetIds(ComponentName(ctx, WidgetCal::class.java))
            if (ids.isEmpty()) return
            val pr = Prefs(ctx); val place = pr.place ?: return
            Tr.lang = pr.lang.ifEmpty { "ur" }
            val nowH = Schedule.hijriNow(pr, place, ZonedDateTime.now(Schedule.zone(place)))
            var ym = nowH.year * 12 + nowH.month - 1 + pr.sp.getInt("wcalOff", 0)
            val y = ym / 12; val m = ym % 12 + 1
            val len = runCatching { HijrahDate.of(y, m, 1).lengthOfMonth() }.getOrDefault(30)
            val first: LocalDate = runCatching { LocalDate.from(HijrahDate.of(y, m, 1)).minusDays(pr.hijriAdjust.toLong()) }.getOrNull() ?: return
            val ws = pr.weekStart
            val lead = (first.dayOfWeek.value - ws + 7) % 7
            val v = RemoteViews(ctx.packageName, R.layout.widget_cal)
            Widget.background(v, pr)
            val ink = Widget.ink(pr); val dim = Widget.dim(pr)
            val loc = Locale(Tr.lang)
            val last = first.plusDays((len - 1).toLong())
            v.setTextViewText(R.id.month, Tr.hijriMonth(m) + " " + Tr.num(y))
            v.setTextViewText(R.id.gmonth, Tr.num(first.month.getDisplayName(TextStyle.FULL, loc) +
                (if (last.month != first.month) " – " + last.month.getDisplayName(TextStyle.FULL, loc) else "") + " " + last.year))
            v.setTextColor(R.id.month, ink); v.setTextColor(R.id.gmonth, dim); v.setTextColor(R.id.prev, ink); v.setTextColor(R.id.next, ink)
            // short day names (the first letters of the full name)
            for (i in 0 until 7) {
                val d = (ws - 1 + i) % 7 + 1
                v.setTextViewText(HEADS[i], Tr.dayShort(d))
            }
            for (r in ROWS) v.removeAllViews(r)
            for (row in 0 until 6) for (col in 0 until 7) {
                val d = row * 7 + col - lead + 1
                val c = RemoteViews(ctx.packageName, R.layout.wcal_cell)
                if (d in 1..len) {
                    val g = first.plusDays((d - 1).toLong())
                    val today = pr.sp.getInt("wcalOff", 0) == 0 && d == nowH.day
                    val sp = special(m, d)
                    c.setTextViewText(R.id.h, Tr.num(d)); c.setTextViewText(R.id.g, Tr.num(g.dayOfMonth))
                    c.setTextColor(R.id.h, if (today) Color.BLACK else ink); c.setTextColor(R.id.g, if (today) Color.parseColor("#99000000") else dim)
                    c.setInt(R.id.cell, "setBackgroundResource", when { today -> R.drawable.wcal_today; sp -> R.drawable.wcal_special; else -> R.drawable.wcal_none })
                }
                v.addView(ROWS[row], c)
            }
            v.setOnClickPendingIntent(R.id.prev, act(ctx, "org.turath.salat.CAL_PREV", 41))
            v.setOnClickPendingIntent(R.id.next, act(ctx, "org.turath.salat.CAL_NEXT", 42))
            v.setOnClickPendingIntent(R.id.title, act(ctx, "org.turath.salat.CAL_TODAY", 43))
            mgr.updateAppWidget(ids, v)
        }

        /** Ramadan, the two Eids, Arafah, Ashura, the white days */
        fun special(m: Int, d: Int) = m == 9 || (m == 10 && d == 1) || (m == 12 && d in 9..10) || (m == 1 && d in 9..10) || d in 13..15
    }
}
