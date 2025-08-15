package com.datn_md_03

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class SchedulerPackage : ReactPackage {
    override fun createViewManagers(reactContext: ReactApplicationContext): MutableList<ViewManager<*, *>> = mutableListOf()

    override fun createNativeModules(reactContext: ReactApplicationContext): MutableList<NativeModule> =
        mutableListOf(SchedulerModule(reactContext), NotificationModule(reactContext))
}

