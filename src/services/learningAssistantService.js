import api from './api';

export const learningAssistantService = {
  ask: async (payload) => {
    const response = await api.post('/api/v1/learning/assistant/prompt', payload);
    return { data: response.data?.data || response.data };
  },
};
