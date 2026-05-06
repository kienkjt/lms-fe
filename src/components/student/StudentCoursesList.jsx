import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { enrollmentService } from "../../services/enrollmentService";
import { ROUTES } from "../../utils/constants";
import Loading from "../common/Loading";
import "./StudentCoursesList.css";

const normalizeEnrollment = (enrollment) => ({
  ...enrollment,
  id: enrollment.enrollmentId || enrollment.id,
  courseId: enrollment.courseId || enrollment.course?.id,
  courseTitle: enrollment.courseTitle || enrollment.course?.title,
  courseThumbnail:
    enrollment.courseThumbnail ||
    enrollment.course?.thumbnail ||
    enrollment.course?.image,
  instructorName:
    enrollment.instructorName || enrollment.course?.instructorName,
  progressPercent:
    enrollment.progressPercent ??
    enrollment.progress ??
    enrollment.course?.progressPercent ??
    0,
});

const StudentCoursesList = () => {
  const { user } = useSelector((state) => state.auth);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterStatus, setFilterStatus] = useState("all"); // all, in-progress, completed
  const PAGE_SIZE = 12;

  useEffect(() => {
    if (user?.id) {
      enrollmentService
        .getStudentCoursesPaginated({ page, size: PAGE_SIZE })
        .then((res) => {
          const data = res.data?.content || res.data || [];
          const normalized = Array.isArray(data)
            ? data.map(normalizeEnrollment)
            : [];
          setEnrollments(normalized);
          setTotalPages(res.data?.totalPages || 1);
        })
        .catch(() => {
          setEnrollments([]);
          setTotalPages(1);
        })
        .finally(() => setLoading(false));
    }
  }, [user, page]);

  const getFilteredCourses = () => {
    if (filterStatus === "all") return enrollments;
    if (filterStatus === "in-progress")
      return enrollments.filter((e) => !e.completedAt && e.progressPercent > 0);
    if (filterStatus === "completed")
      return enrollments.filter((e) => e.completedAt);
    return enrollments;
  };

  const filteredCourses = getFilteredCourses();

  if (loading) return <Loading />;

  return (
    <div className="student-courses-list animate-fade-in">
      {/* Header */}
      <div className="courses-list-header">
        <div>
          <h1>Khóa học của tôi</h1>
          <p>Quản lý và tiếp tục học các khóa học của bạn</p>
        </div>
        <Link to={ROUTES.COURSES} className="btn-explore-new">
          Khám phá khóa học mới
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M5 12h14M12 5l7 7-7 7"></path>
          </svg>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="filter-tabs">
        <button
          className={`filter-tab ${filterStatus === "all" ? "active" : ""}`}
          onClick={() => {
            setFilterStatus("all");
            setPage(1);
          }}
        >
          Tất cả ({enrollments.length})
        </button>
        <button
          className={`filter-tab ${filterStatus === "in-progress" ? "active" : ""}`}
          onClick={() => {
            setFilterStatus("in-progress");
            setPage(1);
          }}
        >
          Đang theo học (
          {
            enrollments.filter((e) => !e.completedAt && e.progressPercent > 0)
              .length
          }
          )
        </button>
        <button
          className={`filter-tab ${filterStatus === "completed" ? "active" : ""}`}
          onClick={() => {
            setFilterStatus("completed");
            setPage(1);
          }}
        >
          Hoàn thành ({enrollments.filter((e) => e.completedAt).length})
        </button>
      </div>

      {/* Courses Grid or Empty State */}
      {filteredCourses.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <circle cx="8.5" cy="8.5" r="1.5"></circle>
              <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
          </div>
          <h3>
            {filterStatus === "all"
              ? "Chưa có khóa học nào"
              : `Không có khóa học ${filterStatus === "in-progress" ? "đang theo học" : "hoàn thành"}`}
          </h3>
          <p>
            {filterStatus === "all"
              ? "Bắt đầu hành trình của bạn bằng cách đăng ký một khóa học mới."
              : "Chọn bộ lọc khác để xem khóa học của bạn."}
          </p>
          <Link to={ROUTES.COURSES} className="btn-explore-new">
            Tìm khóa học
          </Link>
        </div>
      ) : (
        <div className="courses-grid">
          {filteredCourses.map((enrollment) => (
            <div key={enrollment.id} className="course-card">
              <div className="course-thumbnail">
                {enrollment.courseThumbnail ? (
                  <img
                    src={enrollment.courseThumbnail}
                    alt={enrollment.courseTitle || "Khóa học"}
                  />
                ) : (
                  <div className="placeholder-thumbnail">
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <circle cx="8.5" cy="8.5" r="1.5"></circle>
                      <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                  </div>
                )}
                {enrollment.completedAt && (
                  <div className="course-badge completed">Hoàn thành</div>
                )}
              </div>
              <div className="course-info">
                <h3 className="course-title" title={enrollment.courseTitle}>
                  {enrollment.courseTitle || "Chưa có tên khóa học"}
                </h3>
                <div className="course-instructor">
                  {enrollment.instructorName || "Giảng viên chưa cập nhật"}
                </div>
                <div className="course-progress-wrapper">
                  <div className="progress-bar-bg">
                    <div
                      className="progress-bar-fill"
                      style={{ width: `${enrollment.progressPercent || 0}%` }}
                    ></div>
                  </div>
                  <div className="progress-text">
                    {Math.round(enrollment.progressPercent || 0)}% hoàn thành
                  </div>
                </div>
                <Link
                  to={`/learn/${enrollment.courseId}`}
                  className="btn-continue"
                >
                  {enrollment.completedAt ? "Xem lại" : "Tiếp tục học"}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="pagination-btn"
          >
            ← Trước
          </button>
          <div className="pagination-info">
            Trang {page} / {totalPages}
          </div>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="pagination-btn"
          >
            Tiếp →
          </button>
        </div>
      )}
    </div>
  );
};

export default StudentCoursesList;
