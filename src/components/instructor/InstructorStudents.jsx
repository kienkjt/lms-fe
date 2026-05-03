import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaBookOpen,
  FaCheckCircle,
  FaEnvelope,
  FaPhone,
  FaSearch,
  FaUsers,
} from "react-icons/fa";
import { courseService } from "../../services/courseService";
import { enrollmentService } from "../../services/enrollmentService";
import "./InstructorStudents.css";

const PAGE_SIZE = 10;

const getCourseId = (course) => course?.id || course?.courseId;

const formatDate = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getInitials = (name, email) => {
  const source = name || email || "HV";
  return source
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
};

const normalizePageData = (data) => {
  const content = Array.isArray(data)
    ? data
    : data?.content || data?.students || data?.items || [];
  return {
    content,
    totalElements: data?.totalElements ?? content.length,
    totalPages: data?.totalPages ?? 1,
    number: data?.number ?? data?.pageNumber,
    size: data?.size ?? data?.pageSize ?? PAGE_SIZE,
  };
};

const normalizeStudent = (student) => {
  const profile = student.student || student.user || student.account || {};
  const studentId =
    student.studentId || profile.id || student.userId || student.id;

  return {
    enrollmentId: student.enrollmentId || student.enrollment?.id || student.id,
    studentId,
    studentName:
      student.studentName ||
      profile.fullName ||
      profile.name ||
      student.fullName ||
      student.name ||
      "-",
    studentEmail: student.studentEmail || profile.email || student.email || "-",
    studentPhoneNumber:
      student.studentPhoneNumber ||
      profile.phoneNumber ||
      profile.phone ||
      student.phoneNumber ||
      student.phone ||
      "-",
    studentAvatar:
      student.studentAvatar ||
      profile.avatar ||
      profile.avatarUrl ||
      student.avatar ||
      student.avatarUrl,
    progressPercent:
      student.progressPercent ??
      student.progressPercentage ??
      student.progress ??
      student.enrollment?.progressPercentage ??
      0,
    enrolledAt:
      student.enrolledAt ||
      student.enrollmentDate ||
      student.enrollment?.enrollmentDate,
    completedAt:
      student.completedAt ||
      student.completionDate ||
      student.enrollment?.completionDate,
  };
};

const InstructorStudents = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCourseIdRef = useRef(searchParams.get("courseId") || "");
  const [courses, setCourses] = useState([]);
  const [selectedCourseId, setSelectedCourseId] = useState(
    initialCourseIdRef.current,
  );
  const [studentsPage, setStudentsPage] = useState({
    content: [],
    totalElements: 0,
    totalPages: 1,
  });
  const [courseLoading, setCourseLoading] = useState(true);
  const [studentLoading, setStudentLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    let mounted = true;

    const fetchCourses = async () => {
      try {
        setCourseLoading(true);
        const res = await courseService.getMyInstructorCourses({
          page: 1,
          size: 100,
        });
        const courseList = res.data?.content || res.data || [];

        if (!mounted) return;

        setCourses(courseList);
        if (!initialCourseIdRef.current && courseList.length > 0) {
          const firstCourseId = getCourseId(courseList[0]);
          setSelectedCourseId(firstCourseId);
          setSearchParams({ courseId: firstCourseId }, { replace: true });
          initialCourseIdRef.current = firstCourseId;
        }
      } catch (error) {
        console.error("Fetch instructor courses error:", error);
        toast.error("Không thể tải danh sách khóa học");
      } finally {
        if (mounted) setCourseLoading(false);
      }
    };

    fetchCourses();

    return () => {
      mounted = false;
    };
  }, [setSearchParams]);

  useEffect(() => {
    if (!selectedCourseId) {
      setStudentsPage({ content: [], totalElements: 0, totalPages: 1 });
      return;
    }

    let mounted = true;

    const fetchStudents = async () => {
      try {
        setStudentLoading(true);
        const res = await enrollmentService.getCourseStudentsPaginated(
          selectedCourseId,
          { page, size: PAGE_SIZE },
        );
        if (mounted) {
          setStudentsPage(normalizePageData(res.data));
        }
      } catch (error) {
        console.error("Fetch course students error:", error);
        toast.error(
          error.response?.data?.message || "Không thể tải danh sách học viên",
        );
      } finally {
        if (mounted) setStudentLoading(false);
      }
    };

    fetchStudents();

    return () => {
      mounted = false;
    };
  }, [selectedCourseId, page]);

  const selectedCourse = useMemo(
    () => courses.find((course) => getCourseId(course) === selectedCourseId),
    [courses, selectedCourseId],
  );

  const mappedStudents = useMemo(() => {
    return studentsPage.content.map(normalizeStudent);
  }, [studentsPage.content]);

  const filteredStudents = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return mappedStudents;

    return mappedStudents.filter((student) =>
      [
        student.studentName,
        student.studentEmail,
        student.studentPhoneNumber,
      ].some((value) => value?.toLowerCase().includes(keyword)),
    );
  }, [mappedStudents, search]);

  const completedCount = mappedStudents.filter(
    (student) => student.completedAt,
  ).length;

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    setPage(1);
    setSearch("");
    if (courseId) {
      setSearchParams({ courseId }, { replace: true });
    } else {
      setSearchParams({}, { replace: true });
    }
  };

  if (courseLoading) {
    return (
      <div className="dashboard-page">
        <p>Đang tải...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-page instructor-students-page animate-fade-in">
      <div className="page-header instructor-students-header">
        <div>
          <h1>Học viên</h1>
          <p>Theo dõi danh sách học viên đã đăng ký theo từng khóa học.</p>
        </div>
      </div>

      <div className="students-toolbar">
        <div className="students-field">
          <label htmlFor="course-select">Khóa học</label>
          <select
            id="course-select"
            className="form-select"
            value={selectedCourseId}
            onChange={(event) => handleCourseChange(event.target.value)}
            disabled={courses.length === 0}
          >
            {courses.length === 0 ? (
              <option value="">Chưa có khóa học</option>
            ) : (
              courses.map((course) => (
                <option key={getCourseId(course)} value={getCourseId(course)}>
                  {course.title}
                </option>
              ))
            )}
          </select>
        </div>

        <div className="students-field students-search">
          <label htmlFor="student-search">Tìm kiếm</label>
          <div className="students-search-input">
            <FaSearch />
            <input
              id="student-search"
              className="form-input"
              type="text"
              placeholder="Tên, email hoặc số điện thoại"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              disabled={!selectedCourseId}
            />
          </div>
        </div>
      </div>

      <div className="students-stats-grid">
        <div className="stat-card" style={{ "--stat-color": "var(--primary)" }}>
          <div className="stat-icon">
            <FaUsers />
          </div>
          <div>
            <div className="stat-number">{studentsPage.totalElements}</div>
            <div className="stat-label">Tổng học viên</div>
          </div>
        </div>
        <div className="stat-card" style={{ "--stat-color": "var(--success)" }}>
          <div className="stat-icon">
            <FaCheckCircle />
          </div>
          <div>
            <div className="stat-number">{completedCount}</div>
            <div className="stat-label">Đã hoàn thành</div>
          </div>
        </div>
        <div
          className="stat-card"
          style={{ "--stat-color": "var(--secondary)" }}
        >
          <div className="stat-icon">
            <FaBookOpen />
          </div>
          <div>
            <div className="stat-number">
              {studentsPage.totalElements ?? selectedCourse?.totalStudents ?? 0}
            </div>
            <div className="stat-label">Trong khóa học</div>
          </div>
        </div>
      </div>

      {!selectedCourseId ? (
        <div className="empty-state students-empty">
          <div className="empty-state-icon">
            <FaBookOpen size={48} />
          </div>
          <h3>Chưa có khóa học</h3>
          <p>Tạo khóa học trước khi xem danh sách học viên.</p>
        </div>
      ) : (
        <div className="card students-table-card">
          <div style={{ overflowX: "auto" }}>
            <table className="data-table students-table">
              <thead>
                <tr>
                  <th>Học viên</th>
                  <th>Liên hệ</th>
                  <th>Tiến độ</th>
                  <th>Ngày đăng ký</th>
                  <th>Hoàn thành</th>
                </tr>
              </thead>
              <tbody>
                {studentLoading ? (
                  <tr>
                    <td colSpan={5} className="students-message-cell">
                      Đang tải học viên...
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="students-message-cell">
                      Không có học viên phù hợp
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const progress = Number(student.progressPercent || 0);
                    return (
                      <tr key={student.enrollmentId || student.studentId}>
                        <td>
                          <div className="student-person">
                            {student.studentAvatar ? (
                              <img
                                src={student.studentAvatar}
                                alt={
                                  student.studentName || student.studentEmail
                                }
                                className="student-avatar"
                              />
                            ) : (
                              <div className="student-avatar student-avatar-fallback">
                                {getInitials(
                                  student.studentName,
                                  student.studentEmail,
                                )}
                              </div>
                            )}
                            <div>
                              <div className="student-name">
                                {student.studentName || "Chưa cập nhật"}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="student-contact">
                            <span>
                              <FaEnvelope /> {student.studentEmail || "-"}
                            </span>
                            <span>
                              <FaPhone /> {student.studentPhoneNumber || "-"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <div className="student-progress">
                            <div className="progress progress-sm">
                              <div
                                className="progress-bar"
                                style={{
                                  width: `${Math.min(Math.max(progress, 0), 100)}%`,
                                }}
                              />
                            </div>
                            <span>{progress.toFixed(0)}%</span>
                          </div>
                        </td>
                        <td>{formatDate(student.enrolledAt)}</td>
                        <td>
                          {student.completedAt ? (
                            <span className="badge badge-success">
                              {formatDate(student.completedAt)}
                            </span>
                          ) : (
                            <span className="badge badge-gray">Chưa xong</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {studentsPage.totalPages > 1 && (
            <div className="pagination students-pagination">
              <button
                className="page-btn"
                onClick={() => setPage((value) => Math.max(value - 1, 1))}
                disabled={page === 1 || studentLoading}
              >
                ‹
              </button>
              {Array.from({ length: studentsPage.totalPages }, (_, index) => (
                <button
                  key={index + 1}
                  className={`page-btn ${page === index + 1 ? "active" : ""}`}
                  onClick={() => setPage(index + 1)}
                  disabled={studentLoading}
                >
                  {index + 1}
                </button>
              ))}
              <button
                className="page-btn"
                onClick={() =>
                  setPage((value) =>
                    Math.min(value + 1, studentsPage.totalPages),
                  )
                }
                disabled={page >= studentsPage.totalPages || studentLoading}
              >
                ›
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default InstructorStudents;
