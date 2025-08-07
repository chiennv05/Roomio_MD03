# 🔔 **Push Notification Setup Guide**

## 📦 **Bước 1: Cài đặt dependencies**

```bash
# Push Notification
npm install @react-native-firebase/app @react-native-firebase/messaging

# Local Notification  
npm install @react-native-async-storage/async-storage
npm install react-native-push-notification
npm install @react-native-community/push-notification-ios

# Sound & Vibration
npm install react-native-sound
npm install react-native-vibration

# Background tasks
npm install @react-native-async-storage/async-storage
```

## 🔧 **Bước 2: Cấu hình Android**

### **android/app/src/main/AndroidManifest.xml:**
```xml
<!-- Thêm permissions -->
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.WAKE_LOCK" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-permission android:name="android.permission.RECEIVE_BOOT_COMPLETED"/>
<uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />

<!-- Trong <application> tag -->
<service
    android:name="io.invertase.firebase.messaging.RNFirebaseMessagingService"
    android:exported="false">
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>

<receiver android:name="com.dieam.reactnativepushnotification.modules.RNPushNotificationActions" />
<receiver android:name="com.dieam.reactnativepushnotification.modules.RNPushNotificationPublisher" />
<receiver android:name="com.dieam.reactnativepushnotification.modules.RNPushNotificationBootEventReceiver">
    <intent-filter>
        <action android:name="android.intent.action.BOOT_COMPLETED" />
        <action android:name="android.intent.action.QUICKBOOT_POWERON" />
        <action android:name="com.htc.intent.action.QUICKBOOT_POWERON"/>
        <category android:name="android.intent.category.DEFAULT" />
    </intent-filter>
</receiver>

<service
    android:name="com.dieam.reactnativepushnotification.modules.RNPushNotificationListenerService"
    android:exported="false" >
    <intent-filter>
        <action android:name="com.google.firebase.MESSAGING_EVENT" />
    </intent-filter>
</service>
```

## 🍎 **Bước 3: Cấu hình iOS**

### **ios/Podfile:**
```ruby
pod 'Firebase/Messaging'
```

### **ios/[ProjectName]/AppDelegate.mm:**
```objc
#import <Firebase.h>
#import <UserNotifications/UserNotifications.h>

// Trong didFinishLaunchingWithOptions
[FIRApp configure];
[UNUserNotificationCenter currentNotificationCenter].delegate = self;
```

## 🔥 **Bước 4: Firebase Setup**

1. **Tạo project Firebase**
2. **Download google-services.json** → `android/app/`
3. **Download GoogleService-Info.plist** → `ios/[ProjectName]/`
4. **Enable Firebase Cloud Messaging**

## 🎵 **Bước 5: Thêm sound files**

### **android/app/src/main/res/raw/**
- `notification_sound.mp3`
- `notification_bell.wav`

### **ios/[ProjectName]/**
- `notification_sound.mp3`
- `notification_bell.wav`

## ⚡ **Bước 6: Rebuild project**

```bash
# Android
cd android && ./gradlew clean && cd ..
npx react-native run-android

# iOS  
cd ios && pod install && cd ..
npx react-native run-ios
```

---

## 🎯 **Features sẽ implement:**

✅ **Push Notification** - Thông báo từ server
✅ **Local Notification** - Thông báo local
✅ **Sound & Vibration** - Âm thanh và rung
✅ **Badge Count** - Số thông báo chưa đọc
✅ **Background Handling** - Xử lý khi app ở background
✅ **Notification Actions** - Hành động từ notification
✅ **Custom Sound** - Âm thanh tùy chỉnh

## 📱 **Test Scenarios:**

1. **App Foreground** - Hiển thị in-app notification
2. **App Background** - Push notification với sound
3. **App Killed** - Wake up app từ notification
4. **Different Types** - Notification theo loại khác nhau
5. **Sound Test** - Test âm thanh notification

---

**🚀 Sau khi setup xong, chạy lệnh để test!**
