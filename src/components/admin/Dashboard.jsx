import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import Loading from '../../components/common/Loading';
import '../student/Dashboard.css';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ users: 0, courses: 0, enrollments: 0, revenue: 0 });
  const [loading, setLoading] = useState(false);

  const statCards = [
    { label: 'Tổng người dùng', value: stats.users || '—', icon: '👥', color: 'var(--primary)' },
    { label: 'Tổng khóa học', value: stats.courses || '—', icon: '📚', color: 'var(--secondary)' },
    { label: 'Lượt đăng ký', value: stats.enrollments || '—', icon: '🎓', color: 'var(--success)' },
    { label: 'Doanh thu (VND)', value: stats.revenue ? `${stats.revenue.toLocaleString()}` : '—', icon: '💰', color: 'var(--warning)' },
  ];

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="welcome-banner">
        <div>
          <h1>Admin Dashboard ⚡</h1>
          <p>Quản lý toàn bộ hệ thống LMS của bạn.</p>
        </div>
      </div>

      <div className="stats-grid">
        {statCards.map(s => (
          <div key={s.label} className="stat-card" style={{ '--stat-color': s.color }}>
            <div className="stat-icon">{s.icon}</div>
            <div>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-6)' }}>
        <div className="card">
          <div className="card-header">
            <h3>Quản lý nhanh</h3>
          </div>
          <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Link to="/admin/users" className="btn btn-outline btn-full" style={{ justifyContent: 'flex-start', gap: '12px' }}>
              👥 Quản lý người dùng
            </Link>
            <Link to="/admin/courses" className="btn btn-outline btn-full" style={{ justifyContent: 'flex-start', gap: '12px' }}>
              📚 Phê duyệt khóa học
            </Link>
            <Link to="/admin/categories" className="btn btn-outline btn-full" style={{ justifyContent: 'flex-start', gap: '12px' }}>
              🏷️ Quản lý danh mục
            </Link>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3>Hoạt động gần đây</h3>
          </div>
          <div className="card-body">
            <div className="empty-state" style={{ padding: 'var(--space-6)' }}>
              <div className="empty-state-icon">📊</div>
              <p>Dữ liệu hoạt động sẽ hiển thị tại đây</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
