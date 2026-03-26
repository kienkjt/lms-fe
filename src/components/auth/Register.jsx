import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../services/authService';
import { ROUTES } from '../../utils/constants';
import './Auth.css';

const Register = () => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', password: '', confirmPassword: '',
  });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (form.password.length < 8) {
      setError('Mật khẩu phải có ít nhất 8 ký tự');
      return;
    }
    setLoading(true);
    try {
      await authService.register({
        fullName: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        password: form.password,
        role: 'STUDENT'
      });
      navigate(ROUTES.VERIFY_OTP, { state: { email: form.email } });
    } catch (err) {
      setError(err.response?.data?.message || 'Đăng ký thất bại. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Hero */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-logo">
            <div className="logo-icon-lg">E</div>
            <span className="logo-text-lg">EduLearn</span>
          </div>
          <h1>Bắt đầu hành trình học tập của bạn 🚀</h1>
          <p>Tham gia cộng đồng hơn 50.000 học sinh đang học tập và phát triển mỗi ngày trên EduLearn.</p>
          <div className="auth-features">
            {[
              {text: 'Lộ trình học tập cá nhân hóa' },
              {text: 'Chứng chỉ được công nhận' },
              {text: 'Giảng viên hàng đầu' },
              {text: 'Học mọi lúc, mọi nơi' },
            ].map((f) => (
              <div key={f.text} className="feature-item">
                <span>{f.icon}</span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container animate-fade-in">
          <div className="auth-form-header">
            <h2>Tạo tài khoản mới</h2>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="grid grid-2" style={{ gap: '16px' }}>
              <div className="form-group mb-0">
                <label className="form-label">Họ <span>*</span></label>
                <input
                  id="reg-firstname"
                  name="firstName"
                  type="text"
                  className="form-input"
                  placeholder="Nguyễn"
                  value={form.firstName}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group mb-0">
                <label className="form-label">Tên <span>*</span></label>
                <input
                  id="reg-lastname"
                  name="lastName"
                  type="text"
                  className="form-input"
                  placeholder="Văn A"
                  value={form.lastName}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Email <span>*</span></label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  id="reg-email"
                  name="email"
                  type="email"
                  className="form-input has-icon-left"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mật khẩu <span>*</span></label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  id="reg-password"
                  name="password"
                  type={showPass ? 'text' : 'password'}
                  className="form-input has-icon-left has-icon-right"
                  placeholder="Ít nhất 8 ký tự"
                  value={form.password}
                  onChange={handleChange}
                  required
                />
                <button type="button" className="input-icon-right" onClick={() => setShowPass(!showPass)}>
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Xác nhận mật khẩu <span>*</span></label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  id="reg-confirm-password"
                  name="confirmPassword"
                  type={showPass ? 'text' : 'password'}
                  className="form-input has-icon-left"
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input type="checkbox" id="agree-terms" required />
                Tôi đồng ý với{' '}
                <a href="#" className="auth-link">Điều khoản sử dụng</a>
                {' '}và{' '}
                <a href="#" className="auth-link">Chính sách bảo mật</a>
              </label>
            </div>

            <button
              id="register-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? <><span className="spinner spinner-sm"></span> Đang đăng ký...</> : 'Tạo tài khoản miễn phí'}
            </button>
          </form>

          <p className="auth-footer-text" style={{ marginTop: '20px' }}>
            Đã có tài khoản?{' '}
            <Link to={ROUTES.LOGIN} className="auth-link">Đăng nhập ngay</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
