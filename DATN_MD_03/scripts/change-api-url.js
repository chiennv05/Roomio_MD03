#!/usr/bin/env node

/**
 * Script tiện ích để thay đổi địa chỉ API URL trong ứng dụng
 * Sử dụng: node scripts/change-api-url.js <URL_mới>
 * Ví dụ: node scripts/change-api-url.js http://localhost:4000
 */

const fs = require('fs');
const path = require('path');

// Lấy URL mới từ tham số dòng lệnh
const newUrl = process.argv[2];

// Kiểm tra xem người dùng có cung cấp URL không
if (!newUrl) {
  console.log('❌ Vui lòng cung cấp URL mới!');
  console.log('💡 Cách sử dụng: node scripts/change-api-url.js http://localhost:4000');
  console.log('💡 Ví dụ khác: node scripts/change-api-url.js http://192.168.1.100:4000');
  process.exit(1);
}

// Kiểm tra định dạng URL có hợp lệ không
try {
  new URL(newUrl);
} catch (error) {
  console.log('❌ URL không hợp lệ!');
  console.log('💡 Ví dụ URL hợp lệ: http://localhost:4000 hoặc https://api.example.com');
  process.exit(1);
}

// Đường dẫn đến file cấu hình chính
const configPath = path.join(__dirname, '../src/configs/index.ts');

// Đọc nội dung file cấu hình hiện tại
let configContent;
try {
  configContent = fs.readFileSync(configPath, 'utf8');
} catch (error) {
  console.log('❌ Không thể đọc file config:', error.message);
  process.exit(1);
}

// Thay thế BASE_URL cũ bằng URL mới (sử dụng regex để tìm và thay thế)
const updatedContent = configContent.replace(
  /BASE_URL:\s*['"][^'"]*['"]/,
  `BASE_URL: '${newUrl}'`
);

// Kiểm tra xem có thực sự thay đổi được gì không
if (updatedContent === configContent) {
  console.log('⚠️  Không tìm thấy BASE_URL để thay đổi!');
  process.exit(1);
}

// Ghi lại file với nội dung đã được cập nhật
try {
  fs.writeFileSync(configPath, updatedContent, 'utf8');
  console.log('✅ Đã cập nhật API URL thành công!');
  console.log('🔗 URL mới:', newUrl);
  console.log('📁 File đã được cập nhật:', configPath);
  console.log('🔄 Vui lòng restart ứng dụng để áp dụng thay đổi.');
} catch (error) {
  console.log('❌ Không thể ghi file config:', error.message);
  process.exit(1);
} 