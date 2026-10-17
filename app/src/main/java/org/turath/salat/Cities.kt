package org.turath.salat

import android.content.Context
import java.util.Locale
import kotlin.math.*

/** cities of the world (GeoNames, towns with 1 000 people or more): assets/cities.tsv */
object Cities {
    class City(val name: String, val ascii: String, val country: String, val lat: Double, val lng: Double, val tz: String, val pop: Int, val arName: String) {
        fun place() = Place(name, country, lat, lng, tz)
    }

    @Volatile private var all: List<City>? = null

    fun load(ctx: Context): List<City> = all ?: synchronized(this) {
        all ?: ctx.assets.open("cities.tsv").bufferedReader(Charsets.UTF_8).useLines { lines ->
            lines.mapNotNull { l ->
                val f = l.split('\t')
                if (f.size < 7) null else City(f[0], f[1], f[2], f[3].toDouble(), f[4].toDouble(), f[5], f[6].toIntOrNull() ?: 0, f.getOrElse(7) { "" })
            }.toList()
        }.also { all = it }
    }

    /** country codes with their names in the app's language, sorted by name */
    fun countries(ctx: Context, lang: String): List<Pair<String, String>> {
        val loc = Locale(lang)
        return load(ctx).map { it.country }.distinct().map { it to Locale("", it).getDisplayCountry(loc).ifEmpty { it } }
            .sortedBy { it.second }
    }

    fun countryName(code: String, lang: String): String = Locale("", code).getDisplayCountry(Locale(lang)).ifEmpty { code }

    fun inCountry(ctx: Context, cc: String, q: String): List<City> {
        val qq = q.trim().lowercase()
        return load(ctx).filter { it.country == cc && (qq.isEmpty() || it.ascii.lowercase().contains(qq) || it.name.lowercase().contains(qq) || it.arName.contains(qq)) }
            .sortedByDescending { it.pop }
    }

    fun search(ctx: Context, q: String): List<City> {
        val qq = q.trim().lowercase()
        if (qq.length < 2) return emptyList()
        return load(ctx).filter { it.ascii.lowercase().startsWith(qq) || it.name.lowercase().startsWith(qq) || it.arName.startsWith(qq) }
            .sortedByDescending { it.pop }.take(60)
    }

    fun nearest(ctx: Context, lat: Double, lng: Double): City? = load(ctx).minByOrNull { dist(lat, lng, it.lat, it.lng) }

    fun dist(a: Double, b: Double, c: Double, d: Double): Double {
        val r = PI / 180
        val x = sin((c - a) * r / 2).pow(2) + cos(a * r) * cos(c * r) * sin((d - b) * r / 2).pow(2)
        return 2 * 6371 * asin(sqrt(x))
    }

    /** the name of a city in the app's language (Arabic-script name for Urdu and Arabic when GeoNames has one) */
    fun display(c: City, lang: String) = if ((lang == "ur" || lang == "ar") && c.arName.isNotEmpty()) c.arName else c.name
}
