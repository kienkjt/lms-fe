import { TOKEN_KEY, REFRESH_TOKEN_KEY, USER_KEY } from '../utils/constants';
import { mockUsers } from '../utils/mockData';

// Mock delay to simulate API call
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  // Mock register
  register: async (data) => {
    await delay(500);
    // Validate email format
    if (!data.email || !data.password || !data.name) {
      throw { response: { data: { message: 'Vui lòng nhập đầy đủ thông tin' } } };
    }
    if (data.password.length < 6) {
      throw { response: { data: { message: 'Mật khẩu phải có ít nhất 6 ký tự' } } };
    }
    // Mock user data
    const newUser = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      role: 'STUDENT',
      avatar: `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70)}`,
    };
    localStorage.setItem(TOKEN_KEY, `mock-token-${Date.now()}`);
    localStorage.setItem(REFRESH_TOKEN_KEY, `mock-refresh-token-${Date.now()}`);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    return { data: { user: newUser, message: 'Đăng ký thành công' } };
  },

  // Mock login
  login: async (data) => {
    await delay(500);
    // Check credentials
    let user = null;
    if (data.email === 'student@example.com' && data.password === 'password') {
      user = mockUsers.student1;
    } else if (data.email === 'teacher@example.com' && data.password === 'password') {
      user = mockUsers.teacher1;
    } else {
      throw { response: { data: { message: 'Email hoặc mật khẩu không đúng' } } };
    }
    
    const token = `mock-token-${Date.now()}`;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(REFRESH_TOKEN_KEY, `mock-refresh-token-${Date.now()}`);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    return { data: { user, accessToken: token, message: 'Đăng nhập thành công' } };
  },

  // Mock verify OTP
  verifyOtp: async (data) => {
    await delay(500);
    if (!data.otp || data.otp.length !== 6) {
      throw { response: { data: { message: 'OTP không hợp lệ' } } };
    }
    return { data: { message: 'OTP xác thực thành công' } };
  },

  // Mock logout
  logout: async () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    return { data: { message: 'Đăng xuất thành công' } };
  },

  // Mock forgot password
  forgotPassword: async (data) => {
    await delay(500);
    if (!data.email) {
      throw { response: { data: { message: 'Vui lòng nhập email' } } };
    }
    return { data: { message: 'OTP đã gửi đến email của bạn', email: data.email } };
  },

  // Mock verify reset OTP
  verifyResetOtp: async (data) => {
    await delay(500);
    if (!data.otp || data.otp.length !== 6) {
      throw { response: { data: { message: 'OTP không hợp lệ' } } };
    }
    return { data: { message: 'OTP hợp lệ', resetToken: `reset-token-${Date.now()}` } };
  },

  // Mock reset password
  resetPassword: async (data) => {
    await delay(500);
    if (!data.newPassword || data.newPassword.length < 6) {
      throw { response: { data: { message: 'Mật khẩu phải có ít nhất 6 ký tự' } } };
    }
    return { data: { message: 'Đặt lại mật khẩu thành công' } };
  },

  // Get current user from localStorage
  getCurrentUser: () => {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  },

  // Check if authenticated
  isAuthenticated: () => !!localStorage.getItem(TOKEN_KEY),

  // Mock refresh token
  refreshToken: async (data) => {
    await delay(300);
    const newToken = `mock-token-${Date.now()}`;
    return { data: { accessToken: newToken } };
  },
};
