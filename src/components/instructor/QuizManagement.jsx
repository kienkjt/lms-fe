import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaArrowLeft, FaPlus, FaPen, FaTrash, FaEye } from "react-icons/fa";
import { quizService } from "../../services/quizService";
import { courseService } from "../../services/courseService";
import { ROUTES } from "../../utils/constants";
import Loading from "../common/Loading";
import "./QuizManagement.css";

const QuizManagement = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    timeLimitMinutes: "",
    passScore: 70,
    maxAttempts: "",
    shuffleQuestions: false,
    chapterId: "",
    lessonId: "",
  });
  const [chapterSelection, setChapterSelection] = useState([]);
  const [selectedChapterId, setSelectedChapterId] = useState("");

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [courseRes, quizzesRes, selectionRes] = await Promise.all([
        courseService.getById(courseId),
        quizService.getCourseQuizzes(courseId),
        quizService.getQuizSelection(courseId),
      ]);
      setCourse(courseRes.data || {});
      setQuizzes(quizzesRes.data || []);
      setChapterSelection(
        Array.isArray(selectionRes.data) ? selectionRes.data : [],
      );
    } catch (error) {
      console.error("Failed to load quiz data:", error);
      toast.error("Không thể tải dữ liệu quiz");
    } finally {
      setLoading(false);
    }
  }, [courseId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenModal = (quiz = null) => {
    if (quiz) {
      setEditingQuiz(quiz);
      setFormData({
        title: quiz.title || "",
        description: quiz.description || "",
        timeLimitMinutes: quiz.timeLimitMinutes || "",
        passScore: quiz.passScore || 70,
        maxAttempts: quiz.maxAttempts || "",
        shuffleQuestions: quiz.shuffleQuestions || false,
        chapterId: quiz.chapterId || "",
        lessonId: quiz.lessonId || "",
      });
      const chapterId =
        quiz.chapterId ||
        chapterSelection.find((chapter) =>
          (chapter.lessons || []).some((lesson) => lesson.id === quiz.lessonId),
        )?.id || "";
      setSelectedChapterId(chapterId);
    } else {
      setEditingQuiz(null);
      setFormData({
        title: "",
        description: "",
        timeLimitMinutes: "",
        passScore: 70,
        maxAttempts: "",
        shuffleQuestions: false,
        chapterId: "",
        lessonId: "",
      });
      setSelectedChapterId("");
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingQuiz(null);
    setSelectedChapterId("");
    setFormData({
      title: "",
      description: "",
      timeLimitMinutes: "",
      passScore: 70,
      maxAttempts: "",
      shuffleQuestions: false,
      chapterId: "",
      lessonId: "",
    });
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tên quiz");
      return;
    }

    if (
      isNaN(formData.passScore) ||
      formData.passScore < 0 ||
      formData.passScore > 100
    ) {
      toast.error("Điểm pass phải từ 0 đến 100");
      return;
    }

    try {
      if (editingQuiz) {
        await quizService.updateQuiz(editingQuiz.id, formData);
        toast.success("Cập nhật quiz thành công");
      } else {
        await quizService.createQuiz(courseId, formData);
        toast.success("Tạo quiz thành công");
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error("Error saving quiz:", error);
      toast.error(error.response?.data?.message || "Không thể lưu quiz");
    }
  };

  const handleDelete = async (quizId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa quiz này?")) return;

    try {
      setDeleting(quizId);
      await quizService.deleteQuiz(quizId);
      toast.success("Xóa quiz thành công");
      loadData();
    } catch (error) {
      console.error("Error deleting quiz:", error);
      toast.error("Không thể xóa quiz");
    } finally {
      setDeleting(null);
    }
  };

  const handleViewQuestions = (quizId) => {
    navigate(`/instructor/courses/${courseId}/quiz/${quizId}/questions`);
  };

  if (loading) return <Loading />;

  return (
    <div className="quiz-management">
      <div className="quiz-header">
        <button
          className="btn-back"
          onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
        >
          <FaArrowLeft /> Quay lại
        </button>
        <h1>Quản lý Quiz - {course?.title}</h1>
      </div>

      <div className="quiz-actions">
        <button className="btn-create" onClick={() => handleOpenModal()}>
          <FaPlus /> Tạo Quiz Mới
        </button>
      </div>

      <div className="quizzes-list">
        {quizzes && quizzes.length > 0 ? (
          <table className="quizzes-table">
            <thead>
              <tr>
                <th>Tên Quiz</th>
                <th>Câu hỏi</th>
                <th>Điểm Pass</th>
                <th>Thời gian (phút)</th>
                <th>Lần làm</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {quizzes.map((quiz) => (
                <tr key={quiz.id}>
                  <td>
                    <div className="quiz-title">
                      <strong>{quiz.title}</strong>
                      {quiz.description && <small>{quiz.description}</small>}
                    </div>
                  </td>
                  <td className="center">{quiz.totalQuestions || 0}</td>
                  <td className="center">{quiz.passScore?.toFixed(1)}%</td>
                  <td className="center">
                    {quiz.timeLimitMinutes || "Không giới hạn"}
                  </td>
                  <td className="center">
                    {quiz.maxAttempts || "Không giới hạn"}
                  </td>
                  <td className="actions">
                    <button
                      className="btn-view"
                      title="Xem câu hỏi"
                      onClick={() => handleViewQuestions(quiz.id)}
                    >
                      <FaEye />
                    </button>
                    <button
                      className="btn-edit"
                      title="Chỉnh sửa"
                      onClick={() => handleOpenModal(quiz)}
                    >
                      <FaPen />
                    </button>
                    <button
                      className="btn-delete"
                      title="Xóa"
                      disabled={deleting === quiz.id}
                      onClick={() => handleDelete(quiz.id)}
                    >
                      <FaTrash />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="no-quizzes">
            <p>Chưa có quiz nào. Hãy tạo quiz đầu tiên!</p>
            <button className="btn-create" onClick={() => handleOpenModal()}>
              <FaPlus /> Tạo Quiz
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editingQuiz ? "Chỉnh sửa Quiz" : "Tạo Quiz Mới"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Tên Quiz *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Nhập tên quiz"
                  required
                />
              </div>

              <div className="form-group">
                <label>Mô tả</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Nhập mô tả quiz"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Điểm Pass (%) *</label>
                  <input
                    type="number"
                    name="passScore"
                    value={formData.passScore}
                    onChange={handleInputChange}
                    min="0"
                    max="100"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Thời gian giới hạn (phút)</label>
                  <input
                    type="number"
                    name="timeLimitMinutes"
                    value={formData.timeLimitMinutes}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Để trống = không giới hạn"
                  />
                </div>

                <div className="form-group">
                  <label>Số lần làm tối đa</label>
                  <input
                    type="number"
                    name="maxAttempts"
                    value={formData.maxAttempts}
                    onChange={handleInputChange}
                    min="1"
                    placeholder="Để trống = không giới hạn"
                  />
                </div>
              </div>

              <div className="form-group checkbox">
                <label>Chapter</label>
                <select
                  value={selectedChapterId}
                  onChange={(e) => {
                    const nextChapterId = e.target.value;
                    setSelectedChapterId(nextChapterId);
                    setFormData((prev) => ({
                      ...prev,
                      chapterId: nextChapterId || "",
                      lessonId: "",
                    }));
                  }}
                >
                  <option value="">Không gắn chapter</option>
                  {chapterSelection.map((chapter) => (
                    <option key={chapter.id} value={chapter.id}>
                      {chapter.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group checkbox">
                <label>
                  <input
                    type="checkbox"
                    name="shuffleQuestions"
                    checked={formData.shuffleQuestions}
                    onChange={handleInputChange}
                  />
                  Xáo trộn thứ tự câu hỏi
                </label>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={handleCloseModal}
                >
                  Hủy
                </button>
                <button type="submit" className="btn-save">
                  {editingQuiz ? "Cập nhật" : "Tạo"} Quiz
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuizManagement;
