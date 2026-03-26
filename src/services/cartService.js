import { mockCart, mockCourses } from '../utils/mockData';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const cartService = {
  getCart: async () => {
    await delay(200);
    return { data: mockCart };
  },
  addItem: async (courseId) => {
    await delay(200);
    const course = mockCourses.find(c => c.id === courseId);
    if (!course) throw { response: { status: 404, data: { message: 'Khóa học không tìm thấy' } } };
    const exists = mockCart.some(item => item.courseId === courseId);
    if (exists) throw { response: { data: { message: 'Khóa học đã có trong giỏ hàng' } } };
    const cartItem = {
      id: `cart-${Date.now()}`,
      courseId,
      course,
      addedAt: new Date().toISOString().split('T')[0],
    };
    mockCart.push(cartItem);
    return { data: cartItem };
  },
  removeItem: async (courseId) => {
    await delay(200);
    const index = mockCart.findIndex(item => item.courseId === courseId);
    if (index === -1) throw { response: { status: 404, data: { message: 'Khóa học không có trong giỏ hàng' } } };
    mockCart.splice(index, 1);
    return { data: { message: 'Xóa khỏi giỏ hàng thành công' } };
  },
  clearCart: async () => {
    await delay(200);
    mockCart.length = 0;
    return { data: { message: 'Xóa toàn bộ giỏ hàng thành công' } };
  },
};
