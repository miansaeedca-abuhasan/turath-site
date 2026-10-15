package org.turath.salat

import kotlin.math.*

/**
 * Prayer times from the position of the sun (the method of praytimes.org): sun declination and equation of time for the
 * day, then the time the sun reaches each angle below the horizon. Results are hours of local clock time (offset hours
 * from UTC given), e.g. 13.07 = 1:04 pm.
 */
object PrayerCalc {
    /** fajr / isha angles; isha may instead be minutes after maghrib (Umm al-Qura, Gulf) */
    data class Method(val key: String, val fajr: Double, val isha: Double, val ishaMinutes: Int = 0)

    val METHODS = listOf(
        Method("mwl", 18.0, 17.0),          // Muslim World League
        Method("isna", 15.0, 15.0),         // North America
        Method("karachi", 18.0, 18.0),      // University of Islamic Sciences, Karachi
        Method("makkah", 18.5, 0.0, 90),    // Umm al-Qura, Makkah
        Method("egypt", 19.5, 17.5),        // Egyptian General Authority of Survey
        Method("gulf", 19.5, 0.0, 90),      // Gulf region
        Method("kuwait", 18.0, 17.5),
        Method("qatar", 18.0, 0.0, 90),
        Method("singapore", 20.0, 18.0),    // Singapore, Malaysia, Indonesia
        Method("turkey", 18.0, 17.0),       // Diyanet
        Method("france", 12.0, 12.0),       // UOIF
        Method("russia", 16.0, 15.0),
    )

    fun method(key: String) = METHODS.firstOrNull { it.key == key } ?: METHODS[0]

    /** the method used in a country unless the user chooses another */
    fun defaultMethod(country: String): String = when (country.uppercase()) {
        "SA", "YE" -> "makkah"
        "AE", "OM", "BH" -> "gulf"
        "KW" -> "kuwait"
        "QA" -> "qatar"
        "EG", "SD", "LY", "SY", "LB", "JO", "PS", "IQ" -> "egypt"
        "PK", "IN", "BD", "AF", "NP", "LK" -> "karachi"
        "US", "CA", "MX" -> "isna"
        "MY", "SG", "ID", "BN" -> "singapore"
        "TR" -> "turkey"
        "FR" -> "france"
        "RU" -> "russia"
        else -> "mwl"
    }

    class Raw(val fajr: Double, val sunrise: Double, val dhuhr: Double, val asr: Double, val sunset: Double, val isha: Double)

    private fun rad(d: Double) = d * PI / 180
    private fun deg(r: Double) = r * 180 / PI

    private fun julian(y: Int, m: Int, d: Int): Double {
        var yy = y; var mm = m
        if (mm <= 2) { yy -= 1; mm += 12 }
        val a = floor(yy / 100.0); val b = 2 - a + floor(a / 4)
        return floor(365.25 * (yy + 4716)) + floor(30.6001 * (mm + 1)) + d + b - 1524.5
    }

    /** [declination, equation of time (hours)] */
    private fun sun(jd: Double): DoubleArray {
        val d = jd - 2451545.0
        val g = (357.529 + 0.98560028 * d).mod(360.0)
        val q = (280.459 + 0.98564736 * d).mod(360.0)
        val l = (q + 1.915 * sin(rad(g)) + 0.020 * sin(rad(2 * g))).mod(360.0)
        val e = 23.439 - 0.00000036 * d
        val ra = deg(atan2(cos(rad(e)) * sin(rad(l)), cos(rad(l)))) / 15
        val decl = deg(asin(sin(rad(e)) * sin(rad(l))))
        var eqt = q / 15 - ra.mod(24.0)
        eqt = (eqt + 12).mod(24.0) - 12
        return doubleArrayOf(decl, eqt)
    }

    /**
     * @param asrFactor 1 = Shafi'i / Maliki / Hanbali / Salafi (shadow equal to the object), 2 = Hanafi (twice)
     * @param tz offset from UTC in hours on that day (daylight saving included)
     */
    fun compute(y: Int, m: Int, d: Int, lat: Double, lng: Double, tz: Double, method: Method, asrFactor: Int): Raw {
        val jd = julian(y, m, d) - lng / 360
        fun noon(t: Double) = (12 - sun(jd + t / 24)[1]).mod(24.0)
        fun angleTime(angle: Double, t: Double, before: Boolean): Double {
            val decl = sun(jd + t / 24)[0]
            val x = (-sin(rad(angle)) - sin(rad(decl)) * sin(rad(lat))) / (cos(rad(decl)) * cos(rad(lat)))
            if (x > 1 || x < -1) return Double.NaN       // the sun does not reach that angle (high latitudes)
            val h = deg(acos(x)) / 15
            return noon(t) + if (before) -h else h
        }
        fun asrTime(t: Double): Double {
            val decl = sun(jd + t / 24)[0]
            val a = -deg(atan(1 / (asrFactor + tan(rad(abs(lat - decl))))))
            return angleTime(a, t, false)
        }
        var fa = 5.0; var sr = 6.0; var dh = 12.0; var asr = 13.0; var ss = 18.0; var ish = 18.0
        repeat(2) {
            fa = angleTime(method.fajr, if (fa.isNaN()) 5.0 else fa, true)
            sr = angleTime(0.833, if (sr.isNaN()) 6.0 else sr, true)
            dh = noon(dh)
            asr = asrTime(if (asr.isNaN()) 13.0 else asr)
            ss = angleTime(0.833, if (ss.isNaN()) 18.0 else ss, false)
            ish = if (method.ishaMinutes > 0) Double.NaN else angleTime(method.isha, if (ish.isNaN()) 18.0 else ish, false)
        }
        val off = tz - lng / 15
        fa += off; sr += off; dh += off; asr += off; ss += off
        ish = if (method.ishaMinutes > 0) ss + method.ishaMinutes / 60.0 else ish + off
        // high latitudes: fajr and isha no further from sunrise / sunset than the part of the night the angle gives
        // (angle-based rule: angle/60 of the night)
        val night = 24 - (ss - sr)
        if (!sr.isNaN() && !ss.isNaN()) {
            val fp = method.fajr / 60 * night
            if (fa.isNaN() || sr - fa > fp) fa = sr - fp
            if (method.ishaMinutes == 0) {
                val ip = method.isha / 60 * night
                if (ish.isNaN() || ish - ss > ip) ish = ss + ip
            }
        }
        return Raw(fa, sr, dh, asr, ss, ish)
    }
}
