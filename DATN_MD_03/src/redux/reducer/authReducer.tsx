import {
  LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE,
  REGISTER_REQUEST, REGISTER_SUCCESS, REGISTER_FAILURE,
  FORGOT_PASSWORD_REQUEST, FORGOT_PASSWORD_SUCCESS, FORGOT_PASSWORD_FAILURE
} from '../actions/authAction';

interface AuthState {
  loading: boolean;
  user: null | { email: string };
  error: string | null;
  message?: string;
}

const initialState: AuthState = {
  loading: false,
  user: null,
  error: null,
  message: '',
};

const authReducer = (state = initialState, action: any): AuthState => {
  switch (action.type) {
    case LOGIN_REQUEST:
    case REGISTER_REQUEST:
    case FORGOT_PASSWORD_REQUEST:
      return { ...state, loading: true, error: null, message: '' };
    case LOGIN_SUCCESS:
    case REGISTER_SUCCESS:
      return { ...state, loading: false, user: action.payload.user, error: null };
    case FORGOT_PASSWORD_SUCCESS:
      return { ...state, loading: false, message: action.payload, error: null };
    case LOGIN_FAILURE:
    case REGISTER_FAILURE:
    case FORGOT_PASSWORD_FAILURE:
      return { ...state, loading: false, error: action.payload };
    default:
      return state;
  }
};

export default authReducer;
