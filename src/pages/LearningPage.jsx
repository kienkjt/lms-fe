import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import api from "../services/api";
import { enrollmentService } from "../services/enrollmentService";
import { chapterService } from "../services/chapterService";
import { lessonService } from "../services/lessonService";
import { noteService } from "../services/noteService";
import { quizService } from "../services/quizService";
import { ROUTES } from "../utils/constants";
import { formatDuration } from "../utils/helpers";
import VideoPlayer from "../components/common/VideoPlayer";
import Loading from "../components/common/Loading";
import {
  FaCheck,
  FaBookmark,
  FaArrowLeft,
  FaChevronDown,
  FaChevronUp,
  FaQuestionCircle,
  FaTimes,
  FaTrash,
  FaStickyNote,
  FaPlayCircle,
} from "react-icons/fa";
import "./LearningPage.css";

const splitOptions = (options) => {
  if (Array.isArray(options)) return options.map(String).filter(Boolean);
  return String(options || "")
    .split(",")
    .map((option) => option.trim())
    .filter(Boolean);
};

const isChoiceQuestion = (type) =>
  type === "SINGLE_CHOICE" || type === "MULTIPLE_CHOICE";

const isVideoLesson = (lesson) =>
  String(lesson?.type || "").toUpperCase() === "VIDEO";

const isQuizItem = (item) => item?.itemType === "QUIZ";

const createQuizItem = (quiz) => ({
  ...quiz,
  id: `quiz-${quiz.id}`,
  quizId: quiz.id,
  itemType: "QUIZ",
  type: "QUIZ",
  duration: quiz.timeLimitMinutes ? quiz.timeLimitMinutes * 60 : 0,
  quizData: quiz,
});

const getQuizSource = (item) => item?.quizData || item;

const mergeQuizzesIntoChapters = (chapters, quizzes, enrolled) => {
  if (!enrolled || !Array.isArray(quizzes) || quizzes.length === 0) {
    return chapters;
  }

  const quizzesByLesson = new Map();

  quizzes.forEach((quiz) => {
    if (!quiz.lessonId) return;
    const key = String(quiz.lessonId);
    quizzesByLesson.set(key, [...(quizzesByLesson.get(key) || []), quiz]);
  });

  const merged = chapters.map((chapter) => ({
    ...chapter,
    lessons: (chapter.lessons || []).flatMap((lesson) => [
      lesson,
      ...(quizzesByLesson.get(String(lesson.id)) || []).map(createQuizItem),
    ]),
  }));

  const placedQuizIds = new Set(
    merged
      .flatMap((chapter) => chapter.lessons || [])
      .filter(isQuizItem)
      .map((quiz) => String(quiz.quizId)),
  );
  const remainingQuizzes = quizzes.filter(
    (quiz) => !placedQuizIds.has(String(quiz.id)),
  );

  if (remainingQuizzes.length === 0) return merged;
  if (merged.length === 0) {
    return [
      {
        id: "course-quizzes",
        title: "Bai kiem tra",
        lessons: remainingQuizzes.map(createQuizItem),
      },
    ];
  }

  const lastIndex = merged.length - 1;
  return merged.map((chapter, index) =>
    index === lastIndex
      ? {
          ...chapter,
          lessons: [
            ...(chapter.lessons || []),
            ...remainingQuizzes.map(createQuizItem),
          ],
        }
      : chapter,
  );
};

const isPreviewLesson = (lesson) =>
  Boolean(lesson?.freePreview ?? lesson?.isFreePreview);

const canViewLesson = (lesson, enrolled) =>
  isQuizItem(lesson)
    ? enrolled
    : enrolled || (isVideoLesson(lesson) && isPreviewLesson(lesson));

const getPreviewLesson = (chapters) =>
  chapters
    .flatMap((chapter) => chapter.lessons || [])
    .find(
      (lesson) =>
        isVideoLesson(lesson) && lesson.videoUrl && isPreviewLesson(lesson),
    ) || null;

const getLessonVideoUrl = (lesson) =>
  lesson?.videoUrl ||
  lesson?.video_url ||
  lesson?.url ||
  lesson?.video ||
  lesson?.contentUrl ||
  "";

const getCompletedLessonIdsFromProgress = (progressData, chapters = []) => {
  if (!progressData) return [];

  // If completedLessonIds is provided, use it
  if (Array.isArray(progressData.completedLessonIds)) {
    return progressData.completedLessonIds.filter(Boolean);
  }

  // If lessons array with isCompleted flag is provided, use it
  if (Array.isArray(progressData.lessons)) {
    return progressData.lessons
      .filter((lesson) => lesson?.isCompleted)
      .map((lesson) => lesson?.id)
      .filter(Boolean);
  }

  // If only completedLessons count is provided, mark the first N lessons as completed
  if (
    typeof progressData.completedLessons === "number" &&
    progressData.completedLessons > 0
  ) {
    const allLessons = chapters
      .flatMap((chapter) => chapter.lessons || [])
      .filter(Boolean);
    return allLessons
      .slice(0, progressData.completedLessons)
      .map((lesson) => lesson.id)
      .filter(Boolean);
  }

  return [];
};

const getQuizResultScore = (result) => {
  if (!result) return null;

  const candidates = [
    result.score,
    result.points,
    result.obtainedScore,
    result.totalScore,
    result.rawScore,
    result.percentScore,
    result.percentage,
  ];

  const value = candidates.find(
    (candidate) =>
      candidate !== null && candidate !== undefined && candidate !== "",
  );

  if (value === null || value === undefined || value === "") {
    return null;
  }

  if (typeof value === "number") return value;

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : value;
};

const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [expandedChapters, setExpandedChapters] = useState({});
  const [completedLessons, setCompletedLessons] = useState(new Set());
  const [isEnrolled, setIsEnrolled] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState("");
  const [loadingNotes, setLoadingNotes] = useState(false);
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [completing, setCompleting] = useState(false);
  const [quizzes, setQuizzes] = useState([]);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizLoading, setQuizLoading] = useState(false);
  const [quizSubmitting, setQuizSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [passedQuizIds, setPassedQuizIds] = useState(new Set());

  // Load course, chapters, and enrollment data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        let loadedProgress = null;

        // Load course
        const courseRes = await api.get(`/v1/courses/${courseId}`);
        const courseData = courseRes.data?.data || courseRes.data;
        setCourse(courseData);

        let enrolled = false;
        try {
          const enrollRes = await enrollmentService.getEnrollment(courseId);
          enrolled = Boolean(enrollRes.data);
          setIsEnrolled(enrolled);

          if (enrolled) {
            const progressRes = await enrollmentService.getProgress(courseId);
            loadedProgress = progressRes.data || null;
            setProgress(loadedProgress);
            // Will process completedLessons after chapters are loaded
          }
        } catch {
          setIsEnrolled(false);
          setProgress(null);
        }

        // Load chapters
        let chaptersWithLessons = [];
        try {
          const chaptersRes =
            await chapterService.getChaptersByCourse(courseId);
          const chaptersData = chaptersRes.data || [];
          chaptersWithLessons = await Promise.all(
            chaptersData.map(async (chapter) => {
              if (
                Array.isArray(chapter.lessons) &&
                chapter.lessons.length > 0
              ) {
                return chapter;
              }

              try {
                const lessonsRes = await lessonService.getLessonsByChapter(
                  courseId,
                  chapter.id,
                );
                return {
                  ...chapter,
                  lessons: Array.isArray(lessonsRes.data)
                    ? lessonsRes.data
                    : [],
                };
              } catch {
                return {
                  ...chapter,
                  lessons: Array.isArray(chapter.lessons)
                    ? chapter.lessons
                    : [],
                };
              }
            }),
          );

          setChapters(chaptersWithLessons);

          if (enrolled && loadedProgress) {
            const completedIds = getCompletedLessonIdsFromProgress(
              loadedProgress,
              chaptersWithLessons,
            );
            setCompletedLessons(new Set(completedIds));
          }

          const expanded = {};
          chaptersWithLessons.forEach((_, idx) => {
            expanded[idx] = idx === 0;
          });
          setExpandedChapters(expanded);

          const previewLesson = getPreviewLesson(chaptersWithLessons);
          if (!enrolled) {
            if (previewLesson) {
              setPreviewMode(true);
              setCurrentLesson(previewLesson);
              toast.info("Bạn chưa đăng ký khóa học này");
              setTimeout(() => {
                navigate(
                  `${ROUTES.COURSE_DETAIL}/${courseData.id || courseId}`,
                );
              }, 1500);
              return;
            }
          } else if (
            chaptersWithLessons.length > 0 &&
            chaptersWithLessons[0]?.lessons?.length > 0
          ) {
            setCurrentLesson(chaptersWithLessons[0].lessons[0]);
          }
        } catch {
          console.error("Error loading chapters");
        }

        try {
          const quizzesRes = await quizService.getCourseQuizzes(courseId);
          const loadedQuizzes = Array.isArray(quizzesRes.data)
            ? quizzesRes.data
            : [];
          setQuizzes(loadedQuizzes);

          if (enrolled && loadedQuizzes.length > 0) {
            const attemptsByQuiz = await Promise.all(
              loadedQuizzes.map(async (quiz) => {
                try {
                  const attemptsRes = await quizService.getMyAttempts(quiz.id);
                  return {
                    quizId: quiz.id,
                    attempts: Array.isArray(attemptsRes.data)
                      ? attemptsRes.data
                      : [],
                  };
                } catch {
                  return { quizId: quiz.id, attempts: [] };
                }
              }),
            );
            const passedIds = attemptsByQuiz
              .filter((entry) => quizService.isPassed(entry.attempts))
              .map((entry) => entry.quizId);
            setPassedQuizIds(new Set(passedIds));
          } else {
            setPassedQuizIds(new Set());
          }
        } catch {
          console.error("Error loading quizzes");
          setQuizzes([]);
          setPassedQuizIds(new Set());
        }
      } catch {
        toast.error("Không thể tải khóa học");
        navigate(ROUTES.STUDENT_DASHBOARD);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [courseId, navigate]);

  // Handle lesson completion
  const handleCompleteLesson = async () => {
    if (!currentLesson || completing || !isEnrolled) {
      if (!isEnrolled) {
        toast.info("Đăng ký khóa học để hoàn thành bài học");
      }
      return;
    }

    try {
      setCompleting(true);
      await enrollmentService.completeLesson(courseId, currentLesson.id);

      // Update completed lessons set
      setCompletedLessons(new Set([...completedLessons, currentLesson.id]));

      // Refresh progress
      const progressRes = await enrollmentService.getProgress(courseId);
      const progressData = progressRes.data;
      setProgress(progressData);
      const completedIds = getCompletedLessonIdsFromProgress(
        progressData,
        chapters,
      );
      if (completedIds.length > 0) {
        setCompletedLessons(new Set(completedIds));
      }
      toast.success("Bài học đã hoàn thành!");
    } catch {
      toast.error("Lỗi khi hoàn thành bài học");
    } finally {
      setCompleting(false);
    }
  };

  // Toggle chapter expansion
  const toggleChapter = (chapterIdx) => {
    setExpandedChapters((prev) => ({
      ...prev,
      [chapterIdx]: !prev[chapterIdx],
    }));
  };

  const getVisibleQuizzes = () => {
    if (!currentLesson || !isEnrolled || isQuizItem(currentLesson)) return [];
    const lessonQuizzes = quizzes.filter(
      (quiz) => quiz.lessonId && quiz.lessonId === currentLesson.id,
    );
    return lessonQuizzes;
  };

  const isLessonCompleted = useCallback(
    (lesson) =>
      isQuizItem(lesson)
        ? passedQuizIds.has(lesson.quizId || lesson.id)
        : completedLessons.has(lesson.id),
    [completedLessons, passedQuizIds],
  );

  const getVisibleChapters = () => {
    const chaptersWithQuizzes = mergeQuizzesIntoChapters(
      chapters,
      quizzes,
      isEnrolled,
    );

    if (!previewMode) return chaptersWithQuizzes;
    return chaptersWithQuizzes
      .map((chapter) => ({
        ...chapter,
        lessons: (chapter.lessons || []).filter((lesson) =>
          canViewLesson(lesson, isEnrolled),
        ),
      }))
      .filter((chapter) => (chapter.lessons || []).length > 0);
  };

  const openQuiz = async (quiz) => {
    try {
      setQuizModalOpen(true);
      setQuizLoading(true);
      setQuizResult(null);
      setQuizAnswers({});

      const source = getQuizSource(quiz);
      const response = await quizService.getQuiz(source.id || source.quizId);
      setSelectedQuiz(response.data || source);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải quiz");
      toast.error(error.response?.data?.message || "Không thể tải quiz");
      setQuizModalOpen(false);
    } finally {
      setQuizLoading(false);
    }
  };

  const closeQuiz = () => {
    setQuizModalOpen(false);
    setSelectedQuiz(null);
    setQuizAnswers({});
    setQuizResult(null);
  };

  const setSingleAnswer = (questionId, answer) => {
    setQuizAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const toggleMultipleAnswer = (questionId, answer) => {
    setQuizAnswers((prev) => {
      const currentAnswers = Array.isArray(prev[questionId])
        ? prev[questionId]
        : [];
      const exists = currentAnswers.includes(answer);
      return {
        ...prev,
        [questionId]: exists
          ? currentAnswers.filter((item) => item !== answer)
          : [...currentAnswers, answer],
      };
    });
  };

  const submitQuiz = async (event) => {
    event.preventDefault();
    const questions = selectedQuiz?.questions || [];

    const missingAnswer = questions.some((question) => {
      const answer = quizAnswers[question.id];
      return Array.isArray(answer)
        ? answer.length === 0
        : !String(answer || "").trim();
    });

    if (missingAnswer) {
      toast.error("Vui lòng trả lời tất cả câu hỏi");
      return;
    }

    try {
      setQuizSubmitting(true);
      const answers = questions.map((question) => {
        const answer = quizAnswers[question.id];
        return {
          questionId: question.id,
          selectedAnswer: Array.isArray(answer) ? answer.join(",") : answer,
        };
      });

      const response = await quizService.submitAttempt(selectedQuiz.id, {
        answers,
      });
      const attempt = response.data || null;

      // Log để debug response structure
      console.log("[submitQuiz] Response from backend:", attempt);

      // Nếu backend không trả về 'passed', tính toán dựa trên score
      if (attempt && !("passed" in attempt)) {
        const passScore = parseFloat(selectedQuiz.passScore) || 0;
        const score = parseFloat(attempt.score) || 0;
        attempt.passed = score >= passScore;
        console.log(
          "[submitQuiz] Calculated passed:",
          attempt.passed,
          `(score: ${score}, passScore: ${passScore})`,
        );
      }

      setQuizResult(attempt);

      if (attempt?.passed) {
        setPassedQuizIds((prev) => new Set([...prev, selectedQuiz.id]));
      }

      // Refresh progress to sync with backend
      try {
        const progressRes = await enrollmentService.getProgress(courseId);
        const progressData = progressRes.data;
        setProgress(progressData);
        const completedIds = getCompletedLessonIdsFromProgress(
          progressData,
          chapters,
        );
        setCompletedLessons(new Set(completedIds));
      } catch (err) {
        console.warn("[submitQuiz] Could not refresh progress:", err.message);
      }

      toast.success("Đã nộp bài quiz");
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể nộp bài quiz");
    } finally {
      setQuizSubmitting(false);
    }
  };

  // Load notes for current lesson
  const loadNotes = useCallback(async () => {
    if (!currentLesson || !isEnrolled || isQuizItem(currentLesson)) return;

    try {
      setLoadingNotes(true);
      const response = await noteService.getByCourse(courseId, {
        page: 1,
        size: 100,
      });
      const allNotes = Array.isArray(response.data)
        ? response.data
        : response.data?.content || [];
      const lessonNotes = allNotes.filter(
        (note) => note.lessonId === currentLesson.id,
      );
      setNotes(lessonNotes);
    } catch (error) {
      console.error("Error loading notes:", error);
    } finally {
      setLoadingNotes(false);
    }
  }, [courseId, currentLesson, isEnrolled]);

  // Create new note
  const handleCreateNote = async () => {
    if (!newNote.trim()) {
      toast.error("Ghi chú không được để trống");
      return;
    }

    try {
      const response = await noteService.create(courseId, {
        lessonId: currentLesson.id,
        content: newNote,
        videoTimestamp: Math.round(currentVideoTime),
      });
      setNotes([...notes, response.data]);
      setNewNote("");
      toast.success("Ghi chú đã được thêm");
    } catch {
      toast.error("Không thể thêm ghi chú");
    }
  };

  // Delete note
  const handleDeleteNote = async (noteId) => {
    try {
      await noteService.delete(courseId, noteId);
      toast.success("Ghi chú đã được xóa");
    } catch {
      toast.error("Không thể xóa ghi chú");
    }
  };

  // Load notes when lesson changes
  useEffect(() => {
    loadNotes();
  }, [loadNotes]);

  if (loading) {
    return <Loading />;
  }

  if (!course) {
    return (
      <div style={{ padding: "40px", textAlign: "center" }}>
        Khóa học không tìm thấy
      </div>
    );
  }

  const progressPercentage = progress?.progressPercent || 0;
  const visibleQuizzes = getVisibleQuizzes();
  const visibleChapters = getVisibleChapters();
  const visibleLessonCount = visibleChapters.reduce(
    (sum, ch) => sum + (ch.lessons?.length || 0),
    0,
  );

  return (
    <div className="learning-page">
      {/* Header */}
      <div className="learning-header">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="btn-sidebar-toggle"
          title={sidebarOpen ? "Ẩn" : "Hiện"}
        >
          {sidebarOpen ? "×" : "☰"}
        </button>
        <div className="header-content">
          <h1>{course.title}</h1>
          {isEnrolled && (
            <div className="progress-info">
              <div className="progress-bar-small">
                <div
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <span className="progress-text">
                {progressPercentage}% hoàn thành
              </span>
            </div>
          )}
        </div>
        <button
          className="btn-back-header btn-exit-learning"
          onClick={() => navigate(ROUTES.STUDENT_COURSES)}
          title="Thoát khỏi trang học"
          aria-label="Thoát khỏi trang học và về khóa học của tôi"
        >
          <FaArrowLeft aria-hidden="true" />
          <span>Thoát</span>
        </button>
      </div>

      <div className="learning-container">
        {/* Sidebar - Course content */}
        {sidebarOpen && (
          <aside className="learning-sidebar">
            <div className="sidebar-header">
              <h3>Nội dung khóa học</h3>
              <span className="lesson-count">{visibleLessonCount} bài</span>
            </div>

            <div className="chapters-list">
              {visibleChapters.map((chapter, chapterIdx) => (
                <div key={chapter.id} className="chapter-item">
                  <button
                    className="chapter-header"
                    onClick={() => toggleChapter(chapterIdx)}
                  >
                    <span className="chapter-icon">
                      {expandedChapters[chapterIdx] ? (
                        <FaChevronUp />
                      ) : (
                        <FaChevronDown />
                      )}
                    </span>
                    <span className="chapter-title">{chapter.title}</span>
                    <span className="lesson-badge">
                      {chapter.lessons?.filter((l) => isLessonCompleted(l))
                        .length || 0}
                      /{chapter.lessons?.length || 0}
                    </span>
                  </button>

                  {expandedChapters[chapterIdx] && (
                    <div className="lessons-list">
                      {chapter.lessons?.map((lesson) => {
                        const viewable = canViewLesson(lesson, isEnrolled);
                        return (
                          <button
                            key={lesson.id}
                            className={`lesson-item ${
                              currentLesson?.id === lesson.id ? "active" : ""
                            } ${isLessonCompleted(lesson) ? "completed" : ""} ${
                              !viewable ? "locked" : ""
                            } ${isQuizItem(lesson) ? "quiz" : ""}`}
                            onClick={() => viewable && setCurrentLesson(lesson)}
                            disabled={!viewable}
                            title={
                              !viewable
                                ? "Chỉ xem trước miễn phí cho bài học này"
                                : ""
                            }
                          >
                            <span className="lesson-icon">
                              {isLessonCompleted(lesson) ? (
                                <FaCheck size={12} />
                              ) : isQuizItem(lesson) ? (
                                <FaQuestionCircle size={13} />
                              ) : (
                                <FaPlayCircle size={13} />
                              )}
                            </span>
                            <span className="lesson-title">{lesson.title}</span>
                            {isQuizItem(lesson) ? (
                              <span className="lesson-kind">
                                {passedQuizIds.has(lesson.quizId || lesson.id)
                                  ? "Đã đạt"
                                  : "Quiz"}
                              </span>
                            ) : Number(lesson.duration) > 0 ? (
                              <span className="lesson-duration">
                                {formatDuration(Number(lesson.duration))}
                              </span>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Main content */}
        <main className="learning-main">
          {currentLesson ? (
            <div className="lesson-content">
              <div className="lesson-header">
                <h2>{currentLesson.title}</h2>
                {Number(currentLesson.duration) > 0 && (
                  <span className="lesson-meta">
                    {formatDuration(Number(currentLesson.duration))}
                  </span>
                )}
              </div>

              {previewMode && (
                <div className="lesson-preview-note">
                  Bạn đang xem video preview miễn phí. Đăng ký khóa học để truy
                  cập toàn bộ nội dung.
                </div>
              )}

              {/* Video player or content */}
              {isQuizItem(currentLesson) ? (
                <div className="quiz-lesson-panel">
                  <div className="quiz-card-icon">
                    <FaQuestionCircle />
                  </div>
                  <div className="quiz-lesson-content">
                    <h3>{currentLesson.title}</h3>
                    {currentLesson.description && (
                      <p>{currentLesson.description}</p>
                    )}
                    <div className="quiz-card-meta">
                      <span>
                        {currentLesson.totalQuestions ||
                          currentLesson.questions?.length ||
                          0}{" "}
                        câu hỏi
                      </span>
                      <span>Điểm đạt {currentLesson.passScore ?? 0}%</span>
                      <span>
                        {currentLesson.timeLimitMinutes
                          ? `${currentLesson.timeLimitMinutes} phút`
                          : "Không giới hạn"}
                      </span>
                    </div>
                  </div>
                  <button
                    className="btn btn-primary"
                    onClick={() => openQuiz(currentLesson)}
                  >
                    Làm quiz
                  </button>
                </div>
              ) : isVideoLesson(currentLesson) ? (
                <VideoPlayer
                  videoUrl={getLessonVideoUrl(currentLesson)}
                  videoTitle={currentLesson.title}
                  onCompleted={handleCompleteLesson}
                  onProgress={setCurrentVideoTime}
                />
              ) : currentLesson.content ? (
                <div className="lesson-document">{currentLesson.content}</div>
              ) : (
                <div className="no-content">
                  <p>Nội dung bài học đang được chuẩn bị</p>
                </div>
              )}

              {/* Actions */}
              {!isQuizItem(currentLesson) && (
                <div className="lesson-actions">
                  <button
                    className={`btn btn-primary ${
                      completedLessons.has(currentLesson.id) ? "completed" : ""
                    }`}
                    onClick={handleCompleteLesson}
                    disabled={
                      !isEnrolled ||
                      completing ||
                      completedLessons.has(currentLesson.id)
                    }
                  >
                    {completedLessons.has(currentLesson.id) ? (
                      <>
                        <FaCheck /> Đã hoàn thành
                      </>
                    ) : (
                      <>
                        <FaCheck /> Đánh dấu hoàn thành
                      </>
                    )}
                  </button>
                  <button className="btn btn-ghost">
                    <FaBookmark /> Đánh dấu
                  </button>
                </div>
              )}

              {/* Description */}
              {!isQuizItem(currentLesson) && currentLesson.description && (
                <div className="lesson-description">
                  <h3>Mô tả bài học</h3>
                  <p>{currentLesson.description}</p>
                </div>
              )}

              {/* Notes */}
              {isEnrolled && !isQuizItem(currentLesson) && (
                <div className="lesson-notes">
                  <div className="lesson-notes-header">
                    <h3>
                      <FaStickyNote /> Ghi chú của bạn
                    </h3>
                  </div>

                  {/* Add note form */}
                  <div className="note-form">
                    <textarea
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Thêm ghi chú cho bài học này..."
                      className="note-input"
                      rows="3"
                    />
                    <button
                      className="btn btn-primary"
                      onClick={handleCreateNote}
                      disabled={!newNote.trim()}
                    >
                      Thêm ghi chú
                    </button>
                  </div>

                  {/* Notes list */}
                  <div className="notes-list">
                    {loadingNotes ? (
                      <p className="text-muted">Đang tải ghi chú...</p>
                    ) : notes.length > 0 ? (
                      notes.map((note) => (
                        <div key={note.id} className="note-item">
                          <div className="note-content">{note.content}</div>
                          <div className="note-footer">
                            <small className="note-date">
                              {new Date(note.createdAt).toLocaleDateString(
                                "vi-VN",
                              )}
                              {note.videoTimestamp > 0 && (
                                <span className="note-timestamp">
                                  {" "}
                                  (Thời gian:{" "}
                                  {Math.floor(note.videoTimestamp / 60)}:
                                  {String(
                                    Math.floor(note.videoTimestamp % 60),
                                  ).padStart(2, "0")}
                                  )
                                </span>
                              )}
                            </small>
                            <button
                              className="btn-delete-note"
                              onClick={() => handleDeleteNote(note.id)}
                              title="Xóa ghi chú"
                            >
                              <FaTrash size={12} />
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted">Chưa có ghi chú nào</p>
                    )}
                  </div>
                </div>
              )}

              {isEnrolled &&
                !isQuizItem(currentLesson) &&
                visibleQuizzes.length > 0 && (
                  <div className="lesson-quizzes">
                    <div className="lesson-quizzes-header">
                      <span>{visibleQuizzes.length} bài</span>
                      <span>{visibleQuizzes.length} bài</span>
                    </div>
                    <div className="quiz-list">
                      {visibleQuizzes.map((quiz) => (
                        <div className="quiz-card" key={quiz.id}>
                          <div className="quiz-card-icon">
                            <FaQuestionCircle />
                          </div>
                          <div className="quiz-card-content">
                            <h4>{quiz.title}</h4>
                            {quiz.description && <p>{quiz.description}</p>}
                            <div className="quiz-card-meta">
                              <span>
                                {quiz.totalQuestions ||
                                  quiz.questions?.length ||
                                  0}{" "}
                                câu hỏi
                              </span>
                              <span>Điểm đạt {quiz.passScore ?? 0}%</span>
                              <span>
                                {quiz.timeLimitMinutes
                                  ? `${quiz.timeLimitMinutes} phút`
                                  : "Không giới hạn"}
                              </span>
                            </div>
                          </div>
                          <button
                            className="btn btn-primary"
                            onClick={() => openQuiz(quiz)}
                          >
                            Làm quiz
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Navigation */}
              <div className="lesson-navigation">
                {/* Find previous lesson */}
                {(() => {
                  let prevLesson = null;
                  for (
                    let i = visibleChapters.length - 1;
                    i >= 0 && !prevLesson;
                    i--
                  ) {
                    const chapter = visibleChapters[i];
                    const lessonIdx = chapter.lessons?.findIndex(
                      (l) => l.id === currentLesson.id,
                    );
                    if (lessonIdx >= 0 && lessonIdx > 0) {
                      prevLesson = chapter.lessons[lessonIdx - 1];
                    } else if (
                      lessonIdx === 0 &&
                      i > 0 &&
                      visibleChapters[i - 1].lessons?.length
                    ) {
                      prevLesson =
                        visibleChapters[i - 1].lessons[
                          visibleChapters[i - 1].lessons.length - 1
                        ];
                    }
                  }
                  return prevLesson ? (
                    <button
                      className="btn btn-outline"
                      onClick={() => setCurrentLesson(prevLesson)}
                    >
                      ← Bài trước
                    </button>
                  ) : null;
                })()}

                {/* Find next lesson */}
                {(() => {
                  let nextLesson = null;
                  for (
                    let i = 0;
                    i < visibleChapters.length && !nextLesson;
                    i++
                  ) {
                    const chapter = visibleChapters[i];
                    const lessonIdx = chapter.lessons?.findIndex(
                      (l) => l.id === currentLesson.id,
                    );
                    if (
                      lessonIdx >= 0 &&
                      lessonIdx < chapter.lessons.length - 1
                    ) {
                      nextLesson = chapter.lessons[lessonIdx + 1];
                    } else if (
                      lessonIdx === chapter.lessons.length - 1 &&
                      i < visibleChapters.length - 1 &&
                      visibleChapters[i + 1].lessons?.length
                    ) {
                      nextLesson = visibleChapters[i + 1].lessons[0];
                    }
                  }
                  return nextLesson ? (
                    <button
                      className="btn btn-primary"
                      onClick={() => setCurrentLesson(nextLesson)}
                    >
                      Bài tiếp →
                    </button>
                  ) : null;
                })()}
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <h3>Chào mừng đến với khóa học!</h3>
              <p>Hãy chọn một bài học từ danh sách bên trái để bắt đầu</p>
            </div>
          )}
        </main>
      </div>

      {quizModalOpen && (
        <div className="quiz-modal-overlay" onClick={closeQuiz}>
          <div
            className="quiz-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="quiz-modal-close"
              type="button"
              title="Đóng"
              onClick={closeQuiz}
            >
              <FaTimes />
            </button>

            {quizLoading ? (
              <Loading />
            ) : (
              <>
                <div className="quiz-modal-header">
                  <h2>{selectedQuiz?.title}</h2>
                  {selectedQuiz?.description && (
                    <p>{selectedQuiz.description}</p>
                  )}
                  <div className="quiz-card-meta">
                    <span>{selectedQuiz?.questions?.length || 0} câu hỏi</span>
                    <span>Điểm đạt {selectedQuiz?.passScore ?? 0}%</span>
                    <span>
                      {selectedQuiz?.timeLimitMinutes
                        ? `${selectedQuiz.timeLimitMinutes} phút`
                        : "Không giới hạn"}
                    </span>
                  </div>
                </div>

                {quizResult ? (
                  <div className="quiz-result">
                    <h3>Kết quả</h3>
                    <p>
                      Điểm:{" "}
                      <strong>{getQuizResultScore(quizResult) ?? 0}</strong>
                    </p>
                    {quizResult.percentage !== undefined &&
                      quizResult.percentage !== null && (
                        <p>
                          Tỷ lệ đúng: <strong>{quizResult.percentage}%</strong>
                        </p>
                      )}
                    {(quizResult.passed !== undefined ||
                      "passed" in quizResult) && (
                      <p>
                        Trạng thái:{" "}
                        <strong
                          style={{
                            color: quizResult.passed ? "#22c55e" : "#ef4444",
                          }}
                        >
                          {quizResult.passed ? "✓ Đạt" : "✗ Chưa đạt"}
                        </strong>
                      </p>
                    )}
                  </div>
                ) : selectedQuiz?.questions?.length > 0 ? (
                  <form className="quiz-form" onSubmit={submitQuiz}>
                    {selectedQuiz.questions.map((question, index) => {
                      const options =
                        question.type === "TRUE_FALSE"
                          ? ["true", "false"]
                          : splitOptions(question.options);

                      return (
                        <div className="quiz-question" key={question.id}>
                          <h4>
                            Câu {index + 1}: {question.questionText}
                          </h4>

                          {isChoiceQuestion(question.type) ||
                          question.type === "TRUE_FALSE" ? (
                            <div className="quiz-options">
                              {options.map((option) => {
                                const checked =
                                  question.type === "MULTIPLE_CHOICE"
                                    ? (quizAnswers[question.id] || []).includes(
                                        option,
                                      )
                                    : quizAnswers[question.id] === option;

                                return (
                                  <label className="quiz-option" key={option}>
                                    <input
                                      type={
                                        question.type === "MULTIPLE_CHOICE"
                                          ? "checkbox"
                                          : "radio"
                                      }
                                      name={question.id}
                                      checked={checked}
                                      onChange={() =>
                                        question.type === "MULTIPLE_CHOICE"
                                          ? toggleMultipleAnswer(
                                              question.id,
                                              option,
                                            )
                                          : setSingleAnswer(question.id, option)
                                      }
                                    />
                                    <span>
                                      {option === "true"
                                        ? "Đúng"
                                        : option === "false"
                                          ? "Sai"
                                          : option}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : (
                            <input
                              className="quiz-text-answer"
                              type="text"
                              value={quizAnswers[question.id] || ""}
                              onChange={(event) =>
                                setSingleAnswer(question.id, event.target.value)
                              }
                              placeholder="Nhập câu trả lời"
                            />
                          )}
                        </div>
                      );
                    })}

                    <div className="quiz-submit-row">
                      <button
                        className="btn btn-primary"
                        type="submit"
                        disabled={quizSubmitting}
                      >
                        {quizSubmitting ? "Đang nộp..." : "Nộp bài"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="no-content">
                    <p>Quiz này chưa có câu hỏi.</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPage;
