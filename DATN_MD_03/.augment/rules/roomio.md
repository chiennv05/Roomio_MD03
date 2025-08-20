---
type: "manual"
---

Augment Rules – DATN_MD_03 (v1.0)
0) Mục tiêu
Tốc độ cao, UI/UX đồng nhất, dễ bảo trì. Ưu tiên tái sử dụng tuyệt đối.
1) Research trước khi làm
BẮT BUỘC đọc code liên quan bằng codebase-retrieval hoặc view trước mọi chỉnh sửa.
Hiểu cấu trúc, pattern, convention hiện có; tìm sẵn component/utility/type để tái sử dụng.
2) Tái sử dụng – Không tạo mới nếu chưa cần
Luôn tìm component tương tự trong src/components/ và src/screens/*/components/.
Nếu thiếu, cân nhắc mở rộng props không phá backward-compat. Nếu vẫn không phù hợp → hỏi user trước khi tạo mới.
3) Assets, Icon, Text (siết chặt)
KHÔNG thêm ảnh/asset mới (png/svg/webp/remote).
KHÔNG cài hoặc nhập thêm icon pack mới.
CHỈ dùng icon/asset đã tồn tại trong dự án:
src/assets/icons/, src/utils/amenityIcons.ts
Các icon từ react-native-vector-icons đã đang dùng trong codebase (không thêm icon set mới).
KHÔNG tự ý thêm text/copy mới vào UI; chỉ dùng chuỗi đã có. Nếu cần nội dung mới → soạn đề xuất và hỏi user duyệt.
4) Design System & Responsive
spacing: responsiveSpacing(...)
font: responsiveFont(...), Fonts.*
màu: Colors.* (không hardcode hex)
Không inline-style tràn lan; tái sử dụng StyleSheet/utility.
5) Khu vực không được sửa khi chưa xin phép
Không tự ý sửa: src/components/, src/types/, src/theme/color.ts, src/store/, src/utils/.
Nếu cần sửa: nêu file + lý do + tác động → xin phép user.
6) File structure & Import patterns
Screen: src/screens/[ScreenName]/[ScreenName].tsx và folder components/ kề bên.
Theo đúng import pattern sẵn có cho Colors, responsive utils, RootState, useSelector, navigation types.
7) Chất lượng code
TypeScript: dùng types trong src/types/, không tạo type trùng; giữ naming convention.
Redux: dùng slices có sẵn; theo pattern useSelector/useDispatch hiện hữu.
Navigation: theo RootStackParamList đã có.
ESLint/Prettier: tuân thủ; không disable rule bừa bãi.
8) Hiệu năng
useMemo cho tính toán nặng; useCallback cho hàm pass xuống; React.memo cho component ít đổi props.
Lazy load phần nặng; tránh re-render không cần. Theo các pattern tối ưu đã có.
9) Quy trình thực hiện
Research (bắt buộc).
Reuse check.
Implementation: chỉ tái sử dụng/mở rộng nhỏ; tránh tạo mới.
Ask before create/modify khu vực cấm, asset/icon/text mới.
Validation: lint, type-check, test.
10) Kiểm tra trước khi PR
Đã đọc code liên quan?
Đã tái sử dụng component/utility?
Dùng responsiveSpacing/responsiveFont, Colors/Fonts?
Không thêm asset/icon pack mới? Icon dùng thuộc nhóm sẵn có?
Không thêm text mới? Nếu có, đã xin phép?
Không chạm khu vực cấm? Nếu có, đã xin phép?
Lint/Type-check/Test đều pass.
11) Khi cần nới quy tắc
Trình bày: mục tiêu, phương án, tác động, fallback.
Chỉ thực hiện sau khi user phê duyệt.