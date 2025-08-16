# Migration: NotificationPermissionModal → NotificationPermissionScreen

## Tóm tắt thay đổi

Đã chuyển đổi `NotificationPermissionModal` từ một modal component thành một trang độc lập `NotificationPermissionScreen` trong thư mục `src/screens/Notification/`.

## Các file đã thay đổi

### 1. Tạo mới
- ✅ `src/screens/Notification/NotificationPermissionScreen.tsx` - Trang mới thay thế modal

### 2. Xóa
- ❌ `src/components/NotificationPermissionModal.tsx` - Modal cũ đã bị xóa

### 3. Cập nhật
- 📝 `App.tsx` - Xóa logic modal và imports không cần thiết
- 📝 `src/navigation/TabScreen.tsx` - Thêm route mới cho NotificationPermissionScreen
- 📝 `src/types/route.d.ts` - Thêm type cho route mới
- 📝 `src/screens/Splash/SplashScreen.tsx` - Thêm logic điều hướng đến notification permission

## Chi tiết thay đổi

### NotificationPermissionScreen.tsx
```typescript
// Tính năng chính:
- Sử dụng SafeAreaView thay vì Modal
- Tự xử lý logic enable/disable notification
- Điều hướng đến UITab sau khi hoàn thành
- Sử dụng navigation.replace() thay vì goBack()
```

### App.tsx
```typescript
// Đã xóa:
- import NotificationPermissionModal
- useState cho showNotifPrompt
- Logic hiển thị modal
- JSX của NotificationPermissionModal

// Giữ lại:
- Logic polling notification (không thay đổi)
```

### TabScreen.tsx
```typescript
// Đã thêm:
- Import NotificationPermissionScreen
- Stack.Screen cho "NotificationPermission" route
- TransitionPresets.SlideFromRightIOS animation
```

### SplashScreen.tsx
```typescript
// Đã thêm:
- Hàm checkNotificationPermission()
- Logic kiểm tra notif:asked trong AsyncStorage
- Điều hướng đến NotificationPermission nếu chưa hỏi
- Điều hướng đến UITab nếu đã hỏi rồi
```

### route.d.ts
```typescript
// Đã thêm:
NotificationPermission: undefined;
```

## Luồng hoạt động mới

1. **SplashScreen** khởi động
2. Kiểm tra `notif:asked` trong AsyncStorage
3. Nếu chưa hỏi → điều hướng đến `NotificationPermissionScreen`
4. Nếu đã hỏi → điều hướng đến `UITab`
5. Trong `NotificationPermissionScreen`:
   - User chọn "Cho phép" → lưu `notif:enabled=1` → đến UITab
   - User chọn "Bỏ qua" → lưu `notif:enabled=0` → đến UITab

## Lợi ích

- ✅ UI/UX tốt hơn với full screen thay vì modal
- ✅ Dễ customize và mở rộng
- ✅ Tách biệt logic rõ ràng
- ✅ Có thể điều hướng từ nhiều nơi khác nhau
- ✅ Không cần truyền props phức tạp

## Test checklist

- [ ] App khởi động lần đầu → hiển thị NotificationPermissionScreen
- [ ] Chọn "Cho phép" → lưu setting và đến UITab
- [ ] Chọn "Bỏ qua" → lưu setting và đến UITab  
- [ ] Khởi động lại app → không hiển thị permission screen nữa
- [ ] Notification polling hoạt động bình thường
