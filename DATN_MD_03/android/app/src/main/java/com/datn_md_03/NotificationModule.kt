package com.datn_md_03

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.media.AudioAttributes
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class NotificationModule(private val reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "NotificationModule"

    private fun ensureChannel(channelId: String, channelName: String) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val nm = reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            val existing = nm.getNotificationChannel(channelId)
            if (existing == null) {
                val ch = NotificationChannel(channelId, channelName, NotificationManager.IMPORTANCE_HIGH)
                ch.description = "Roomio status bar notifications"
                ch.enableVibration(true)
                ch.lockscreenVisibility = Notification.VISIBILITY_PUBLIC
                // Explicitly set default notification sound
                val soundUri: Uri = Settings.System.DEFAULT_NOTIFICATION_URI
                val attrs = AudioAttributes.Builder()
                    .setUsage(AudioAttributes.USAGE_NOTIFICATION)
                    .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
                    .build()
                ch.setSound(soundUri, attrs)
                nm.createNotificationChannel(ch)
            }
        }
    }

    @ReactMethod
    fun show(id: String, title: String, message: String) {
        val channelId = "roomio_local_v2"
        val channelName = "Roomio Notifications"
        ensureChannel(channelId, channelName)

        val intent = Intent(reactContext, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("notificationId", id)
            putExtra("fromNotification", true)
        }
        val contentIntent = PendingIntent.getActivity(
            reactContext,
            0,
            intent,
            PendingIntent.FLAG_IMMUTABLE
        )

        val soundUri: Uri = Settings.System.DEFAULT_NOTIFICATION_URI

        val builder = NotificationCompat.Builder(reactContext, channelId)
            .setContentTitle(title)
            .setContentText(message)
            .setStyle(NotificationCompat.BigTextStyle().bigText(message))
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setAutoCancel(true)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setWhen(System.currentTimeMillis())
            .setShowWhen(true)
            .setDefaults(NotificationCompat.DEFAULT_ALL)
            .setSound(soundUri)
            .setContentIntent(contentIntent)

        val noteId = try { id.hashCode() } catch (_: Throwable) { (System.currentTimeMillis() % Int.MAX_VALUE).toInt() }
        try {
            val nm = NotificationManagerCompat.from(reactContext)
            if (!nm.areNotificationsEnabled()) {
                Log.w("NotificationModule", "Notifications are disabled at app level")
            }
            nm.notify(noteId, builder.build())
            Log.d("NotificationModule", "Posted notification id=$noteId title=$title")
        } catch (e: SecurityException) {
            Log.e("NotificationModule", "POST_NOTIFICATIONS not granted", e)
        } catch (t: Throwable) {
            Log.e("NotificationModule", "Failed to post notification", t)
        }
    }

    @ReactMethod
    fun areNotificationsEnabled(promise: Promise) {
        val nm = NotificationManagerCompat.from(reactContext)
        promise.resolve(nm.areNotificationsEnabled())
    }

    @ReactMethod
    fun openAppNotificationSettings() {
        try {
            val intent = Intent().apply {
                action = Settings.ACTION_APP_NOTIFICATION_SETTINGS
                putExtra(Settings.EXTRA_APP_PACKAGE, reactContext.packageName)
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            reactContext.startActivity(intent)
        } catch (t: Throwable) {
            Log.e("NotificationModule", "Failed to open notification settings", t)
        }
    }
}

