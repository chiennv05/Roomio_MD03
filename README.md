1. Màn Hình & Video chi tiết
  - Ứng Dụng Quản Lý Phòng Trọ Gồm có 4 role ( Khách, Người Thuê, Chủ Trọ, Quản Trị Viên )
    các tính năng như: Xác thực tài khoản, Quản lý phòng trọ, Quản lý danh sách yêu thích, 
    Quản lý thông báo, Xem danh sách phòng trọ, Gửi yêu cầu thuê phòng, Xem người thuê phòng, 
    Quản lý hợp đồng thuê, Xem hợp đồng thuê,Quản lý hoá đơn, Xem thống kê, Gửi yêu cầu hỗ trợ, 
    Quản lý yêu cầu hỗ trợ, Quản lý User (Người dùng),  Quản lý hồ sơ cá nhân, Quản lý gói đăng ký, Nâng cấp gói đăng ký.
  -Link Video Demo: https://drive.google.com/file/d/1FlTEXNWWzqycDmQV5wUeujk9FuuGXZoU/view?usp=drive_link
  -Link Trải Nghiệm App (Đang gặp 1 chút vấn đề về map ở link trải nghiệm này): https://appetize.io/app/b_5am23n3tkbgogcvxjaq5dhpy24?device=pixel7&osVersion=13.0&toolbar=true
2. Các tính năng chính
  - Xác thực tài khoản: Đăng ký, đăng nhập, quên mật khẩu.
  - Quản lý phòng trọ: Chủ trọ thêm/sửa/xóa phòng trọ. Admin có thể duyệt hoặc từ chối bài đăng mà chủ trọ đăng lên.
  - Quản lý danh sách yêu thích: Người thuê và chủ trọ có thể lưu lại các phòng yêu thích để tham khảo sau.
  - Quản lý thông báo: Thông báo về hoá đơn, yêu cầu thuê phòng, hợp đồng hoặc hệ thống từ admin.
  - Xem danh sách phòng trọ: Chủ trọ, người thuê và khách vãng lai được xem danh sách các phòng trống đang có.
  - Gửi yêu cầu thuê phòng: Người thuê gửi yêu cầu thuê phòng đến chủ trọ.
  - Xem người thuê phòng: Chủ Trọ xem thông tin người đang thuê phòng của mình, xem người ở cùng.
  - Quản lý hợp đồng thuê: Chủ trọ xem danh sách hợp đồng, tạo hợp đồng thuê , sửa thông tin hợp đồng thuê , quản lý người ở cùng , upload ảnh hợp đồng, xóa ảnh hợp đồng , gia hạn hợp đồng , tạo và tải hợp đồng PDF , chấm dứt hợp đồng , xóa hợp đồng .  Người thuê xem thông tin hợp đồng , xem hợp đồng PDF.
  - Xem hợp đồng thuê: Người thuê có thể xem lại nội dung hợp đồng đã ký.
  - Quản lý hoá đơn: Chủ Trọ tạo/sửa hóa đơn thanh toán tiền phòng, điện nước và gửi cho admin duyệt hoặc từ chối hoá đơn đó. Dịch vụ thêm tuỳ chỉnh còn có bảo dưỡng, sửa chữa,...
  - Xem thống kê: Chủ Trọ xem doanh thu theo tháng, tình trạng hợp đồng, theo từng phòng.
  - Gửi yêu cầu hỗ trợ: Người thuê, chủ trọ gửi phản ánh, yêu cầu sửa chữa, hay những phòng không tốt.
  - Quản lý yêu cầu hỗ trợ: Admin tiếp nhận phản hồi từ các yêu cầu hỗ trợ và xử lý.
  - Quản lý User (Người dùng):  Admin có thể xem thông tin người dùng, cập nhật thông tin và khóa người dùng đó.
  - Quản lý hồ sơ cá nhân: Chủ trọ , người thuê và admin có thể cập nhật thông tin cá nhân. Cập nhật thông tin bằng Căn cước công dân. Sau khi cập nhật các thông tin quan trọng trong Căn cước công dân không được thay đổi. Chỉ được thay đổi Số điện thoại và Email
  - Quản lý gói đăng ký: Admin sẽ kiểm tra hoá đơn chuyển khoản theo cú phép username đó nếu đúng cú pháp và đã chuyển sẽ nâng cấp gói cho Chủ Trọ.
  - Nâng cấp gói đăng ký: Chủ trọ sẽ được miễn phí một số lượng bài đăng nhất định, nếu có nhu cầu đăng thêm thì phải đăng ký các gói nâng cấp.
3. Kiến trúc & Điểm mạnh
  - Frontend
    - Kiến trúc: Redux Toolkit + Component-based, tách biệt rõ ràng giữa UI và logic.
    - TypeScript: Đảm bảo type safety, hạn chế bug runtime.
    - Custom Hooks: Tách logic ra khỏi component (`useCustomAlert`, `useRooms`, `usePaginatedData`).
    - Responsive: Sử dụng `responsive.ts` để scale UI trên nhiều thiết bị.
    - State Management: Redux slices theo từng domain (`authSlice`, `billSlice`, `contractSlice`).
    - Screens: Mỗi màn hình độc lập, dễ maintain.
    - Component tái sử dụng: `CustomAlertModal`, `LoadingAnimation`, `UIHeader`.
  - Backend
    - Công nghệ: Node.js + Express + MongoDB.
    - Hiện tại: Routes xử lý logic trực tiếp.
    - Điểm mạnh:
      - Cấu trúc đơn giản, dễ hiểu với các route rõ ràng.
      - JWT Authentication cho xác thực và phân quyền.
4. Hướng phát triển
  - Cập nhật thêm giao diện và 1 số chức năng như hóa đơn thu chi và hợp đồng để được hoàn thiện hơn về mặt quy trình cho phù hợp và dễ sử dụng hơn đúng với quy trình
  - Tích hợp thêm banner & quảng cáo để cải thiện doanh thu cho dự án
  - Cập nhật lại phần gói đăng ký để khi người dùng đăng ký gói như gói pro sẽ có một số phòng sẽ được lên đầu trang để những chủ trọ khác khi đăng ký không bị mất quyền lợi ở những gói mà họ đã đăng ký
  
