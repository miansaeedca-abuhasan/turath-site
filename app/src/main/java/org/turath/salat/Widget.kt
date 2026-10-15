package org.turath.salat

import android.app.PendingIntent
import android.appwidget.AppWidgetManager
import android.appwidget.AppWidgetProvider
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import android.widget.RemoteViews
import java.time.ZonedDateTime

/** home-screen widget: the city, the current / next prayer with a live count, the six times and the dates */
class Widget : AppWidgetProvider() {
    override fun onUpdate(ctx: Context, mgr: AppWidgetManager, ids: IntArray) = update(ctx)

    companion object {
        private val IDS = intArrayOf(R.id.w0, R.id.w1, R.id.w2, R.id.w3, R.id.w4, R.id.w5)
        private val NAMES = intArrayOf(R.id.n0, R.id.n1, R.id.n2, R.id.n3, R.id.n4, R.id.n5)

        fun update(ctx: Context) {
            val mgr = AppWidgetManager.getInstance(ctx)
            val ids = mgr.getAppWidgetIds(ComponentName(ctx, Widget::class.java))
            if (ids.isEmpty()) return
            val pr = Prefs(ctx); val place = pr.place ?: return
            Tr.lang = pr.lang.ifEmpty { "ur" }
            val now = ZonedDateTime.now(Schedule.zone(place))
            val t = Schedule.day(pr, place, now.toLocalDate())
            val st = Schedule.state(pr, place, now)
            val v = RemoteViews(ctx.packageName, R.layout.widget)
            v.setTextViewText(R.id.city, place.name)
            // within 30 minutes of a prayer's time: count up from it; otherwise: count down to the next
            val upFrom = st.currentAt?.takeIf { st.current != P.SUNRISE && now.isBefore(it.plusMinutes(30)) }
            val base = SystemClock.elapsedRealtime() - System.currentTimeMillis()
            if (upFrom != null) {
                v.setTextViewText(R.id.prayer, Tr.p(st.current!!))
                v.setChronometer(R.id.count, base + upFrom.toInstant().toEpochMilli(), "+ %s", true)
                v.setChronometerCountDown(R.id.count, false)
            } else {
                v.setTextViewText(R.id.prayer, Tr.p(st.next))
                v.setChronometer(R.id.count, base + st.nextAt.toInstant().toEpochMilli(), "− %s", true)
                v.setChronometerCountDown(R.id.count, true)
            }
            listOf(P.FAJR, P.SUNRISE, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA).forEachIndexed { i, p ->
                v.setTextViewText(NAMES[i], Tr.p(p).substringBefore(" ("))
                v.setTextViewText(IDS[i], Alarms.fmt(pr, t[p]))
            }
            val h = Schedule.hijriNow(pr, place, now)
            v.setTextViewText(R.id.date, Tr.hijri(h) + "   " + Tr.num(now.toLocalDate().toString()))
            v.setOnClickPendingIntent(R.id.root, PendingIntent.getActivity(ctx, 5, Intent(ctx, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE))
            mgr.updateAppWidget(ids, v)
        }
    }
}
