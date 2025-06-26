# Deep Linking Guide - Roomio App

## Tính năng đã implement

✅ **Share Modal**: Modal chia sẻ phòng với các tùy chọn copy link và share qua social media
✅ **Deep Linking**: Hỗ trợ mở app từ link external 
✅ **URL Schemes**: 
   - Custom scheme: `roomio://room/{roomId}`
   - Web fallback: `https://roomio.app/room/{roomId}`

## Cách test Deep Linking

### 1. Test trên iOS Simulator

```bash
# Mở app từ link
xcrun simctl openurl booted "roomio://room/60d5ecb74e9b8c001f5e4e4a"

# Hoặc test với web link  
xcrun simctl openurl booted "https://roomio.app/room/60d5ecb74e9b8c001f5e4e4a"
```

### 2. Test trên Android Emulator

```bash
# Mở app từ link
adb shell am start -W -a android.intent.action.VIEW -d "roomio://room/60d5ecb74e9b8c001f5e4e4a"

# Hoặc test với web link
adb shell am start -W -a android.intent.action.VIEW -d "https://roomio.app/room/60d5ecb74e9b8c001f5e4e4a"
```

### 3. Test trên device thật

**iOS:**
- Gửi link qua Messages, Notes, hoặc Safari
- Bấm vào link để mở app

**Android:**
- Gửi link qua SMS, WhatsApp, hoặc Chrome  
- Bấm vào link để mở app

## Cách sử dụng Share Feature

### 1. Mở DetailRoomScreen
- Vào chi tiết bất kỳ phòng nào
- Bấm nút Share (icon chia sẻ) trên header

### 2. Các tùy chọn chia sẻ
- **Copy link**: Copy link đầy đủ vào clipboard
- **Chia sẻ khác**: Mở native share sheet của hệ điều hành
- **Facebook**: Chia sẻ lên Facebook (fallback to generic share)
- **Zalo**: Chia sẻ qua Zalo/WhatsApp (fallback to generic share)

### 3. Format nội dung chia sẻ
```
🏠 [Tên phòng]
💰 [Giá]/tháng  
📍 [Địa chỉ]

Xem chi tiết phòng trọ tại:
📱 Mở trong app: roomio://room/[roomId]
🌐 Xem trên web: https://roomio.app/room/[roomId]

Tải app Roomio để khám phá thêm nhiều phòng trọ chất lượng!
```

## Technical Implementation

### Files được tạo/cập nhật:

1. **`src/components/ShareModal.tsx`**: Modal component chia sẻ
2. **`src/utils/deepLinkUtils.ts`**: Utility functions cho deep linking
3. **`src/navigation/TabScreen.tsx`**: Cấu hình linking trong NavigationContainer
4. **`ios/DATN_MD_03/Info.plist`**: URL Schemes cho iOS
5. **`android/app/src/main/AndroidManifest.xml`**: Intent filters cho Android
6. **`src/screens/DetailRoomScreen/DetailRoomScreen.tsx`**: Tích hợp ShareModal

### Dependencies được thêm:
- `react-native-share`: Chia sẻ qua native share sheet
- `@react-native-clipboard/clipboard`: Copy text vào clipboard

## Troubleshooting

### Link không mở app
1. Kiểm tra app đã được cài đặt và chạy ít nhất 1 lần
2. Đảm bảo URL scheme đúng format
3. Test với roomId thật (24 ký tự hex)

### Share không hoạt động
1. Kiểm tra permissions cho share
2. Test trên device thật thay vì simulator
3. Kiểm tra console logs để debug

### Deep link navigation
- App sẽ tự động navigate đến DetailRoomScreen với roomId từ link
- Nếu roomId không hợp lệ, app sẽ fallback về Home screen

## Test Cases

### Valid Room IDs để test:
```
roomio://room/60d5ecb74e9b8c001f5e4e4a
roomio://room/507f1f77bcf86cd799439011  
roomio://room/507f191e810c19729de860ea
```

### Invalid Cases:
```
roomio://room/invalid-id  (should handle gracefully)
roomio://room/             (should handle gracefully)
https://roomio.app/room/   (should handle gracefully)
``` 