import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { chapterService } from "../../services/chapterService";
import { courseService } from "../../services/courseService";
import { toast } from "react-toastify";
import {
  FaLayerGroup,
  FaPlus,
  FaPen,
  FaTrash,
  FaArrowLeft,
  FaBook,
} from "react-icons/fa";
import "./ChapterManagement.css";

const ChapterManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [courseLoading, setCourseLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingChapter, setEditingChapter] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
  });

  // Load course info
  useEffect(() => {
    if (courseId) {
      courseService
        .getById(courseId)
        .then((res) => setCourse(res.data))
        .catch((err) => {
          console.error("Failed to load course:", err);
          toast.error("Không thể tải thông tin khóa học");
        })
        .finally(() => setCourseLoading(false));
    }
  }, [courseId]);

  // Load chapters
  useEffect(() => {
    fetchChapters();
  }, [courseId]);

  const fetchChapters = async () => {
    if (!courseId) return;
    try {
      setLoading(true);
      const res = await chapterService.getChaptersByCourse(courseId);
      setChapters(res.data || []);
    } catch (error) {
      console.error("Fetch chapters error:", error);
      toast.error("Không thể tải danh sách chương");
      setChapters([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (chapter = null) => {
    if (chapter) {
      setEditingChapter(chapter);
      setFormData({
        title: chapter.title,
        description: chapter.description || "",
      });
    } else {
      setEditingChapter(null);
      setFormData({
        title: "",
        description: "",
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingChapter(null);
    setFormData({
      title: "",
      description: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề chương");
      return;
    }

    try {
      if (editingChapter) {
        await chapterService.updateChapter(
          courseId,
          editingChapter.id,
          formData,
        );
        toast.success("Cập nhật chương thành công");
      } else {
        await chapterService.createChapter(courseId, formData);
        toast.success("Tạo chương thành công");
      }
      handleCloseModal();
      fetchChapters();
    } catch (error) {
      console.error("Submit chapter error:", error);
      toast.error(
        error.response?.data?.message ||
          (editingChapter
            ? "Không thể cập nhật chương"
            : "Không thể tạo chương"),
      );
    }
  };

  const handleDelete = async (chapterId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa chương này?")) return;
    try {
      await chapterService.deleteChapter(courseId, chapterId);
      setChapters(chapters.filter((c) => c.id !== chapterId));
      toast.success("Xóa chương thành công");
    } catch (error) {
      console.error("Delete chapter error:", error);
      toast.error(error.response?.data?.message || "Không thể xóa chương");
    }
  };

  if (courseLoading) {
    return (
      <div className="chapter-management">
        <p>Đang tải thông tin khóa học...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="chapter-management">
        <div className="empty-state">
          <p>Khóa học không tìm thấy</p>
          <button className="btn btn-primary" onClick={() => navigate(-1)}>
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="chapter-management">
      {/* Header */}
      <div className="chapter-header">
        <button
          className="btn-back"
          onClick={() => navigate(-1)}
          title="Quay lại"
        >
          <FaArrowLeft size={20} />
        </button>
        <div className="header-content">
          <h1>Quản lý chương</h1>
          <p className="course-title">{course?.title}</p>
        </div>
        <button className="btn btn-primary" onClick={() => handleOpenModal()}>
          <FaPlus style={{ marginRight: "6px" }} /> Tạo chương mới
        </button>
      </div>

      {/* Chapters List */}
      {loading ? (
        <div className="card" style={{ textAlign: "center", padding: "40px" }}>
          <p>Đang tải chương...</p>
        </div>
      ) : chapters.length === 0 ? (
        <div className="empty-state" style={{ padding: "60px 20px" }}>
          <div className="empty-state-icon">
            <FaBook size={48} />
          </div>
          <h3>Chưa có chương nào</h3>
          <p>Tạo chương đầu tiên để bắt đầu xây dựng khóa học</p>
          <button
            className="btn btn-primary"
            style={{ marginTop: "16px" }}
            onClick={() => handleOpenModal()}
          >
            Tạo chương mới
          </button>
        </div>
      ) : (
        <div className="chapters-list">
          {chapters.map((chapter, index) => (
            <div key={chapter.id} className="chapter-card">
              <div className="chapter-card-header">
                <div className="chapter-info">
                  <div className="chapter-number">
                    <FaLayerGroup size={16} />
                    <span>Chương {index + 1}</span>
                  </div>
                  <h3 className="chapter-title">{chapter.title}</h3>
                  {chapter.description && (
                    <p className="chapter-description">{chapter.description}</p>
                  )}
                </div>
                <div className="chapter-stats">
                  <div className="stat">
                    <span className="stat-label">Bài học</span>
                    <span className="stat-value">
                      {chapter.totalLessons || 0}
                    </span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Thời lượng</span>
                    <span className="stat-value">
                      {chapter.totalDuration
                        ? `${Math.round(chapter.totalDuration / 60)} phút`
                        : "0 phút"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Lessons in Chapter */}
              {chapter.lessons && chapter.lessons.length > 0 && (
                <div className="chapter-lessons">
                  <p className="lessons-title">Danh sách bài học:</p>
                  <ul className="lessons-list">
                    {chapter.lessons.map((lesson, idx) => (
                      <li key={lesson.id}>
                        <span className="lesson-number">{idx + 1}</span>
                        <span className="lesson-title">{lesson.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="chapter-actions">
                <button
                  className="btn-icon btn-edit"
                  onClick={() => handleOpenModal(chapter)}
                  title="Chỉnh sửa"
                >
                  <FaPen size={16} />
                  Sửa
                </button>
                <button
                  className="btn-icon btn-delete"
                  onClick={() => handleDelete(chapter.id)}
                  title="Xóa"
                >
                  <FaTrash size={16} />
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Create/Edit Chapter */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingChapter ? "Chỉnh sửa chương" : "Tạo chương mới"}</h2>
              <button className="modal-close" onClick={handleCloseModal}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="chapter-form">
              <div className="form-group">
                <label htmlFor="title">
                  Tiêu đề chương <span className="required">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  className="form-input"
                  placeholder="Nhập tiêu đề chương"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  maxLength={200}
                  required
                />
                <small className="text-muted">
                  {formData.title.length}/200 ký tự
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="description">Mô tả (tuỳ chọn)</label>
                <textarea
                  id="description"
                  className="form-textarea"
                  placeholder="Nhập mô tả chương"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  maxLength={2000}
                  rows={4}
                />
                <small className="text-muted">
                  {formData.description.length}/2000 ký tự
                </small>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingChapter ? "Cập nhật chương" : "Tạo chương"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChapterManagement;
