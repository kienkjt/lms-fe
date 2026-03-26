import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../utils/constants';
import './ErrorPages.css';

export const NotFoundPage = () => (
  <div className="error-page">
    <div className="error-content">
      <div className="error-code">404</div>
      <h1>Trang không tìm thấy</h1>
      <p>Trang bạn đang tìm kiếm không tồn tại hoặc đã được di chuyển.</p>
      <div className="error-actions">
        <Link to={ROUTES.HOME} className="btn btn-primary btn-lg">🏠 Về trang chủ</Link>
        <Link to={ROUTES.COURSES} className="btn btn-outline btn-lg">📚 Khóa học</Link>
      </div>
    </div>
  </div>
);

export const UnauthorizedPage = () => (
  <div className="error-page">
    <div className="error-content">
      <div className="error-icon">🔒</div>
      <h1>Không có quyền truy cập</h1>
      <p>Bạn không có quyền truy cập vào trang này.</p>
      <div className="error-actions">
        <Link to={ROUTES.HOME} className="btn btn-primary btn-lg">🏠 Về trang chủ</Link>
        <Link to={ROUTES.LOGIN} className="btn btn-outline btn-lg">Đăng nhập</Link>
      </div>
    </div>
  </div>
);

export const ServerErrorPage = () => (
  <div className="error-page">
    <div className="error-content">
      <div className="error-code">500</div>
      <h1>Lỗi máy chủ</h1>
      <p>Có lỗi xảy ra phía máy chủ. Vui lòng thử lại sau.</p>
      <div className="error-actions">
        <button className="btn btn-primary btn-lg" onClick={() => window.location.reload()}>🔄 Tải lại trang</button>
        <Link to={ROUTES.HOME} className="btn btn-outline btn-lg">🏠 Về trang chủ</Link>
      </div>
    </div>
  </div>
);
