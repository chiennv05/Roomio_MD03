package com.datn_md_03

import android.content.Intent
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig

class NotificationFetchService : HeadlessJsTaskService() {
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        val data = Arguments.createMap()
        return HeadlessJsTaskConfig(
            "NotificationFetchTask",
            data,
            30_000, // timeout ms
            true // allowedInForeground
        )
    }
}

