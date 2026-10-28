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

    @Test fun dateColumns() {
        val html = """<table><tr><th>Prayer</th><th>Iqamah Oct 01-10</th><th>Oct 11-20</th><th>Oct 21-31</th></tr>
            <tr><td>Fajar</td><td>6:30 am</td><td>6:45 am</td><td>6:45 am</td></tr>
            <tr><td>Zuhar</td><td>1:35 pm</td><td>1:35 pm</td><td>1:35 pm</td></tr>
            <tr><td>Asar</td><td>5:30 pm</td><td>5:15 pm</td><td>5:00 pm</td></tr>
            <tr><td>Maghrib</td><td>Sunset</td><td>Sunset</td><td>Sunset</td></tr>
            <tr><td>Isha</td><td>8:30 pm</td><td>8:15 pm</td><td>8:00 pm</td></tr></table>
            <p>Jumma: 1st Iqamah at 1:45 pm, 2nd Iqamah at 2:30 pm, 3rd Iqamah at 3:30 pm</p>"""
        val t = MosqueSite.parse(html, java.time.LocalDate.of(2026, 10, 27))
        assertEquals(6 * 60 + 45, t.iq["FAJR"]); assertEquals(17 * 60, t.iq["ASR"]); assertEquals(20 * 60, t.iq["ISHA"])
        assertEquals(true, t.maghribAtSunset)
        assertEquals(listOf(13 * 60 + 45, 14 * 60 + 30, 15 * 60 + 30), t.jumuah)
        assertEquals(17 * 60 + 30, MosqueSite.parse(html, java.time.LocalDate.of(2026, 10, 5)).iq["ASR"])
    }

    @Test fun boxesAndJunk() {
        val html = "<div class='r'><div>Fajr</div><div>6:27 AM</div><div>6:40 AM</div><div>6:50 AM</div></div><div><div>Dhuhr</div><div>1:06 PM</div><div>1:35 PM</div><div>1:45 PM</div></div>" +
            "<div><div>Asr</div><div>4:32 PM</div><div>4:50 PM</div><div>5:00 PM</div></div><div><div>Maghrib</div><div>6:15 PM</div><div>6:16 PM</div><div>6:17 PM</div></div>" +
            "<div><div>Isha</div><div>7:28 PM</div><div>7:50 PM</div><div>8:00 PM</div></div><div><div>Jumu'ah</div><div>1:06 PM</div><div>1:30 PM</div><div>2:00 PM</div></div>" +
            "<p>Jumuah youth program 8:00 pm</p>"
        val t = MosqueSite.parse(html)
        assertEquals(6 * 60 + 50, t.iq["FAJR"]); assertEquals(13 * 60 + 45, t.iq["DHUHR"]); assertEquals(17 * 60, t.iq["ASR"])
        assertEquals(18 * 60 + 17, t.iq["MAGHRIB"]); assertEquals(20 * 60, t.iq["ISHA"])
        assertEquals(listOf(14 * 60), t.jumuah)
    }

    @Test fun daysAndRows() {
        val london = "<table><tr><td>Next: Asr</td><td>Next: Asr IQAMA</td></tr><tr><td>03:59 PM</td><td>04:30 PM</td></tr></table>" +
            "<h3>Oct 27, 2026 (16 Jamada-I, 1448)</h3><table><tr><td>Fajr</td><td>06:36 AM</td><td>06:50 AM</td></tr><tr><td>Zuhr</td><td>01:10 PM</td><td>01:50 PM</td></tr><tr><td>Asr</td><td>03:59 PM</td><td>04:30 PM</td></tr><tr><td>Maghrib</td><td>06:25 PM</td><td>06:32 PM</td></tr><tr><td>Isha</td><td>07:43 PM</td><td>08:00 PM</td></tr></table>" +
            "<h3>Oct 28, 2026 (17 Jamada-I, 1448)</h3><table><tr><td>Fajr</td><td>06:37 AM</td><td>06:55 AM</td></tr><tr><td>Zuhr</td><td>01:10 PM</td><td>01:55 PM</td></tr><tr><td>Asr</td><td>03:57 PM</td><td>04:35 PM</td></tr><tr><td>Maghrib</td><td>06:23 PM</td><td>06:30 PM</td></tr><tr><td>Isha</td><td>07:42 PM</td><td>08:05 PM</td></tr></table>" +
            "<p>First Jumuah: 12:00 PM</p><p>Second Jumuah: 1:15 PM</p>"
        val t = MosqueSite.parse(london, java.time.LocalDate.of(2026, 10, 28))
        assertEquals(6 * 60 + 55, t.iq["FAJR"]); assertEquals(20 * 60 + 5, t.iq["ISHA"]); assertEquals(listOf(12 * 60, 13 * 60 + 15), t.jumuah)
        assertEquals(6 * 60 + 50, MosqueSite.parse(london, java.time.LocalDate.of(2026, 10, 27)).iq["FAJR"])
        val row = "<table><tr><td>27/10/2026</td><td>16</td><td>5</td><td>1448</td><td>7:53</td><td>6:36</td><td>6:50</td><td>12:09</td><td>12:45</td><td>1:46</td><td>2:17</td><td>2:45</td><td>4:05</td><td>4:12</td><td>5:42</td><td>7:30</td></tr></table>"
        val r = MosqueSite.parse(row, java.time.LocalDate.of(2026, 10, 27))
        assertEquals(6 * 60 + 50, r.iq["FAJR"]); assertEquals(12 * 60 + 45, r.iq["DHUHR"]); assertEquals(14 * 60 + 45, r.iq["ASR"]); assertEquals(16 * 60 + 12, r.iq["MAGHRIB"]); assertEquals(19 * 60 + 30, r.iq["ISHA"])
    }

    @Test fun relativeMaghribAndTypo() {
        val t = MosqueSite.parse("<p>Fajr: 6:45 AM</p><p>Zuhr: 1:30 am</p><p>Asr: 4:30 PM</p><p>Maghrib: 3 minutes after sunset</p><p>Isha: 8:00 PM</p><p>Jumu'ah 1: 2:00 PM</p><p>Jumu'ah 2: 3:15 PM</p>")
        assertEquals(13 * 60 + 30, t.iq["DHUHR"]); assertEquals(true, t.maghribAtSunset); assertEquals(3, t.maghribAfter)
        assertEquals(listOf(14 * 60, 15 * 60 + 15), t.jumuah)
    }
}
