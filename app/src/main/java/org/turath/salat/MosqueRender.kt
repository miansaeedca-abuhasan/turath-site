package org.turath.salat

import android.annotation.SuppressLint
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.suspendCancellableCoroutine
import kotlinx.coroutines.withContext
import kotlin.coroutines.resume

/** Some masjid websites draw their times with a script after the page has loaded (so a plain download shows none). This loads such a page in an
 *  invisible web view, waits for the script to finish, and returns the page as it then looks. */
object MosqueRender {
    @SuppressLint("SetJavaScriptEnabled")
    suspend fun html(ctx: Context, url: String, settleMs: Long = 6000, limitMs: Long = 30000): String? = withContext(Dispatchers.Main) {
        suspendCancellableCoroutine { cont ->
            val h = Handler(Looper.getMainLooper())
            val wv = runCatching { WebView(ctx.applicationContext) }.getOrNull()
            if (wv == null) { cont.resume(null); return@suspendCancellableCoroutine }
            var done = false
            fun finish(r: String?) {
                if (done) return
                done = true
                h.removeCallbacksAndMessages(null)
                runCatching { wv.stopLoading(); wv.destroy() }
                if (cont.isActive) cont.resume(r)
            }
            wv.settings.javaScriptEnabled = true
            wv.settings.domStorageEnabled = true
            wv.settings.cacheMode = WebSettings.LOAD_NO_CACHE
            wv.settings.userAgentString = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"
            wv.webViewClient = object : WebViewClient() {
                override fun onPageFinished(v: WebView, u: String?) {
                    // the script needs a moment after the page is loaded
                    h.postDelayed({
                        v.evaluateJavascript("document.documentElement.outerHTML") { r ->
                            finish(runCatching { org.json.JSONTokener(r).nextValue() as? String }.getOrNull())
                        }
                    }, settleMs)
                }
            }
            h.postDelayed({ finish(null) }, limitMs)
            cont.invokeOnCancellation { h.post { finish(null) } }
            wv.loadUrl(url)
        }
    }
}
