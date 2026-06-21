import api from './api';

/**
 * Quiz Service - Manage quizzes and quiz attempts
 */
export const quizService = {
  // ============ QUIZ MANAGEMENT (INSTRUCTOR) ============

  /**
   * Create quiz for a course
   * @param {string} courseId - Course ID
   * @param {object} data - Quiz data { lessonId?, title, description?, timeLimitMinutes?, passScore, maxAttempts?, shuffleQuestions? }
   * @returns {Promise} Response with QuizResponseDto
   */
  createQuiz: async (courseId, data) => {
    try {
      console.log('[quizService.createQuiz] Creating quiz for course:', courseId);
      const normalizeUuid = (value) => {
        if (value === null || value === undefined) return null;
        const v = String(value).trim();
        if (!v || v.toLowerCase() === "null" || v.toLowerCase() === "undefined") return null;
        return v;
      };
      const response = await api.post(`/api/v1/courses/${courseId}/quizzes`, {
        chapterId: normalizeUuid(data.chapterId),
        lessonId: normalizeUuid(data.lessonId),
        title: data.title,
        description: data.description || '',
        timeLimitMinutes: data.timeLimitMinutes || null,
        passScore: data.passScore,
        maxAttempts: data.maxAttempts || null,
        shuffleQuestions: data.shuffleQuestions || false,
      });
      const quiz = response.data?.data || response.data;
      console.log('[quizService.createQuiz] Success:', quiz.id);
      return { data: quiz };
    } catch (error) {
      console.error('[quizService.createQuiz] Error:', error);
      throw error;
    }
  },

  /**
   * Get all quizzes for a course
   * @param {string} courseId - Course ID
   * @returns {Promise} Response with list of QuizResponseDto
   */
  getCourseQuizzes: async (courseId) => {
    try {
      console.log('[quizService.getCourseQuizzes] Fetching quizzes for course:', courseId);
      const response = await api.get(`/api/v1/courses/${courseId}/quizzes`);
      const quizzes = response.data?.data || response.data || [];
      console.log('[quizService.getCourseQuizzes] Success, found:', quizzes.length);
      return { data: quizzes };
    } catch (error) {
      console.error('[quizService.getCourseQuizzes] Error:', error);
      throw error;
    }
  },

  /**
   * Get chapters and lessons for quiz selection
   * @param {string} courseId - Course ID
   * @returns {Promise} Response with chapter/lesson hierarchy
   */
  getQuizSelection: async (courseId) => {
    try {
      console.log('[quizService.getQuizSelection] Fetching quiz selection tree for course:', courseId);
      const response = await api.get(`/api/v1/courses/${courseId}/quiz-selection`);
      const selection = response.data?.data || response.data || [];
      console.log('[quizService.getQuizSelection] Success, found chapters:', selection.length);
      return { data: selection };
    } catch (error) {
      console.error('[quizService.getQuizSelection] Error:', error);
      throw error;
    }
  },

  /**
   * Get quiz detail
   * @param {string} quizId - Quiz ID
   * @returns {Promise} Response with QuizResponseDto
   */
  getQuiz: async (quizId) => {
    try {
      console.log('[quizService.getQuiz] Fetching quiz:', quizId);
      const response = await api.get(`/api/v1/quizzes/${quizId}`);
      const quiz = response.data?.data || response.data;
      console.log('[quizService.getQuiz] Success');
      return { data: quiz };
    } catch (error) {
      console.error('[quizService.getQuiz] Error:', error);
      throw error;
    }
  },

  /**
   * Update quiz (instructor only)
   * @param {string} quizId - Quiz ID
   * @param {object} data - Updated quiz data { title, description?, timeLimitMinutes?, passScore, maxAttempts?, shuffleQuestions? }
   * @returns {Promise} Response with QuizResponseDto
   */
  updateQuiz: async (quizId, data) => {
    try {
      console.log('[quizService.updateQuiz] Updating quiz:', quizId);
      const response = await api.put(`/api/v1/quizzes/${quizId}`, {
        title: data.title,
        description: data.description || '',
        timeLimitMinutes: data.timeLimitMinutes || null,
        passScore: data.passScore,
        maxAttempts: data.maxAttempts || null,
        shuffleQuestions: data.shuffleQuestions || false,
      });
      const quiz = response.data?.data || response.data;
      console.log('[quizService.updateQuiz] Success');
      return { data: quiz };
    } catch (error) {
      console.error('[quizService.updateQuiz] Error:', error);
      throw error;
    }
  },

  /**
   * Delete quiz (instructor only)
   * @param {string} quizId - Quiz ID
   * @returns {Promise} Response
   */
  deleteQuiz: async (quizId) => {
    try {
      console.log('[quizService.deleteQuiz] Deleting quiz:', quizId);
      const response = await api.delete(`/api/v1/quizzes/${quizId}`);
      console.log('[quizService.deleteQuiz] Success');
      return { data: response.data?.data || response.data || { message: 'Quiz deleted successfully' } };
    } catch (error) {
      console.error('[quizService.deleteQuiz] Error:', error);
      throw error;
    }
  },

  // ============ QUESTION MANAGEMENT (INSTRUCTOR) ============

  /**
   * Add question to quiz
   * @param {string} quizId - Quiz ID
   * @param {object} data - Question data { questionText, type, options?, correctAnswer, explanation?, points }
   * @returns {Promise} Response with QuestionResponseDto
   */
  addQuestion: async (quizId, data) => {
    try {
      console.log('[quizService.addQuestion] Adding question to quiz:', quizId);
      const response = await api.post(`/api/v1/quizzes/${quizId}/questions`, {
        questionText: data.questionText,
        type: data.type, // MULTIPLE_CHOICE, SHORT_ANSWER, etc
        options: data.options || null, // For multiple choice: "Option1,Option2,Option3"
        correctAnswer: data.correctAnswer,
        explanation: data.explanation || '',
        points: data.points,
      });
      const question = response.data?.data || response.data;
      console.log('[quizService.addQuestion] Success:', question.id);
      return { data: question };
    } catch (error) {
      console.error('[quizService.addQuestion] Error:', error);
      throw error;
    }
  },

  /**
   * Update question
   * @param {string} questionId - Question ID
   * @param {object} data - Updated question data { questionText, type, options?, correctAnswer, explanation?, points }
   * @returns {Promise} Response with QuestionResponseDto
   */
  updateQuestion: async (questionId, data) => {
    try {
      console.log('[quizService.updateQuestion] Updating question:', questionId);
      const response = await api.put(`/api/v1/quizzes/questions/${questionId}`, {
        questionText: data.questionText,
        type: data.type,
        options: data.options || null,
        correctAnswer: data.correctAnswer,
        explanation: data.explanation || '',
        points: data.points,
      });
      const question = response.data?.data || response.data;
      console.log('[quizService.updateQuestion] Success');
      return { data: question };
    } catch (error) {
      console.error('[quizService.updateQuestion] Error:', error);
      throw error;
    }
  },

  /**
   * Delete question
   * @param {string} questionId - Question ID
   * @returns {Promise} Response
   */
  deleteQuestion: async (questionId) => {
    try {
      console.log('[quizService.deleteQuestion] Deleting question:', questionId);
      const response = await api.delete(`/api/v1/quizzes/questions/${questionId}`);
      console.log('[quizService.deleteQuestion] Success');
      return { data: response.data?.data || response.data || { message: 'Question deleted successfully' } };
    } catch (error) {
      console.error('[quizService.deleteQuestion] Error:', error);
      throw error;
    }
  },

  // ============ QUIZ ATTEMPTS (STUDENT) ============

  /**
   * Submit quiz attempt
   * @param {string} quizId - Quiz ID
   * @param {object} data - Attempt data { answers: [{ questionId, selectedAnswer }], timeSpent? }
   * @returns {Promise} Response with QuizAttemptResponseDto
   */
  submitAttempt: async (quizId, data) => {
    try {
      console.log('[quizService.submitAttempt] Submitting quiz attempt:', quizId);
      const response = await api.post(`/api/v1/quizzes/${quizId}/attempts`, {
        answers: data.answers || [], // Array of { questionId, selectedAnswer }
        timeSpent: data.timeSpent || 0, // In seconds
      });
      let attempt = response.data?.data || response.data;
      console.log('[quizService.submitAttempt] Success, score:', attempt.score);
      
      // Ensure 'passed' field exists
      if (attempt && !("passed" in attempt) && attempt.score !== undefined && attempt.totalPoints !== undefined) {
        attempt.passed = attempt.score >= (attempt.totalPoints * 0.5);
        console.log('[quizService.submitAttempt] Calculated passed:', attempt.passed);
      }
      
      return { data: attempt };
    } catch (error) {
      console.error('[quizService.submitAttempt] Error:', error);
      throw error;
    }
  },

  /**
   * Get my quiz attempts for a quiz
   * @param {string} quizId - Quiz ID
   * @returns {Promise} Response with list of QuizAttemptResponseDto
   */
  getMyAttempts: async (quizId) => {
    try {
      console.log('[quizService.getMyAttempts] Fetching my attempts for quiz:', quizId);
      const response = await api.get(`/api/v1/quizzes/${quizId}/attempts/my`);
      let attempts = response.data?.data || response.data || [];
      
      // Ensure each attempt has 'passed' field
      attempts = attempts.map(attempt => {
        if (!("passed" in attempt) && attempt.score !== undefined && attempt.totalPoints !== undefined) {
          // Calculate passed as (score >= totalPoints * passScore / 100) if totalPoints exists
          // Or just assume 50% is pass score if not specified
          attempt.passed = attempt.score >= (attempt.totalPoints * 0.5);
        }
        return attempt;
      });
      
      console.log('[quizService.getMyAttempts] Success, found:', attempts.length);
      return { data: attempts };
    } catch (error) {
      console.error('[quizService.getMyAttempts] Error:', error);
      throw error;
    }
  },

  // ============ HELPER METHODS ============

  /**
   * Check if student passed quiz
   * @param {object} attempts - List of attempts
   * @returns {boolean} Whether any attempt was passed
   */
  isPassed: (attempts) => {
    return attempts && Array.isArray(attempts) && attempts.some(attempt => attempt.passed === true);
  },

  /**
   * Get best attempt score
   * @param {object} attempts - List of attempts
   * @returns {number} Best score or 0
   */
  getBestScore: (attempts) => {
    if (!attempts || !Array.isArray(attempts) || attempts.length === 0) {
      return 0;
    }
    return Math.max(...attempts.map(a => a.score?.toNumber?.() || a.score || 0));
  },

  /**
   * Format quiz time limit
   * @param {number} minutes - Time limit in minutes
   * @returns {string} Formatted time string
   */
  formatTimeLimit: (minutes) => {
    if (!minutes) return 'No limit';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  },

  /**
   * Format elapsed time
   * @param {number} seconds - Elapsed time in seconds
   * @returns {string} Formatted time string
   */
  formatElapsedTime: (seconds) => {
    if (!seconds || seconds === 0) return '0s';
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (minutes < 60) {
      return secs > 0 ? `${minutes}m ${secs}s` : `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  },

  /**
   * Calculate progress percentage
   * @param {number} earnedPoints - Earned points
   * @param {number} totalPoints - Total points
   * @returns {number} Progress percentage
   */
  calculateProgress: (earnedPoints, totalPoints) => {
    if (totalPoints === 0) return 0;
    return Math.round((earnedPoints / totalPoints) * 100);
  },
};
