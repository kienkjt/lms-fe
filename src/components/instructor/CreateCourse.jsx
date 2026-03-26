import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { courseService } from "../../services/courseService";
import { ROUTES, COURSE_LEVELS } from "../../utils/constants";
import { toast } from "react-toastify";
import "./CreateCourse.css";

const CreateCourse = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: 1,
    level: COURSE_LEVELS.BEGINNER,
    price: 0,
    originalPrice: 0,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" || name === "originalPrice" || name === "categoryId"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.title.trim()) {
      toast.error("Vui lòng nhập tiêu đề khóa học");
      return;
    }
    if (!formData.description.trim()) {
      toast.error("Vui lòng nhập mô tả khóa học");
      return;
    }

    setLoading(true);
    try {
      const newCourse = {
        ...formData,
        instructor: user,
      };
      await courseService.create(newCourse);
      toast.success("Tạo khóa học thành công!");
      navigate(ROUTES.INSTRUCTOR_COURSES);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể tạo khóa học");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-page animate-fade-in">
      <div className="page-header">
        <h1>Tạo khóa học mới</h1>
        <p>Nhập thông tin cơ bản để tạo khóa học của bạn</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label htmlFor="title">Tiêu đề khóa học *</label>
            <input
              id="title"
              name="title"
              type="text"
              placeholder="VD: React.js từ cơ bản đến nâng cao"
              value={formData.title}
              onChange={handleChange}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Mô tả khóa học *</label>
            <textarea
              id="description"
              name="description"
              placeholder="Mô tả chi tiết về nội dung và mục tiêu khóa học..."
              value={formData.description}
              onChange={handleChange}
              className="input"
              rows="5"
              required
            ></textarea>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group">
              <label htmlFor="categoryId">Danh mục *</label>
              <select
                id="categoryId"
                name="categoryId"
                value={formData.categoryId}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="1">Lập trình Web</option>
                <option value="2">Lập trình Mobile</option>
                <option value="3">Data Science</option>
                <option value="4">Thiết kế UI/UX</option>
                <option value="5">Marketing Digital</option>
                <option value="6">Kinh doanh</option>
                <option value="7">Tiếng Anh</option>
                <option value="8">Quản lý dự án</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="level">Mức độ *</label>
              <select
                id="level"
                name="level"
                value={formData.level}
                onChange={handleChange}
                className="input"
                required
              >
                <option value={COURSE_LEVELS.BEGINNER}>Cơ bản</option>
                <option value={COURSE_LEVELS.INTERMEDIATE}>Trung bình</option>
                <option value={COURSE_LEVELS.ADVANCED}>Nâng cao</option>
              </select>
            </div>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "16px",
            }}
          >
            <div className="form-group">
              <label htmlFor="originalPrice">Giá gốc (VND)</label>
              <input
                id="originalPrice"
                name="originalPrice"
                type="number"
                min="0"
                value={formData.originalPrice}
                onChange={handleChange}
                className="input"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label htmlFor="price">Giá bán (VND) *</label>
              <input
                id="price"
                name="price"
                type="number"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="input"
                placeholder="0"
                required
              />
            </div>
          </div>

          <div style={{ display: "flex", gap: "12px", marginTop: "32px" }}>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ flex: 1 }}
            >
              {loading ? "Đang tạo..." : "Tạo khóa học"}
            </button>
            <button
              type="button"
              onClick={() => navigate(ROUTES.INSTRUCTOR_COURSES)}
              className="btn btn-outline"
              style={{ flex: 1 }}
            >
              Hủy
            </button>
          </div>

          <div
            style={{
              marginTop: "24px",
              padding: "16px",
              backgroundColor: "#f0f3ff",
              borderRadius: "8px",
              fontSize: "14px",
              color: "#333",
            }}
          >
            <p>
              <strong>Ghi chú:</strong> Khóa học sẽ được tạo ở trạng thái
              "Nháp". Bạn có thể chỉnh sửa chi tiết khóa học sau khi tạo, rồi
              công khai khóa học khi sẵn sàng.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCourse;
