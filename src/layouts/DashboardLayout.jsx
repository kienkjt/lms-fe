import React, { useState, useRef, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import { authService } from "../services/authService";
import { ROUTES, ROLES } from "../utils/constants";
import { getInitials } from "../utils/helpers";
import "./DashboardLayout.css";

const getInstructorNavItems = () => [
  { path: ROUTES.INSTRUCTOR_DASHBOARD, icon: "📊", label: "Dashboard" },
  { path: ROUTES.INSTRUCTOR_COURSES, icon: "📚", label: "Quản lý khóa học" },
  { path: ROUTES.INSTRUCTOR_CREATE_COURSE, icon: "➕", label: "Tạo khóa học" },
  { path: ROUTES.PROFILE, icon: "👤", label: "Hồ sơ" },
];

const studentNavItems = [
  { path: ROUTES.STUDENT_DASHBOARD, label: "Dashboard" },
  { path: ROUTES.STUDENT_COURSES, label: "Khóa học" },
  { path: ROUTES.WISHLIST, label: "Yêu thích" },
  { path: ROUTES.CERTIFICATES || "/certificates", label: "Chứng chỉ" },
];

const DashboardLayout = ({ children }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    dispatch(logout());
    navigate(ROUTES.HOME);
  };

  const isStudent = user?.role === ROLES.STUDENT;

  if (isStudent) {
    return (
      <div className="student-layout">
        {/* Top Header for Student */}
        <header className="student-header">
          <div className="student-header-container">
            {/* Left: Logo */}
            <Link to={ROUTES.HOME} className="student-logo">
              <svg
                className="logo-icon-svg"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2L2 7V12C2 18.6 7.1 24 12 24C16.9 24 22 18.6 22 12V7L12 2Z" />
              </svg>
              <span className="logo-text">EduLearn</span>
            </Link>

            {/* Center: Navigation */}
            <nav className="student-nav">
              {studentNavItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`student-nav-item ${location.pathname === item.path ? "active" : ""}`}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Right: Actions */}
            <div className="student-actions">
              <div className="search-wrapper">
                <svg
                  className="search-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="11" cy="11" r="8"></circle>
                  <path d="m21 21-4.35-4.35"></path>
                </svg>
                <input
                  type="text"
                  placeholder="Tìm kiếm khoá học..."
                  className="search-input-student"
                />
              </div>

              <button className="icon-btn" aria-label="Notifications">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                  <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                </svg>
                <span className="notification-badge"></span>
              </button>

              <div className="user-dropdown-container" ref={dropdownRef}>
                <button
                  className="avatar-btn"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                >
                  <div className="avatar-circle">
                    {getInitials(user?.firstName, user?.lastName)}
                  </div>
                </button>

                {dropdownOpen && (
                  <div className="user-dropdown">
                    <div className="dropdown-header">
                      <div className="dropdown-name">
                        {user?.firstName} {user?.lastName}
                      </div>
                      <div className="dropdown-email">{user?.email}</div>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link to={ROUTES.PROFILE} className="dropdown-item">
                      Hồ sơ cá nhân
                    </Link>
                    <Link
                      to={ROUTES.STUDENT_DASHBOARD}
                      className="dropdown-item"
                    >
                      Dashboard
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      onClick={handleLogout}
                      className="dropdown-item text-danger"
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="student-main">{children}</main>
      </div>
    );
  }

  // Fallback for Instructor / Admin
  const navItems = getInstructorNavItems();

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarCollapsed ? "collapsed" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          <Link to={ROUTES.HOME} className="sidebar-logo">
            <div className="logo-icon">E</div>
            {!sidebarCollapsed && <span className="logo-text">EduLearn</span>}
          </Link>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            id="sidebar-toggle"
          >
            {sidebarCollapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* User Info */}
        {!sidebarCollapsed && (
          <div className="sidebar-user">
            <div className="avatar">
              {getInitials(user?.firstName, user?.lastName)}
            </div>
            <div className="sidebar-user-info">
              <div className="font-semibold">
                {user?.firstName} {user?.lastName}
              </div>
              <span className="badge badge-secondary">{user?.role}</span>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`sidebar-nav-item ${location.pathname === item.path ? "active" : ""}`}
              title={sidebarCollapsed ? item.label : ""}
            >
              <span className="nav-icon">{item.icon}</span>
              {!sidebarCollapsed && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>

        {/* Sidebar Footer */}
        <div className="sidebar-footer">
          <Link to={ROUTES.HOME} className="sidebar-nav-item">
            <span className="nav-icon">🏠</span>
            {!sidebarCollapsed && <span>Trang chủ</span>}
          </Link>
          <button className="sidebar-nav-item danger" onClick={handleLogout}>
            <span className="nav-icon">🚪</span>
            {!sidebarCollapsed && <span>Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="dashboard-main">
        {/* Top Bar */}
        <header className="dashboard-topbar">
          <div className="topbar-left">
            <button
              className="topbar-toggle"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              id="topbar-sidebar-toggle"
            >
              ☰
            </button>
            <div className="topbar-breadcrumb">
              {navItems.find((i) => i.path === location.pathname)?.label ||
                "Dashboard"}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="dashboard-content">{children}</main>
      </div>
    </div>
  );
};

export default DashboardLayout;
