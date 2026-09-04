package com.harasees.foodlabel.repositories

import android.content.Context

object CommonFunctions
{
    fun clearCache(context: Context) {
        context.cacheDir?.listFiles()?.forEach { file ->
            file.deleteRecursively()
        }
    }
}