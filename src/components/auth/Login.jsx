import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { loginSuccess } from "../../store/authSlice";
import { authService } from "../../services/authService";
import { ROUTES, ROLES } from "../../utils/constants";
import "./Auth.css";

const Login = () => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const from = location.state?.from?.pathname || null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setLoading(true);
    try {
      const res = await authService.login(form);
      const user = res.data?.user || res.data;
      dispatch(loginSuccess(user));
      // Redirect based on role
      if (from) {
        navigate(from, { replace: true });
      } else {
        switch (user?.role) {
          case ROLES.INSTRUCTOR:
            navigate(ROUTES.INSTRUCTOR_DASHBOARD, { replace: true });
            break;
          default:
            navigate(ROUTES.STUDENT_DASHBOARD, { replace: true });
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || "Email hoặc mật khẩu không đúng");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      {/* Left Panel */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-logo">
            <div className="logo-icon-lg">E</div>
            <span className="logo-text-lg">EduLearn</span>
          </div>
          <h1>Học tập không giới hạn 🎓</h1>
          <p>
            Khám phá hàng nghìn khóa học từ các chuyên gia hàng đầu. Nâng cao kỹ
            năng và mở ra cơ hội mới ngay hôm nay.
          </p>
          <div className="auth-stats">
            <div className="stat-item">
              <div className="stat-value">10K+</div>
              <div className="stat-label">Khóa học</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">50K+</div>
              <div className="stat-label">Học sinh</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">2K+</div>
              <div className="stat-label">Giảng viên</div>
            </div>
          </div>
          <div className="auth-testimonials">
            <div className="testimonial">
              <p>
                "EduLearn đã giúp tôi chuyển ngành thành công trong 6 tháng!"
              </p>
              <div className="testimonial-author">
                <div className="avatar avatar-sm">TN</div>
                <span>Trần Ngọc - Software Developer</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container animate-fade-in">
          <div className="auth-form-header">
            <h2>Chào mừng trở lại 👋</h2>
            <p>Đăng nhập để tiếp tục hành trình học tập</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label className="form-label">
                Email <span>*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  className="form-input has-icon-left"
                  placeholder="email@example.com"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                Mật khẩu <span>*</span>
              </label>
              <div className="input-wrapper">
                <span className="input-icon"></span>
                <input
                  id="login-password"
                  name="password"
                  type={showPass ? "text" : "password"}
                  className="form-input has-icon-left has-icon-right"
                  placeholder="Nhập mật khẩu"
                  value={form.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? "🙈" : "👁️"}
                </button>
              </div>
            </div>

            <div className="flex-between mb-4">
              <label className="checkbox-label">
                <input type="checkbox" id="remember-me" /> Ghi nhớ đăng nhập
              </label>
              <Link to={ROUTES.FORGOT_PASSWORD} className="forgot-link">
                Quên mật khẩu?
              </Link>
            </div>

            <button
              id="login-submit"
              type="submit"
              className="btn btn-primary btn-full btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner spinner-sm"></span> Đang đăng nhập...
                </>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>

          <div
            style={{
              marginTop: "24px",
              padding: "12px",
              backgroundColor: "#f0f3ff",
              borderRadius: "8px",
              fontSize: "12px",
              color: "#333",
            }}
          >
            <strong>🔍 Test Credentials:</strong>
            <p style={{ margin: "6px 0 0 0" }}>
              Student: student@example.com / password
              <br />
              Teacher: teacher@example.com / password
            </p>
          </div>

          <div className="auth-divider">
            <span>hoặc</span>
          </div>

          <p className="auth-footer-text">
            Chưa có tài khoản?{" "}
            <Link to={ROUTES.REGISTER} className="auth-link">
              Đăng ký miễn phí
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
