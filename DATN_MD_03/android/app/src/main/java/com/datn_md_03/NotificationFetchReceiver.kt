package com.datn_md_03

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log

class NotificationFetchReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent?) {
        try {
            val service = Intent(context, NotificationFetchService::class.java)
            context.startService(service)
            // Acquire wake lock for HeadlessJsTask
            com.facebook.react.HeadlessJsTaskService.acquireWakeLockNow(context)
        } catch (ex: Throwable) {
            Log.e("NotificationFetchReceiver", "Failed to start service", ex)
        }
    }
}

