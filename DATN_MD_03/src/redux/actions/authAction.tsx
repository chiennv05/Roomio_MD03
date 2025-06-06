import {Alert} from 'react-native';
// Action Types
// import API_BASE from '../../configs/api'
export const LOGIN_REQUEST = 'LOGIN_REQUEST';
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAILURE = 'LOGIN_FAILURE';

export const REGISTER_REQUEST = 'REGISTER_REQUEST';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAILURE = 'REGISTER_FAILURE';

export const FORGOT_PASSWORD_REQUEST = 'FORGOT_PASSWORD_REQUEST';
export const FORGOT_PASSWORD_SUCCESS = 'FORGOT_PASSWORD_SUCCESS';
export const FORGOT_PASSWORD_FAILURE = 'FORGOT_PASSWORD_FAILURE';

const API_BASE = 'http://125.212.229.71:4000';

function validateEmail(email: string) {
  const re = /^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/;
  return re.test(email);
}

function validatePassword(password: string) {
  // Ít nhất 8 ký tự, 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/.test(
    password,
  );
}

function validateUsername(username: string) {
  return username.length >= 3 && username.length <= 20;
}
//login
export const login =
  (credentials: {username: string; password: string}) =>
  async (dispatch: any) => {
    dispatch({type: LOGIN_REQUEST});

    if (!validateUsername(credentials.username)) {
      dispatch({type: LOGIN_FAILURE, payload: 'Username phải từ 3-20 ký tự'});
      return null;
    }
    if (!validatePassword(credentials.password)) {
      dispatch({
        type: LOGIN_FAILURE,
        payload:
          'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
      });
      return null;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          username: credentials.username,
          password: credentials.password,
        }),
      });
      const data = await res.json();
      if (data.success === false) {
        Alert.alert(data.message);
      } else {
        dispatch({type: LOGIN_SUCCESS, payload: {user: data.user}});
        return data;
      }
    } catch (error: any) {
      dispatch({type: LOGIN_FAILURE, payload: error.message});
      return null;
    }
  };

export const register =
  (data: {
    email: string;
    password: string;
    username: string;
    role: string;
    birthDate: string;
  }) =>
  async (dispatch: any) => {
    dispatch({type: REGISTER_REQUEST});

    // Validate
    if (!validateEmail(data.email)) {
      dispatch({type: REGISTER_FAILURE, payload: 'Email không hợp lệ'});
      return;
    }
    if (!validateUsername(data.username)) {
      dispatch({
        type: REGISTER_FAILURE,
        payload: 'Username phải từ 3-20 ký tự',
      });
      return;
    }
    if (!validatePassword(data.password)) {
      dispatch({
        type: REGISTER_FAILURE,
        payload:
          'Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt',
      });
      return;
    }
    if (!data.role) {
      dispatch({type: REGISTER_FAILURE, payload: 'Vui lòng chọn vai trò'});
      return;
    }
    if (!data.birthDate) {
      dispatch({type: REGISTER_FAILURE, payload: 'Vui lòng nhập ngày sinh'});
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          username: data.username,
          role: data.role,
          birthDate: data.birthDate,
        }),
      });
      if (!res.ok) throw new Error('Đăng ký thất bại');
      const result = await res.json();
      dispatch({type: REGISTER_SUCCESS, payload: {user: result.user}});
    } catch (error: any) {
      dispatch({type: REGISTER_FAILURE, payload: error.message});
    }
  };

export const forgotPassword = (email: string) => async (dispatch: any) => {
  dispatch({type: FORGOT_PASSWORD_REQUEST});
  try {
    const res = await fetch(`${API_BASE}/auth/forgot-password`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({email}),
    });
    if (!res.ok) throw new Error('Gửi email thất bại');
    const result = await res.json();
    dispatch({
      type: FORGOT_PASSWORD_SUCCESS,
      payload: result.message || 'Đã gửi email đặt lại mật khẩu!',
    });
  } catch (error: any) {
    dispatch({type: FORGOT_PASSWORD_FAILURE, payload: error.message});
  }
};
