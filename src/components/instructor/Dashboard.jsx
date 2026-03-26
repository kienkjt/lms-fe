import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { courseService } from '../../services/courseService';
import { ROUTES } from '../../utils/constants';
import Loading from '../../components/common/Loading';
import '../student/Dashboard.css';

const InstructorDashboard = () => {
  const { user } = useSelector(state => state.auth);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      courseService.getByInstructor(user.id)
        .then(res => setCourses(res.data?.content || res.data || []))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [user]);

  const stats = [
    { label: 'Tổng khóa học', value: courses.length, icon: '📚', color: 'var(--primary)' },
    { label: 'Đang hoạt động', value: courses.filter(c => c.status === 'PUBLISHED').length, icon: '✅', color: 'var(--success)' },
    { label: 'Tổng học sinh', value: courses.reduce((a, c) => a + (c.totalStudents || 0), 0), icon: '👥', color: 'var(--secondary)' },
    { label: 'Đánh giá TB', value: (courses.reduce((a, c) => a + (c.avgRating || 0), 0) / Math.max(courses.length, 1)).toFixed(1), icon: '⭐', color: 'var(--warning)' },
  ];

  if (loading) return <Loading />;

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="welcome-banner">
        <div>
          <h1>Dashboard Giảng viên 🎓</h1>
          <p>Quản lý khóa học và theo dõi tiến độ học sinh của bạn.</p>
        </div>
        <Link to={ROUTES.INSTRUCTOR_CREATE_COURSE} className="btn btn-primary" style={{ background: 'white', color: 'var(--primary)' }}>
          ➕ Tạo khóa học mới
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map(s => (
          <div key={s.label} className="stat-card" style={{ '--stat-color': s.color }}>
            <div className="stat-icon">{s.icon}</div>
            <div>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Khóa học của tôi</h2>
          <Link to={ROUTES.INSTRUCTOR_COURSES} className="see-all-link">Quản lý tất cả →</Link>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📚</div>
            <h3>Chưa có khóa học nào</h3>
            <p>Tạo khóa học đầu tiên của bạn ngay hôm nay</p>
            <Link to={ROUTES.INSTRUCTOR_CREATE_COURSE} className="btn btn-primary">Tạo khóa học</Link>
          </div>
        ) : (
          <div style={{ background: 'white', borderRadius: 'var(--radius-xl)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Trạng thái</th>
                  <th>Học sinh</th>
                  <th>Đánh giá</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {courses.map(course => (
                  <tr key={course.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        {course.thumbnail && <img src={course.thumbnail} alt={course.title} style={{ width: '48px', height: '36px', objectFit: 'cover', borderRadius: '6px' }} />}
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>{course.title}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${course.status === 'PUBLISHED' ? 'badge-success' : course.status === 'DRAFT' ? 'badge-gray' : 'badge-warning'}`}>
                        {course.status}
                      </span>
                    </td>
                    <td>{course.totalStudents || 0}</td>
                    <td>{course.avgRating ? `⭐ ${course.avgRating.toFixed(1)}` : '-'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link to={`/courses/${course.slug}`} className="btn btn-ghost btn-sm">Xem</Link>
                        <Link to={`/instructor/courses/${course.id}/edit`} className="btn btn-outline btn-sm">Sửa</Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;
