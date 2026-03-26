import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { courseService } from "../../services/courseService";
import { ROUTES, COURSE_STATUS, COURSE_LEVELS } from "../../utils/constants";
import { toast } from "react-toastify";
import "./CoursesManagement.css";

const CoursesManagement = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");

  const fetchCourses = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await courseService.getByInstructor(user.id);
      setCourses(res.data?.content || res.data || []);
    } catch {
      toast.error("Không thể tải danh sách khóa học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, [user?.id]);

  const handleDelete = async (courseId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa khóa học này?")) return;
    try {
      await courseService.delete(courseId);
      setCourses(courses.filter((c) => c.id !== courseId));
      toast.success("Xóa khóa học thành công");
    } catch {
      toast.error("Không thể xóa khóa học");
    }
  };

  const handlePublish = async (course) => {
    try {
      const updated = await courseService.update(course.id, {
        status: COURSE_STATUS.PUBLISHED,
      });
      setCourses(courses.map((c) => (c.id === course.id ? updated.data : c)));
      toast.success("Công khai khóa học thành công");
    } catch {
      toast.error("Không thể công khai khóa học");
    }
  };

  const filteredCourses = courses.filter((c) => {
    if (filter !== "all" && c.status !== filter) return false;
    if (search && !c.title.toLowerCase().includes(search.toLowerCase()))
      return false;
    return true;
  });

  if (loading) {
    return (
      <div className="dashboard-page">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Quản lý khóa học</h1>
          <p>Tạo, sửa, xóa và quản lý các khóa học của bạn</p>
        </div>
        <Link to={ROUTES.INSTRUCTOR_CREATE_COURSE} className="btn btn-primary">
          ➕ Tạo khóa học mới
        </Link>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: "24px" }}>
        <div className="card-body">
          <div
            style={{
              display: "flex",
              gap: "16px",
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              placeholder="Tìm kiếm khóa học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input"
              style={{ flex: 1, minWidth: "250px" }}
            />
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="input"
              style={{ minWidth: "180px" }}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value={COURSE_STATUS.DRAFT}>Nháp</option>
              <option value={COURSE_STATUS.PUBLISHED}>Công khai</option>
            </select>
          </div>
        </div>
      </div>

      {/* Courses Table */}
      {filteredCourses.length === 0 ? (
        <div className="empty-state" style={{ padding: "60px 20px" }}>
          <div className="empty-state-icon">📚</div>
          <h3>Chưa có khóa học nào</h3>
          <p>
            {search
              ? "Không tìm thấy khóa học phù hợp"
              : "Tạo khóa học đầu tiên của bạn ngay hôm nay"}
          </p>
          {!search && (
            <Link
              to={ROUTES.INSTRUCTOR_CREATE_COURSE}
              className="btn btn-primary"
              style={{ marginTop: "16px" }}
            >
              Tạo khóa học
            </Link>
          )}
        </div>
      ) : (
        <div className="card">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Khóa học</th>
                  <th>Mức độ</th>
                  <th>Giá</th>
                  <th>Học sinh</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.id}>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                        }}
                      >
                        {course.image && (
                          <img
                            src={course.image}
                            alt={course.title}
                            style={{
                              width: "48px",
                              height: "36px",
                              objectFit: "cover",
                              borderRadius: "6px",
                            }}
                          />
                        )}
                        <div>
                          <div style={{ fontWeight: "600", fontSize: "14px" }}>
                            {course.title}
                          </div>
                          <div
                            style={{
                              fontSize: "12px",
                              color: "var(--text-tertiary)",
                            }}
                          >
                            ID: {course.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-gray">
                        {course.level === COURSE_LEVELS.BEGINNER && "Cơ bản"}
                        {course.level === COURSE_LEVELS.INTERMEDIATE &&
                          "Trung bình"}
                        {course.level === COURSE_LEVELS.ADVANCED && "Nâng cao"}
                      </span>
                    </td>
                    <td>{course.price?.toLocaleString("vi") || "0"} đ</td>
                    <td>{course.totalStudents || 0}</td>
                    <td>
                      <span
                        className={`badge ${
                          course.status === COURSE_STATUS.PUBLISHED
                            ? "badge-success"
                            : "badge-gray"
                        }`}
                      >
                        {course.status === COURSE_STATUS.PUBLISHED
                          ? "Công khai"
                          : "Nháp"}
                      </span>
                    </td>
                    <td>
                      <div
                        style={{
                          display: "flex",
                          gap: "6px",
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          onClick={() =>
                            navigate(
                              `${ROUTES.INSTRUCTOR_EDIT_COURSE.replace(":courseId", course.id)}`,
                            )
                          }
                          cclassName="btn btn-outline btn-sm"
                          style={{ fontSize: "12px", padding: "6px 12px" }}
                        >
                          ✏ Sửa
                        </button>
                        {course.status === COURSE_STATUS.DRAFT && (
                          <button
                            onClick={() => handlePublish(course)}
                            className="btn btn-primary btn-sm"
                            style={{ fontSize: "12px", padding: "6px 12px" }}
                          >
                            ✓ Công khai
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="btn btn-danger btn-sm"
                          style={{ fontSize: "12px", padding: "6px 12px" }}
                        >
                          🗑 Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                ,
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoursesManagement;
