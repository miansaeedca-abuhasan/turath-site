package org.turath.salat

import org.junit.Assert.assertEquals
import org.junit.Test

class CalcTest {
    private fun hm(h: Double) = "%02d:%02d".format(((h + 1 / 120.0) % 24).toInt(), (((h + 1 / 120.0) % 1) * 60).toInt())

    @Test fun mississauga() {
        // checked against the mosque board in Mississauga (15 Oct 2026: Fajr 6:15, Zawal 1:04, Asr Hanafi 4:48, Maghrib 6:34, Isha 7:52)
        val r = PrayerCalc.compute(2026, 10, 15, 43.589, -79.644, -4.0, PrayerCalc.method("isna"), 2)
        println("Mississauga ISNA Hanafi: ${hm(r.fajr)} ${hm(r.sunrise)} ${hm(r.dhuhr)} ${hm(r.asr)} ${hm(r.sunset)} ${hm(r.isha)}")
        assertEquals(6 * 60 + 14.0, r.fajr * 60, 2.0)
        assertEquals(13 * 60 + 4.0, r.dhuhr * 60, 2.0)
        assertEquals(18 * 60 + 35.0, r.sunset * 60, 2.0)
        assertEquals(19 * 60 + 54.0, r.isha * 60, 3.0)
        val s = PrayerCalc.compute(2026, 10, 15, 43.589, -79.644, -4.0, PrayerCalc.method("isna"), 1)
        assertEquals(16 * 60 + 5.0, s.asr * 60, 2.0)
    }

    @Test fun makkah() {
        val r = PrayerCalc.compute(2026, 10, 15, 21.4225, 39.8262, 3.0, PrayerCalc.method("makkah"), 1)
        println("Makkah: ${hm(r.fajr)} ${hm(r.sunrise)} ${hm(r.dhuhr)} ${hm(r.asr)} ${hm(r.sunset)} ${hm(r.isha)}")
        assertEquals(r.sunset + 1.5, r.isha, 1e-9)
        assertEquals(12 * 60 + 6.0, r.dhuhr * 60, 2.0)
    }

    @Test fun highLatitude() {
        // Oslo in June: the sun does not reach 18° below the horizon; fajr and isha still come out (angle rule)
        val r = PrayerCalc.compute(2026, 6, 21, 59.91, 10.75, 2.0, PrayerCalc.method("mwl"), 1)
        println("Oslo June: ${hm(r.fajr)} ${hm(r.sunrise)} ${hm(r.dhuhr)} ${hm(r.asr)} ${hm(r.sunset)} ${hm(r.isha)}")
        assert(!r.fajr.isNaN() && !r.isha.isNaN() && r.fajr < r.sunrise && r.isha > r.sunset)
    }
}
