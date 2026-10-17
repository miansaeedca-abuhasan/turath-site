package org.turath.salat

/** the widget background for each step of 5 % transparency (0 = solid colour, 100 = nothing), dark or light */
object WidgetBg {
    private val DARK = intArrayOf(R.drawable.wbg_d0, R.drawable.wbg_d1, R.drawable.wbg_d2, R.drawable.wbg_d3, R.drawable.wbg_d4, R.drawable.wbg_d5, R.drawable.wbg_d6, R.drawable.wbg_d7, R.drawable.wbg_d8, R.drawable.wbg_d9, R.drawable.wbg_d10, R.drawable.wbg_d11, R.drawable.wbg_d12, R.drawable.wbg_d13, R.drawable.wbg_d14, R.drawable.wbg_d15, R.drawable.wbg_d16, R.drawable.wbg_d17, R.drawable.wbg_d18, R.drawable.wbg_d19, R.drawable.wbg_d20)
    private val LIGHT = intArrayOf(R.drawable.wbg_l0, R.drawable.wbg_l1, R.drawable.wbg_l2, R.drawable.wbg_l3, R.drawable.wbg_l4, R.drawable.wbg_l5, R.drawable.wbg_l6, R.drawable.wbg_l7, R.drawable.wbg_l8, R.drawable.wbg_l9, R.drawable.wbg_l10, R.drawable.wbg_l11, R.drawable.wbg_l12, R.drawable.wbg_l13, R.drawable.wbg_l14, R.drawable.wbg_l15, R.drawable.wbg_l16, R.drawable.wbg_l17, R.drawable.wbg_l18, R.drawable.wbg_l19, R.drawable.wbg_l20)
    fun res(light: Boolean, transparency: Int): Int = (if (light) LIGHT else DARK)[(transparency.coerceIn(0, 100) + 2) / 5]
}
