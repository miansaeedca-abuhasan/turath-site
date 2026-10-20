package org.turath.salat

/** the colours offered for the borders, texts and the app's main colour */
object Pal {
    val COLORS = intArrayOf(0xFF26C6DA.toInt(), 0xFF3DBE6F.toInt(), 0xFF00BFA5.toInt(), 0xFF4DA3FF.toInt(), 0xFFFF6F91.toInt(), 0xFFFF8A3D.toInt(), 0xFFB388FF.toInt(), 0xFFFFFFFF.toInt())
    /** a border (no fill) in each colour, for the current prayer of the widget */
    val BORDERS = intArrayOf(R.drawable.wb0, R.drawable.wb1, R.drawable.wb2, R.drawable.wb3, R.drawable.wb4, R.drawable.wb5, R.drawable.wb6, R.drawable.wb7)
    const val BLACK = 0xFF1B1B1B.toInt()
    /** a text colour of the widget: 0–7 from COLORS, 8 black */
    fun ink(i: Int) = if (i >= COLORS.size) BLACK else COLORS[i]
}
