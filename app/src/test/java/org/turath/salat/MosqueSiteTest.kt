package org.turath.salat

import org.junit.Assert.assertEquals
import org.junit.Test

class MosqueSiteTest {
    @Test fun table() {
        val html = """<table><tr><th>Salah</th><th>Begins</th><th>Iqamah</th></tr>
            <tr><td>Fajr</td><td>06:28 <small>AM</small></td><td>06:40 AM</td></tr>
            <tr><td>Sunrise</td><td>07:48 AM</td><td></td></tr>
            <tr><td>Dhuhr</td><td>01:02 PM</td><td>01:45 PM</td></tr>
            <tr><td>Asr</td><td>04:33 PM</td><td>05:00 PM</td></tr>
            <tr><td>Maghrib</td><td>06:16 PM</td><td>06:19 PM</td></tr>
            <tr><td>Isha</td><td>07:36 PM</td><td>08:15 PM</td></tr>
            <tr><td>Jumah</td><td>01:02 PM</td><td>02:00 PM</td></tr>
            <tr><td>Jumah 2</td><td>01:02 PM</td><td>03:15 PM</td></tr></table>"""
        val t = MosqueSite.parse(html.replace("<small>", "").replace("</small>", ""))
        assertEquals(6 * 60 + 40, t.iq["FAJR"])
        assertEquals(13 * 60 + 45, t.iq["DHUHR"])
        assertEquals(17 * 60, t.iq["ASR"])
        assertEquals(18 * 60 + 19, t.iq["MAGHRIB"])
        assertEquals(20 * 60 + 15, t.iq["ISHA"])
        assertEquals(listOf(14 * 60, 15 * 60 + 15), t.jumuah)
    }

    @Test fun twentyFourHourLines() {
        val t = MosqueSite.parse("<div>Fajr 05:40 06:00</div><div>Zuhr 12:30 13:15</div><div>Asr 15:30 16:00</div><div>Maghrib 18:00 18:05</div><div>Isha 19:30 20:00</div><div>Jumu'ah 13:15 and 14:00</div>")
        assertEquals(6 * 60, t.iq["FAJR"]); assertEquals(13 * 60 + 15, t.iq["DHUHR"]); assertEquals(20 * 60, t.iq["ISHA"])
        assertEquals(listOf(14 * 60), t.jumuah)
    }

    @Test fun iqamahColumnOnly() {
        val t = MosqueSite.parse("<h2>Iqamah times</h2><p>Fajr 6:15 am</p><p>Dhuhr 1:30 pm</p><p>Asr 5:00</p>")
        assertEquals(6 * 60 + 15, t.iq["FAJR"]); assertEquals(13 * 60 + 30, t.iq["DHUHR"]); assertEquals(17 * 60, t.iq["ASR"])
    }
}
