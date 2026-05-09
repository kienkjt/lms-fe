import api from "./api";

export const learningAnalyticsService = {
  getMyStreak: async () => {
    const response = await api.get("/v1/learning-analytics/me/streak");
    return { data: response.data?.data || response.data };
  },

  getMyHeatmap: async (params = {}) => {
    const query = new URLSearchParams();
    if (params.fromDate) query.append("fromDate", params.fromDate);
    if (params.toDate) query.append("toDate", params.toDate);
    const suffix = query.toString() ? `?${query.toString()}` : "";
    const response = await api.get(`/v1/learning-analytics/me/heatmap${suffix}`);
    return { data: response.data?.data || response.data || [] };
  },

  getInstructorCourseStudentsEngagement: async (courseId, params = {}) => {
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 10;
    const response = await api.get(
      `/v1/learning-analytics/instructor/courses/${courseId}/students?page=${page}&pageSize=${pageSize}`,
    );
    return { data: response.data?.data || response.data };
  },
};

