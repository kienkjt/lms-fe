import { mockCategories } from '../utils/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const categoryService = {
  getAll: async () => {
    await delay(200);
    return { data: mockCategories };
  },
  getById: async (id) => {
    await delay(200);
    const category = mockCategories.find(c => c.id === id);
    if (!category) throw { response: { status: 404, data: { message: 'Danh mục không tìm thấy' } } };
    return { data: category };
  },
};
