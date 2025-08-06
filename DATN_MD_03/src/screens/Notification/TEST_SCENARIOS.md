# Test Scenarios - Notification Modal

## Cách test chức năng mới

### 🧪 **Test Case 1: Thông báo hợp đồng**

**Dữ liệu từ API:**

```json
{
  "_id": "687a90d055e1bcbd93c59af6",
  "type": "hopDong",
  "content": "Hợp đồng phòng P102 đã được admin phê duyệt và có hiệu lực.",
  "status": "unread"
}
```

**Kết quả mong đợi:**

1. ✅ Nhấn vào thông báo → Modal hiển thị
2. ✅ Title: "Thông báo hợp đồng"
3. ✅ Content: "Hợp đồng phòng P102 đã được admin phê duyệt và có hiệu lực."
4. ✅ Có 2 nút: "Xem hợp đồng" và "Đóng"
5. ✅ Extract roomId: "P102"
6. ✅ Nhấn "Xem hợp đồng" → Console log: "Navigate to contract/room detail with roomId: P102"

---

### 🧪 **Test Case 2: Thông báo hệ thống**

**Dữ liệu từ API:**

```json
{
  "_id": "687a906d55e1bcbd93c5964c",
  "type": "heThong",
  "content": "Bài đăng phòng P205 đã được duyệt bởi admin",
  "status": "unread"
}
```

**Kết quả mong đợi:**

1. ✅ Nhấn vào thông báo → Modal hiển thị
2. ✅ Title: "Thông báo hệ thống"
3. ✅ Content: "Bài đăng phòng P205 đã được duyệt bởi admin"
4. ✅ Chỉ có 1 nút: "Đóng"
5. ✅ Nhấn "Đóng" → Modal đóng

---

### 🧪 **Test Case 3: Thông báo hỗ trợ**

**Dữ liệu từ API:**

```json
{
  "_id": "6873b859484291c418214018",
  "type": "hoTro",
  "content": "Phản hồi từ Admin cho yêu cầu \"Bun dau\": Ok",
  "status": "read"
}
```

**Kết quả mong đợi:**

1. ✅ Nhấn vào thông báo → Modal hiển thị
2. ✅ Title: "Thông báo hỗ trợ"
3. ✅ Content: "Phản hồi từ Admin cho yêu cầu \"Bun dau\": Ok"
4. ✅ Chỉ có 1 nút: "Đóng"
5. ✅ Nhấn "Đóng" → Modal đóng

---

### 🧪 **Test Case 4: Thông báo thanh toán (Tương lai)**

**Dữ liệu giả định:**

```json
{
  "_id": "future_bill_notification",
  "type": "thanhToan",
  "content": "Hóa đơn HD001 đã được tạo cho phòng P102. Vui lòng thanh toán trước ngày 01/08/2025.",
  "status": "unread"
}
```

**Kết quả mong đợi:**

1. ✅ Nhấn vào thông báo → Modal hiển thị
2. ✅ Title: "Thông báo thanh toán"
3. ✅ Content: "Hóa đơn HD001 đã được tạo..."
4. ✅ Có 2 nút: "Xem chi tiết hóa đơn" và "Đóng"
5. ✅ Extract invoiceId: "HD001"
6. ✅ Nhấn "Xem chi tiết hóa đơn" → Navigate to BillDetails with invoiceId

---

## 🔍 **Regex Patterns được test:**

### Cho roomId (hợp đồng):

- ✅ `"phòng P102"` → Extract: `P102`
- ✅ `"phòng P205"` → Extract: `P205`
- ✅ `"room A101"` → Extract: `A101`

### Cho invoiceId (thanh toán):

- ✅ `"Hóa đơn HD001"` → Extract: `HD001`
- ✅ `"Invoice INV123"` → Extract: `INV123`
- ✅ `"ID: 64f7b8c9e1234567890abcde"` → Extract: `64f7b8c9e1234567890abcde`
- ✅ `"Mã hóa đơn: HD001"` → Extract: `HD001`

---

## 🎯 **Luồng hoạt động:**

### Khi nhấn vào thông báo:

1. **Mark as read**: Tự động đánh dấu đã đọc nếu status = "unread"
2. **Show modal**: Modal slide up từ dưới lên
3. **Display content**: Hiển thị title, content, date/time
4. **Smart buttons**: Hiển thị nút action dựa trên type
5. **Extract data**: Tự động extract ID liên quan từ content
6. **Navigation**: Navigate đến màn hình phù hợp khi nhấn action button

---

## 🚀 **Cách test trong app:**

### Bước 1: Mở màn hình Notification

```
Vào app → Tab Notification
```

### Bước 2: Test thông báo hợp đồng

```
1. Nhấn vào thông báo "Hợp đồng phòng P102 đã được admin phê duyệt"
   → Modal hiển thị với nút "Xem phòng P102"
   → Nhấn nút → Navigate đến DetailRoomLandlord

2. Nhấn vào thông báo "Hoàng Văn Nhất muốn thuê phòng P204"
   → Modal hiển thị với nút "Xử lý yêu cầu thuê"
   → Nhấn nút → Navigate đến AddContract
```

### Bước 3: Test thông báo hệ thống

```
1. Nhấn vào thông báo "Bài đăng phòng P205 đã được duyệt"
   → Modal hiển thị với nút "Xem phòng của tôi"
   → Nhấn nút → Navigate đến LandlordRoom

2. Nhấn vào thông báo hệ thống khác
   → Modal hiển thị với nút "OK"
   → Nhấn nút → Modal đóng
```

### Bước 4: Test thông báo hỗ trợ

```
1. Nhấn vào thông báo "Phản hồi từ Admin..."
   → Modal hiển thị với nút "Xem hỗ trợ"
   → Nhấn nút → Navigate đến SupportScreen

2. Nhấn vào thông báo "Yêu cầu hỗ trợ đã được gửi..."
   → Modal hiển thị với nút "Xem hỗ trợ"
   → Nhấn nút → Navigate đến SupportScreen
```

### Bước 5: Test thông báo thanh toán (tương lai)

```
1. Nhấn vào thông báo "Hóa đơn HD001 đã được tạo"
   → Modal hiển thị với nút "Xem chi tiết hóa đơn"
   → Nhấn nút → Navigate đến BillDetails với invoiceId

2. Nhấn vào thông báo thanh toán không có ID
   → Modal hiển thị với nút "Xem danh sách hóa đơn"
   → Nhấn nút → Navigate đến Bill
```

---

## 🐛 **Troubleshooting:**

### Nếu modal không hiển thị:

1. Kiểm tra `modalVisible` state
2. Kiểm tra `selectedNotification` có data không
3. Kiểm tra import NotificationDetailModal

### Nếu nút action không hoạt động:

1. Kiểm tra regex patterns
2. Kiểm tra navigation routes
3. Kiểm tra console logs

### Nếu không extract được ID:

1. Kiểm tra content format
2. Thêm pattern mới vào regex
3. Test với content khác

---

## 📝 **Notes:**

- Hiện tại API chưa có thông báo `type: "thanhToan"`
- Navigation routes có thể cần cập nhật theo cấu trúc app
- Có thể thêm loading state cho navigation
- Có thể thêm animation cho modal
