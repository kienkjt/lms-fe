import api from "./api";

export const dashboardService = {
  getAdminDashboard: async () => {
    const response = await api.get("/api/v1/dashboard/admin");
    return { data: response.data?.data || response.data };
  },

  getInstructorDashboard: async () => {
    const response = await api.get("/api/v1/dashboard/instructor");
    return { data: response.data?.data || response.data };
  },
};
