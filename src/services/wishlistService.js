import { mockWishlist, mockCourses } from '../utils/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const wishlistService = {
  getWishlist: async () => {
    await delay(200);
    return { data: mockWishlist };
  },
  add: async (courseId) => {
    await delay(200);
    const course = mockCourses.find(c => c.id === courseId);
    if (!course) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
    const exists = mockWishlist.some(w => w.courseId === courseId);
    if (exists) throw { response: { data: { message: 'Khóa học đã có trong danh sách yêu thích' } } };
    const item = {
      id: `wishlist-${Date.now()}`,
      userId: 'user-1',
      courseId,
      course,
      addedAt: new Date().toISOString().split('T')[0],
    };
    mockWishlist.push(item);
    return { data: item };
  },
  remove: async (courseId) => {
    await delay(200);
    const index = mockWishlist.findIndex(w => w.courseId === courseId);
    if (index === -1) throw { response: { status: 404, data: { message: 'Khóa học không có trong danh sách yêu thích' } } };
    mockWishlist.splice(index, 1);
    return { data: { message: 'Xóa khỏi danh sách yêu thích thành công' } };
  },
};
