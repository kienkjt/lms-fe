import api from './api';

export const noteService = {
  /**
   * Get all notes for a course
   * @param {string} courseId - Course ID
   * @param {object} params - Pagination params { page, size }
   * @returns Response with paginated notes
   */
  getByCourse: async (courseId, params) => {
    try {
      const page = params?.page || 1;
      const size = params?.size || 10;
      console.log('[noteService.getByCourse] Fetching notes for course:', courseId);
      const response = await api.get(
        `/v1/learning/courses/${courseId}/notes?page=${page}&pageSize=${size}`
      );
      const data = response.data?.data || response.data;
      console.log('[noteService.getByCourse] Success');
      return { data };
    } catch (error) {
      console.error('[noteService.getByCourse] Error:', error);
      throw error;
    }
  },

  /**
   * Create a note for a lesson
   * @param {string} courseId - Course ID
   * @param {object} data - Note data { lessonId, content }
   * @returns Response with created note
   */
  create: async (courseId, data) => {
    try {
      if (!data.lessonId) {
        throw new Error('lessonId is required to create a note');
      }

      console.log('[noteService.create] Creating note for lesson:', data.lessonId);
      const response = await api.post(`/v1/learning/courses/${courseId}/lessons/${data.lessonId}/notes`, {
        content: data.content,
        videoTimestamp: data.videoTimestamp ?? 0,
      });
      const note = response.data?.data || response.data;
      console.log('[noteService.create] Success:', note.id);
      return { data: note };
    } catch (error) {
      console.error('[noteService.create] Error:', error);
      throw error;
    }
  },

  /**
   * Get a specific note by ID
   * @param {string} courseId - Course ID
   * @param {string} noteId - Note ID
   * @returns Response with note
   */
  getById: async (courseId, noteId) => {
    try {
      console.log('[noteService.getById] Resolving note from course notes:', noteId);
      const response = await api.get(`/v1/learning/courses/${courseId}/notes?page=1&pageSize=100`);
      const data = response.data?.data || response.data;
      const notes = Array.isArray(data) ? data : data?.content || [];
      const note = notes.find((item) => String(item.id) === String(noteId));
      if (!note) {
        throw { response: { status: 404, data: { message: 'Không tìm thấy ghi chú' } } };
      }
      return { data: note };
    } catch (error) {
      console.error('[noteService.getById] Error:', error);
      throw error;
    }
  },

  /**
   * Update a note
   * @param {string} courseId - Course ID
   * @param {string} noteId - Note ID
   * @param {object} data - Update data { content }
   * @returns Response with updated note
   */
  update: async (_courseId, noteId, data) => {
    try {
      console.log('[noteService.update] Updating note:', noteId);
      const response = await api.put(`/v1/learning/notes/${noteId}`, {
        content: data.content,
        videoTimestamp: data.videoTimestamp ?? 0,
      });
      const note = response.data?.data || response.data;
      console.log('[noteService.update] Success');
      return { data: note };
    } catch (error) {
      console.error('[noteService.update] Error:', error);
      throw error;
    }
  },

  /**
   * Delete a note
   * @param {string} courseId - Course ID
   * @param {string} noteId - Note ID
   * @returns Response
   */
  delete: async (_courseId, noteId) => {
    try {
      console.log('[noteService.delete] Deleting note:', noteId);
      const response = await api.delete(`/v1/learning/notes/${noteId}`);
      return { data: response.data?.data || response.data || { message: 'Xóa ghi chú thành công' } };
    } catch (error) {
      console.error('[noteService.delete] Error:', error);
      throw error;
    }
  },

  /**
   * Get notes for a specific lesson
   * @param {string} courseId - Course ID
   * @param {string} lessonId - Lesson ID
   * @returns Response with notes
   */
  getByLesson: async (courseId, lessonId, params) => {
    try {
      const page = params?.page || 1;
      const size = params?.size || 10;
      console.log('[noteService.getByLesson] Fetching notes for lesson:', lessonId);
      const response = await api.get(
        `/v1/learning/courses/${courseId}/lessons/${lessonId}/notes?page=${page}&pageSize=${size}`
      );
      const data = response.data?.data || response.data || [];
      const notes = Array.isArray(data) ? data : data?.content || [];
      console.log('[noteService.getByLesson] Success, found:', notes.length);
      return { data: Array.isArray(data) ? notes : data };
    } catch (error) {
      console.error('[noteService.getByLesson] Error:', error);
      throw error;
    }
  },
};
