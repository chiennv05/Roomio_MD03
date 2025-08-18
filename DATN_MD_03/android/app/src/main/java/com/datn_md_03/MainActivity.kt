package com.datn_md_03

import android.content.Intent
import android.os.Bundle
import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView

class MainActivity : ReactActivity() {

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    handleNotificationIntent(intent)
  }

  override fun onNewIntent(intent: Intent?) {
    super.onNewIntent(intent)
    setIntent(intent)
    handleNotificationIntent(intent)
  }

  private fun handleNotificationIntent(intent: Intent?) {
    if (intent != null) {
      // Check if app was opened from notification
      val fromNotification = intent.getBooleanExtra("fromNotification", false)
      val notificationId = intent.getStringExtra("notificationId")
      val flags = intent.flags

      // If app was opened from notification
      if (fromNotification || (flags and Intent.FLAG_ACTIVITY_CLEAR_TOP) != 0) {
        // Send event to React Native with notification data
        val reactContext = reactInstanceManager?.currentReactContext
        if (reactContext != null) {
          val params = com.facebook.react.bridge.Arguments.createMap()
          params.putString("notificationId", notificationId)
          params.putBoolean("fromNotification", true)

          reactContext
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
