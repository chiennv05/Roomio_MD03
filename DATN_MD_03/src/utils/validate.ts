export const validateUserInputFirstError = (input: {
  email?: string;
  password?: string;
  username?: string;
  confirmPassword?: string;
}): string | null => {
  if (input.username?.trim() === '') {
    return 'Vui lòng nhập tên đăng nhập';
  }
  if (input.email?.trim() === '') {
    return 'Vui lòng nhập email';
  }
  if (input.password?.trim() === '') {
    return 'Vui lòng nhập mật khẩu';
  }
  if (input.confirmPassword?.trim() === '') {
    return 'Vui lòng nhập mật khẩu xác nhận';
  }

  if (input.username !== undefined) {
    if (input.username.length < 3 || input.username.length > 20) {
      return 'Username phải từ 3 đến 20 ký tự';
    }
  }
  // Validate email
  if (input.email !== undefined) {
    const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!re.test(input.email)) {
      return 'Email không hợp lệ';
    }
  }

  // Validate password
  if (input.password !== undefined) {
    const rePass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!rePass.test(input.password)) {
      return 'Mật khẩu phải ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
    }
  }

  // Validate username

  if (input.password !== input.confirmPassword) {
    return 'Mật khẩu xác nhận không khớp';
  }

  return null; // không lỗi
};
export const validateUserLogin = (input: {
  password?: string;
  username?: string;
}): string | null => {
  if (input.username?.trim() === '') {
    return 'Vui lòng nhập tên đăng nhập';
  }

  if (input.password?.trim() === '') {
    return 'Vui lòng nhập mật khẩu';
  }

  if (input.username !== undefined) {
    if (input.username.length < 3 || input.username.length > 20) {
      return 'Username phải từ 3 đến 20 ký tự';
    }
  }

  // Validate password
  if (input.password !== undefined) {
    const rePass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!rePass.test(input.password)) {
      return 'Mật khẩu phải ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
    }
  }

  return null; // không lỗi
};

export const validateEmail = (email: string) => {
  if (email?.trim() === '') {
    return 'Vui lòng nhập email';
  }
  if (email !== undefined) {
    const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
    if (!re.test(email)) {
      return 'Email không hợp lệ';
    }
  }
  return null;
};

export const validateResetPassword = (
  password: string,
  confirmPassword: string,
) => {
  if (password?.trim() === '') {
    return 'Vui lòng nhập mật khẩu';
  }
  if (confirmPassword?.trim() === '') {
    return 'Vui lòng nhập mật khẩu xác nhận';
  }
  if (password !== undefined) {
    const rePass =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;
    if (!rePass.test(password)) {
      return 'Mật khẩu phải ít nhất 8 ký tự, gồm chữ hoa, chữ thường, số và ký tự đặc biệt';
    }
  }

  // Validate username

  if (password !== confirmPassword) {
    return 'Mật khẩu xác nhận không khớp';
  }
  return null;
};
/**
 * Remove Vietnamese diacritics for search
 * Bỏ dấu tiếng Việt để tìm kiếm
 */
export const removeVietnameseDiacritics = (str: string): string => {
  if (!str) return '';

  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .trim();
};

/**
 * Search text in Vietnamese with diacritics support
 * Tìm kiếm văn bản tiếng Việt có hỗ trợ dấu
 */
export const searchVietnameseText = (
  searchTerm: string,
  targetText: string,
): boolean => {
  if (!searchTerm || !targetText) return false;

  const normalizedSearch = removeVietnameseDiacritics(searchTerm);
  const normalizedTarget = removeVietnameseDiacritics(targetText);

  return normalizedTarget.includes(normalizedSearch);
};

/**
 * Filter rooms by search query (address or description)
 * Lọc phòng theo từ khóa tìm kiếm (địa chỉ hoặc mô tả)
 */
export const filterRoomsBySearch = (
  rooms: any[],
  searchQuery: string,
): any[] => {
  if (!searchQuery || !searchQuery.trim()) {
    return rooms;
  }

  const trimmedQuery = searchQuery.trim();

  return rooms.filter(room => {
    // Search in address
    const addressText = room?.location?.addressText || '';
    const district = room?.location?.district || '';
    const province = room?.location?.province || '';
    const ward = room?.location?.ward || '';

    // Combine all address parts
    const fullAddress = `${addressText} ${district} ${province} ${ward}`.trim();

    // Search in description
    const description = room?.description || '';
    const roomNumber = room?.roomNumber || '';

    // Search in all fields
    return (
      searchVietnameseText(trimmedQuery, fullAddress) ||
      searchVietnameseText(trimmedQuery, description) ||
      searchVietnameseText(trimmedQuery, roomNumber) ||
      searchVietnameseText(trimmedQuery, district) ||
      searchVietnameseText(trimmedQuery, province) ||
      searchVietnameseText(trimmedQuery, ward)
    );
  });
};

/**
 * Demo function to test Vietnamese search (can be removed in production)
 * Hàm demo để test tìm kiếm tiếng Việt (có thể xóa trong production)
 */
export const testVietnameseSearch = (): void => {
  console.log('🧪 Testing Vietnamese Search:');

  // Test cases
  const testCases = [
    {
      search: 'ha noi',
      target: 'Hà Nội',
      expected: true,
    },
    {
      search: 'dong da',
      target: 'Đống Đa',
      expected: true,
    },
    {
      search: 'phong dep',
      target: 'Phòng đẹp giá rẻ',
      expected: true,
    },
    {
      search: 'nha tro',
      target: 'Nhà trọ cao cấp',
      expected: true,
    },
    {
      search: 'cao cap',
      target: 'cao cấp',
      expected: true,
    },
  ];

  testCases.forEach(({search, target, expected}, index) => {
    const result = searchVietnameseText(search, target);
    const status = result === expected ? '✅' : '❌';
    console.log(
      `${status} Test ${index + 1}: "${search}" in "${target}" = ${result}`,
    );
  });
};
export const validateFullName = (fullName: string) => {
  if (!fullName || fullName.trim() === '') {
    return 'Tên không được để trống';
  }
  return null;
};

export const validatePhone = (phone: string) => {
  if (!phone || phone.trim() === '') {
    return 'Số điện thoại không được để trống';
  }
  const re = /^0\d{9}$/;
  if (!re.test(phone)) {
    return 'Số điện thoại không hợp lệ (bắt đầu bằng số 0, 10 chữ số)';
  }
  return null;
};

export const validateIdentityNumber = (identityNumber: string) => {
  if (!identityNumber || identityNumber.trim() === '') {
    return 'Số CCCD/CMND không được để trống';
  }
  const re = /^\d{9,12}$/;
  if (!re.test(identityNumber)) {
    return 'Số CCCD/CMND không hợp lệ (chỉ chứa chữ số, độ dài từ 9-12 chữ số)';
  }
  return null;
};
