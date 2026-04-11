import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { courseService } from "../services/courseService";
import { enrollmentService } from "../services/enrollmentService";
import { ROUTES } from "../utils/constants";
import { toast } from "react-toastify";
import "./LearningPage.css";

const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Get course
        const courseRes = await courseService.getById(courseId);
        setCourse(courseRes.data);

        // Get enrollment
        try {
          const enrollRes = await enrollmentService.getEnrollment(courseId);
          setEnrollment(enrollRes.data);
        } catch {
          setEnrollment(null);
        }
      } catch {
        toast.error("Không thể tải khóa học");
        navigate(ROUTES.STUDENT_DASHBOARD);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId, navigate]);

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>Đang tải...</div>
    );
  }

  if (!course) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Khóa học không tìm thấy
      </div>
    );
  }

  return (
    <div className="learning-page">
      {/* Header */}
      <div className="learning-header">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn btn-ghost"
          style={{ marginRight: "16px" }}
        >
          {sidebarOpen ? "✕" : "☰"}
        </button>
        <h1 style={{ flex: 1, margin: 0, fontSize: "18px" }}>{course.title}</h1>
        <button
          onClick={() => navigate(ROUTES.STUDENT_COURSES)}
          className="btn btn-ghost"
        >
          ← Quay lại
        </button>
      </div>

      <div className="learning-container">
        {/* Sidebar - Course content */}
        {sidebarOpen && (
          <aside className="learning-sidebar">
            <div
              style={{
                padding: "16px",
                borderBottom: "1px solid var(--border-color)",
              }}
            >
              <h3 style={{ margin: "0 0 12px 0" }}>Nội dung khóa học</h3>
              <div style={{ fontSize: "12px", color: "var(--text-tertiary)" }}>
                {course.lessons || 0} bài học • {course.duration || "0 giờ"}
              </div>
            </div>

            <div
              style={{ overflowY: "auto", maxHeight: "calc(100vh - 120px)" }}
            >
              {course.content?.map((section, idx) => (
                <div
                  key={section.id}
                  style={{ borderBottom: "1px solid var(--border-color)" }}
                >
                  <div
                    style={{
                      padding: "12px 16px",
                      backgroundColor: "#f5f5f5",
                      fontWeight: "600",
                      fontSize: "13px",
                      cursor: "pointer",
                      userSelect: "none",
                    }}
                  >
                    {idx + 1}. {section.title}
                  </div>
                  {section.lessons?.map((lesson) => (
                    <div
                      key={lesson.id}
                      onClick={() => setCurrentLesson(lesson)}
                      style={{
                        padding: "12px 16px",
                        borderLeft:
                          lesson.id === currentLesson?.id
                            ? "3px solid var(--primary)"
                            : "none",
                        backgroundColor:
                          lesson.id === currentLesson?.id
                            ? "#f0f3ff"
                            : "transparent",
                        cursor: "pointer",
                        fontSize: "13px",
                        color:
                          lesson.id === currentLesson?.id
                            ? "var(--primary)"
                            : "var(--text-secondary)",
                      }}
                    >
                      ▶ {lesson.title}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="learning-main">
          {currentLesson ? (
            <div>
              <h2>{currentLesson.title}</h2>
              <div
                style={{
                  backgroundColor: "#000",
                  height: "400px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "#fff",
                  fontSize: "16px",
                  marginBottom: "24px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "48px", marginBottom: "12px" }}>
                    ▶
                  </div>
                  <div>Video Player - {currentLesson.duration} phút</div>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "24px",
                  flexWrap: "wrap",
                }}
              >
                <button className="btn btn-primary">
                  <FaCheck style={{ marginRight: "6px" }} /> Đánh dấu hoàn thành
                </button>
                <button className="btn btn-outline">+ Thêm ghi chú</button>
              </div>

              <div className="card">
                <div className="card-header">
                  <h3>Mô tả bài học</h3>
                </div>
                <div className="card-body">
                  <p>Nội dung chi tiết của bài học sẽ hiển thị tại đây.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <div style={{ fontSize: "48px", marginBottom: "16px" }}>
                <FaWaveHand size={48} />
              </div>
              <h3>Chào mừng đến với khóa học!</h3>
              <p>Hãy chọn một bài học từ danh sách bên trái để bắt đầu học</p>

              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  backgroundColor: "#f0f3ff",
                  borderRadius: "8px",
                }}
              >
                <Strong>Tiến độ của bạn:</Strong>
                <div style={{ marginTop: "12px" }}>
                  <div className="progress" style={{ height: "8px" }}>
                    <div
                      className="progress-bar"
                      style={{ width: `${enrollment?.progress || 0}%` }}
                    ></div>
                  </div>
                  <div
                    style={{
                      marginTop: "8px",
                      fontSize: "13px",
                      color: "var(--text-tertiary)",
                    }}
                  >
                    {enrollment?.progress || 0}% hoàn thành
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default LearningPage;
