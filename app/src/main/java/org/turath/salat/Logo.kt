package org.turath.salat

import android.content.Context
import android.graphics.Bitmap
import android.graphics.BitmapFactory

/** the app's logo as the large icon of the notifications (the small one in the status bar can only be a one-colour shape) */
object Logo {
    private var bmp: Bitmap? = null
    fun big(ctx: Context): Bitmap? = bmp ?: runCatching {
        val b = BitmapFactory.decodeResource(ctx.resources, R.drawable.logo)
        Bitmap.createScaledBitmap(b, 192, 192, true)
    }.getOrNull().also { bmp = it }
}
