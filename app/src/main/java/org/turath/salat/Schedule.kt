package org.turath.salat

import java.time.*
import java.time.chrono.HijrahDate
import java.time.temporal.ChronoField
import kotlin.math.roundToLong

/** the times of one day at one place (adjustments of the user included) */
class DayTimes(val date: LocalDate, val zone: ZoneId, val t: Map<P, ZonedDateTime>) {
    operator fun get(p: P): ZonedDateTime = t.getValue(p)

    /** the windows in which no prayer is offered: sunrise, zawal (just before dhuhr), sunset (the sun turning yellow) */
    val forbidden: List<Pair<ZonedDateTime, ZonedDateTime>>
        get() = listOf(
            this[P.SUNRISE] to this[P.ISHRAQ],
            this[P.ZAWAL] to this[P.DHUHR],
            this[P.MAGHRIB].minusMinutes(15) to this[P.MAGHRIB],
        )

    fun forbiddenAt(now: ZonedDateTime) = forbidden.firstOrNull { !now.isBefore(it.first) && now.isBefore(it.second) }
}

data class Hijri(val year: Int, val month: Int, val day: Int)

object Schedule {
    fun zone(place: Place): ZoneId = runCatching { ZoneId.of(place.tz) }.getOrDefault(ZoneId.systemDefault())

    /** offset from UTC in hours on that date, with the user's daylight-saving choice */
    fun offsetHours(prefs: Prefs, zone: ZoneId, date: LocalDate): Double {
        val inst = date.atTime(12, 0).atZone(zone).toInstant()
        val rules = zone.rules
        val std = rules.getStandardOffset(inst).totalSeconds / 3600.0
        val dstNow = rules.isDaylightSavings(inst)
        return when (prefs.dst) {
            "on" -> std + 1
            "off" -> std
            else -> std + if (dstNow) rules.getDaylightSavings(inst).seconds / 3600.0 else 0.0
        }
    }

    fun methodKey(prefs: Prefs, place: Place) = prefs.method.ifEmpty { PrayerCalc.defaultMethod(place.country) }

    fun day(prefs: Prefs, place: Place, date: LocalDate, useUserAdjust: Boolean = true): DayTimes {
        val zone = zone(place)
        val tz = offsetHours(prefs, zone, date)
        val m = PrayerCalc.method(methodKey(prefs, place))
        val asr = if (prefs.school == "hanafi") 2 else 1
        val r = PrayerCalc.compute(date.year, date.monthValue, date.dayOfMonth, place.lat, place.lng, tz, m, asr)
        // the clock time of hours h on this date in this zone, with the chosen offset
        val off = ZoneOffset.ofTotalSeconds((tz * 3600).roundToLong().toInt())
        fun at(h: Double): ZonedDateTime {
            val sec = if (h.isNaN()) 0L else (h * 3600).roundToLong()
            return OffsetDateTime.of(date.atStartOfDay(), off).plusSeconds(sec).atZoneSameInstant(zone)
        }
        fun adj(p: P, z: ZonedDateTime) = if (useUserAdjust) z.plusMinutes(prefs.adjust(p).toLong()) else z
        val fajr = adj(P.FAJR, at(r.fajr))
        val sunrise = adj(P.SUNRISE, at(r.sunrise))
        val dhuhr = adj(P.DHUHR, at(r.dhuhr))
        val asrT = adj(P.ASR, at(r.asr))
        val maghrib = adj(P.MAGHRIB, at(r.sunset))          // maghrib is the sunset itself
        val isha = adj(P.ISHA, at(r.isha))
        // the last third of the night (maghrib to next fajr) for tahajjud
        val next = PrayerCalc.compute(date.plusDays(1).year, date.plusDays(1).monthValue, date.plusDays(1).dayOfMonth,
            place.lat, place.lng, offsetHours(prefs, zone, date.plusDays(1)), m, asr)
        val nextFajr = OffsetDateTime.of(date.plusDays(1).atStartOfDay(), ZoneOffset.ofTotalSeconds((offsetHours(prefs, zone, date.plusDays(1)) * 3600).roundToLong().toInt()))
            .plusSeconds((next.fajr * 3600).roundToLong()).atZoneSameInstant(zone).plusMinutes(if (useUserAdjust) prefs.adjust(P.FAJR).toLong() else 0)
        val night = Duration.between(maghrib, nextFajr)
        val tahajjud = adj(P.TAHAJJUD, maghrib.plus(night.multipliedBy(2).dividedBy(3)))
        return DayTimes(date, zone, mapOf(
            P.FAJR to fajr, P.SUNRISE to sunrise,
            P.ISHRAQ to adj(P.ISHRAQ, sunrise.plusMinutes(prefs.ishraqAfter.toLong())),
            P.CHASHT to adj(P.CHASHT, sunrise.plusMinutes(prefs.chashtAfter.toLong())),
            P.ZAWAL to dhuhr.minusMinutes(prefs.zawalBefore.toLong()),
            P.DHUHR to dhuhr, P.ASR to asrT, P.MAGHRIB to maghrib, P.ISHA to isha, P.TAHAJJUD to tahajjud,
        ))
    }

    /** the hijri date of a day's daytime (Umm al-Qura calendar), with the user's correction */
    fun hijriOf(prefs: Prefs, date: LocalDate): Hijri {
        val h = HijrahDate.from(date.plusDays(prefs.hijriAdjust.toLong()))
        return Hijri(h.get(ChronoField.YEAR), h.get(ChronoField.MONTH_OF_YEAR), h.get(ChronoField.DAY_OF_MONTH))
    }

    /** the hijri date now: it changes at maghrib */
    fun hijriNow(prefs: Prefs, place: Place, now: ZonedDateTime): Hijri {
        val d = now.toLocalDate()
        val mg = day(prefs, place, d)[P.MAGHRIB]
        return hijriOf(prefs, if (now.isBefore(mg)) d else d.plusDays(1))
    }

    /** the prayer whose time it is now and the next one */
    data class State(val current: P?, val currentAt: ZonedDateTime?, val next: P, val nextAt: ZonedDateTime)

    fun state(prefs: Prefs, place: Place, now: ZonedDateTime): State {
        val zone = zone(place)
        val local = now.withZoneSameInstant(zone)
        val today = day(prefs, place, local.toLocalDate())
        val yest = day(prefs, place, local.toLocalDate().minusDays(1))
        val tomorrow = day(prefs, place, local.toLocalDate().plusDays(1))
        val seq = listOf(yest[P.ISHA] to P.ISHA) + listOf(P.FAJR, P.SUNRISE, P.DHUHR, P.ASR, P.MAGHRIB, P.ISHA).map { today[it] to it } +
            listOf(tomorrow[P.FAJR] to P.FAJR)
        var cur: Pair<ZonedDateTime, P>? = null
        for (x in seq) if (!local.isBefore(x.first)) cur = x
        val nxt = seq.first { local.isBefore(it.first) }
        return State(cur?.second, cur?.first, nxt.second, nxt.first)
    }
}
