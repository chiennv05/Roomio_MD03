package com.datn_md_03

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    handleNotificationIntent(intent)
  }

  override fun onNewIntent(intent: Intent) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleNotificationIntent(intent)
  }

  private fun handleNotificationIntent(intent: Intent?) {
    intent?.let {
      // Check if app was opened from notification
      val fromNotification = it.getBooleanExtra("fromNotification", false)
      val notificationId = it.getStringExtra("notificationId")
      val flags = it.flags

      // If app was opened from notification
      if (fromNotification || (flags and Intent.FLAG_ACTIVITY_CLEAR_TOP) != 0) {
        // Send event to React Native with notification data
        val reactContext = reactInstanceManager?.currentReactContext
        reactContext?.let { context ->
          val params = com.facebook.react.bridge.Arguments.createMap()
          params.putString("notificationId", notificationId)
          params.putBoolean("fromNotification", true)

          context
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit("notificationTapped", params)
        }
      }
    }
  }

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "DATN_MD_03"

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
      DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
