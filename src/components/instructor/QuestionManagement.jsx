import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaArrowLeft,
  FaCheck,
  FaPen,
  FaPlus,
  FaTimes,
  FaTrash,
} from "react-icons/fa";
import Loading from "../common/Loading";
import { quizService } from "../../services/quizService";
import "./QuizManagement.css";

const QUESTION_TYPES = [
  { value: "SINGLE_CHOICE", label: "Chọn một đáp án" },
  { value: "MULTIPLE_CHOICE", label: "Chọn nhiều đáp án" },
  { value: "TRUE_FALSE", label: "Đúng / Sai" },
  { value: "FILL_BLANK", label: "Điền vào chỗ trống" },
];

const emptyQuestion = {
  questionText: "",
  type: "SINGLE_CHOICE",
  options: ["", "", "", ""],
  correctAnswers: [],
  correctAnswerText: "",
  explanation: "",
  points: 1,
};

const splitOptions = (options) =>
  String(options || "")
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);

const splitAnswers = (answer) =>
  String(answer || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

const isChoiceType = (type) =>
  type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";

const toFormQuestion = (question) => {
  if (!question) return emptyQuestion;

  const type = question.type || "SINGLE_CHOICE";
  const options = isChoiceType(type)
    ? splitOptions(question.options)
    : ["", "", "", ""];

  return {
    questionText: question.questionText || "",
    type,
    options: [...options, "", "", "", ""].slice(0, Math.max(options.length, 4)),
    correctAnswers: isChoiceType(type) ? splitAnswers(question.correctAnswer) : [],
    correctAnswerText: isChoiceType(type) ? "" : question.correctAnswer || "",
    explanation: question.explanation || "",
    points: question.points || 1,
  };
};

const QuestionManagement = () => {
  const { courseId, quizId } = useParams();
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [formData, setFormData] = useState(emptyQuestion);

  const selectedType = useMemo(
    () => QUESTION_TYPES.find((type) => type.value === formData.type),
    [formData.type],
  );

  const cleanOptions = useMemo(
    () => formData.options.map((option) => option.trim()).filter(Boolean),
    [formData.options],
  );

  const loadQuiz = useCallback(async () => {
    try {
      setLoading(true);
      const response = await quizService.getQuiz(quizId);
      const quizData = response.data || {};
      setQuiz(quizData);
      setQuestions(Array.isArray(quizData.questions) ? quizData.questions : []);
    } catch (error) {
      console.error("Failed to load questions:", error);
      toast.error(error.response?.data?.message || "Không thể tải câu hỏi");
    } finally {
      setLoading(false);
    }
  }, [quizId]);

  useEffect(() => {
    loadQuiz();
  }, [loadQuiz]);

  const openModal = (question = null) => {
    setEditingQuestion(question);
    setFormData(toFormQuestion(question));
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingQuestion(null);
    setFormData(emptyQuestion);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleTypeChange = (event) => {
    const type = event.target.value;
    setFormData((prev) => ({
      ...prev,
      type,
      options: isChoiceType(type) ? prev.options : ["", "", "", ""],
      correctAnswers: [],
      correctAnswerText: type === "TRUE_FALSE" ? "true" : "",
    }));
  };

  const handleOptionChange = (index, value) => {
    setFormData((prev) => {
      const nextOptions = [...prev.options];
      const previousValue = nextOptions[index];
      nextOptions[index] = value;

      const nextAnswers = prev.correctAnswers.map((answer) =>
        answer === previousValue ? value : answer,
      );

      return {
        ...prev,
        options: nextOptions,
        correctAnswers: nextAnswers.filter((answer) => answer.trim()),
      };
    });
  };

  const addOption = () => {
    setFormData((prev) => ({ ...prev, options: [...prev.options, ""] }));
  };

  const removeOption = (index) => {
    setFormData((prev) => {
      const removed = prev.options[index];
      const options = prev.options.filter((_, optionIndex) => optionIndex !== index);
      return {
        ...prev,
        options,
        correctAnswers: prev.correctAnswers.filter((answer) => answer !== removed),
      };
    });
  };

  const setSingleCorrectAnswer = (answer) => {
    setFormData((prev) => ({ ...prev, correctAnswers: [answer] }));
  };

  const toggleMultipleCorrectAnswer = (answer) => {
    setFormData((prev) => {
      const exists = prev.correctAnswers.includes(answer);
      return {
        ...prev,
        correctAnswers: exists
          ? prev.correctAnswers.filter((item) => item !== answer)
          : [...prev.correctAnswers, answer],
      };
    });
  };

  const normalizePayload = () => {
    const payload = {
      questionText: formData.questionText.trim(),
      type: formData.type,
      explanation: formData.explanation.trim(),
      points: Number(formData.points),
    };

    if (formData.type === "TRUE_FALSE") {
      payload.options = "true,false";
      payload.correctAnswer = formData.correctAnswerText;
    } else if (formData.type === "FILL_BLANK") {
      payload.options = null;
      payload.correctAnswer = formData.correctAnswerText.trim();
    } else {
      payload.options = cleanOptions.join(",");
      payload.correctAnswer = formData.correctAnswers.join(",");
    }

    return payload;
  };

  const validate = () => {
    if (!formData.questionText.trim()) {
      toast.error("Vui lòng nhập nội dung câu hỏi");
      return false;
    }

    if (!Number.isInteger(Number(formData.points)) || Number(formData.points) < 1) {
      toast.error("Điểm câu hỏi phải lớn hơn hoặc bằng 1");
      return false;
    }

    if (isChoiceType(formData.type)) {
      if (cleanOptions.length < 2) {
        toast.error("Câu hỏi lựa chọn cần ít nhất 2 đáp án");
        return false;
      }

      const uniqueOptions = new Set(cleanOptions.map((option) => option.toLowerCase()));
      if (uniqueOptions.size !== cleanOptions.length) {
        toast.error("Các đáp án lựa chọn không được trùng nhau");
        return false;
      }

      const validCorrectAnswers = formData.correctAnswers.filter((answer) =>
        cleanOptions.includes(answer),
      );

      if (validCorrectAnswers.length === 0) {
        toast.error("Vui lòng chọn đáp án đúng");
        return false;
      }

      if (formData.type === "SINGLE_CHOICE" && validCorrectAnswers.length !== 1) {
        toast.error("Câu hỏi chọn một chỉ được có một đáp án đúng");
        return false;
      }
    } else if (!formData.correctAnswerText.trim()) {
      toast.error("Vui lòng nhập đáp án đúng");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      const payload = normalizePayload();
      if (editingQuestion) {
        await quizService.updateQuestion(editingQuestion.id, payload);
        toast.success("Cập nhật câu hỏi thành công");
      } else {
        await quizService.addQuestion(quizId, payload);
        toast.success("Tạo câu hỏi thành công");
      }
      closeModal();
      loadQuiz();
    } catch (error) {
      console.error("Error saving question:", error);
      toast.error(error.response?.data?.message || "Không thể lưu câu hỏi");
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm("Bạn chắc chắn muốn xóa câu hỏi này?")) return;

    try {
      setDeleting(questionId);
      await quizService.deleteQuestion(questionId);
      toast.success("Xóa câu hỏi thành công");
      loadQuiz();
    } catch (error) {
      console.error("Error deleting question:", error);
      toast.error(error.response?.data?.message || "Không thể xóa câu hỏi");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="quiz-management">
      <div className="quiz-header">
        <button
          className="btn-back"
          onClick={() => navigate(`/instructor/courses/${courseId}/quiz`)}
        >
          <FaArrowLeft /> Quay lại
        </button>
        <h1>Câu hỏi Quiz - {quiz?.title}</h1>
      </div>

      <div className="quiz-actions">
        <button className="btn-create" onClick={() => openModal()}>
          <FaPlus /> Thêm câu hỏi
        </button>
      </div>

      <div className="quizzes-list">
        {questions.length > 0 ? (
          <table className="quizzes-table">
            <thead>
              <tr>
                <th>Câu hỏi</th>
                <th>Loại</th>
                <th>Đáp án đúng</th>
                <th>Điểm</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {questions.map((question) => (
                <tr key={question.id}>
                  <td>
                    <div className="quiz-title">
                      <strong>{question.questionText}</strong>
                      {question.options && (
                        <small>{splitOptions(question.options).join(" | ")}</small>
                      )}
                      {question.explanation && <small>{question.explanation}</small>}
                    </div>
                  </td>
                  <td>
                    {QUESTION_TYPES.find((type) => type.value === question.type)
                      ?.label || question.type}
                  </td>
                  <td>{question.correctAnswer || "-"}</td>
                  <td className="center">{question.points}</td>
                  <td className="actions">
                    <button
                      className="btn-edit"
                      title="Chỉnh sửa"
                      onClick={() => openModal(question)}
                    >
                      <FaPen />
                    </button>
                    <button
                      className="btn-delete"
                      title="Xóa"
                      disabled={deleting === question.id}
                      onClick={() => handleDelete(question.id)}
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
            <p>Chưa có câu hỏi nào cho quiz này.</p>
            <button className="btn-create" onClick={() => openModal()}>
              <FaPlus /> Thêm câu hỏi
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div
            className="modal-content question-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h2>{editingQuestion ? "Chỉnh sửa câu hỏi" : "Thêm câu hỏi"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nội dung câu hỏi *</label>
                <textarea
                  name="questionText"
                  value={formData.questionText}
                  onChange={handleInputChange}
                  rows="4"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Loại câu hỏi *</label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleTypeChange}
                  >
                    {QUESTION_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Điểm *</label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>
              </div>

              {isChoiceType(formData.type) && (
                <div className="form-group">
                  <label>Đáp án lựa chọn *</label>
                  <div className="question-options">
                    {formData.options.map((option, index) => {
                      const trimmedOption = option.trim();
                      const checked = formData.correctAnswers.includes(trimmedOption);

                      return (
                        <div className="question-option-row" key={index}>
                          <input
                            className="answer-marker"
                            type={
                              formData.type === "SINGLE_CHOICE"
                                ? "radio"
                                : "checkbox"
                            }
                            name="correctAnswers"
                            checked={checked}
                            disabled={!trimmedOption}
                            onChange={() =>
                              formData.type === "SINGLE_CHOICE"
                                ? setSingleCorrectAnswer(trimmedOption)
                                : toggleMultipleCorrectAnswer(trimmedOption)
                            }
                          />
                          <input
                            type="text"
                            value={option}
                            onChange={(event) =>
                              handleOptionChange(index, event.target.value)
                            }
                            placeholder={`Đáp án ${index + 1}`}
                          />
                          <button
                            type="button"
                            className="btn-delete option-remove"
                            title="Xóa đáp án"
                            onClick={() => removeOption(index)}
                            disabled={formData.options.length <= 2}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    type="button"
                    className="btn-create btn-add-option"
                    onClick={addOption}
                  >
                    <FaPlus /> Thêm đáp án
                  </button>
                </div>
              )}

              {formData.type === "TRUE_FALSE" && (
                <div className="form-group">
                  <label>Đáp án đúng *</label>
                  <select
                    name="correctAnswerText"
                    value={formData.correctAnswerText}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="true">Đúng</option>
                    <option value="false">Sai</option>
                  </select>
                </div>
              )}

              {formData.type === "FILL_BLANK" && (
                <div className="form-group">
                  <label>Đáp án đúng *</label>
                  <input
                    type="text"
                    name="correctAnswerText"
                    value={formData.correctAnswerText}
                    onChange={handleInputChange}
                    placeholder={selectedType?.label}
                    required
                  />
                </div>
              )}

              <div className="form-group">
                <label>Giải thích</label>
                <textarea
                  name="explanation"
                  value={formData.explanation}
                  onChange={handleInputChange}
                  rows="3"
                />
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={closeModal}>
                  <FaTimes /> Hủy
                </button>
                <button type="submit" className="btn-save">
                  <FaCheck /> {editingQuestion ? "Cập nhật" : "Tạo"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionManagement;
