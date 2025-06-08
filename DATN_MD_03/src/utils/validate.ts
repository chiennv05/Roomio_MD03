export const validateUserInputFirstError = (input: {
  email?: string;
  password?: string;
  username?: string;
  confirmPassword?: string;
  birthDay?: string | null;
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

  if (input.confirmPassword !== input.password) {
    return 'Mật khẩu xác nhận không khớp';
  }
  if (!input.birthDay || input.birthDay.trim() === '') {
    return 'Vui lòng nhập ngày sinh';
  }

  return null; // không lỗi
};
