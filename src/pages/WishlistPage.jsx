import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { wishlistService } from "../services/wishlistService";
import { ROUTES } from "../utils/constants";
import { formatDate, formatPrice } from "../utils/helpers";
import "./WishlistPage.css";

const WishListPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await wishlistService.getWishlist();
        // Response data has { content: [...], pageNumber, pageSize, etc }
        const data = response.data?.content || response.data || [];
        setItems(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to load wishlist:", error);
        toast.error("Khong the tai danh sach yeu thich");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, []);

  const handleRemove = async (courseId) => {
    try {
      setRemovingId(courseId);
      await wishlistService.remove(courseId);
      setItems((prev) => prev.filter((item) => item.courseId !== courseId));
      toast.success("Đã xóa khỏi danh sách yêu thích");
    } catch (error) {
      console.error("Remove wishlist item failed:", error);
      toast.error(
        error.response?.data?.message || "Không thể xóa khỏi yêu thích",
      );
    } finally {
      setRemovingId("");
    }
  };

  return (
    <div className="wishlist-page animate-fade-in">
      <div className="wishlist-header">
        <h1>Danh sách yêu thích</h1>
        <p>Lưu lại các khóa học bạn quan tâm để học sau.</p>
      </div>

      {loading ? (
        <div className="wishlist-state">Đang tải danh sách...</div>
      ) : items.length === 0 ? (
        <div className="wishlist-empty">
          <h3>Chưa có khóa học nào trong danh sách yêu thích</h3>
          <p>Bạn có thể thêm khóa học yêu thích từ trang chi tiết khóa học.</p>
          <Link to={ROUTES.COURSES} className="btn btn-primary btn-sm">
            Khám phá khóa học
          </Link>
        </div>
      ) : (
        <div className="wishlist-list">
          {items.map((item) => (
            <article key={item.id} className="wishlist-item">
              <div className="wishlist-item-thumbnail">
                {item.course?.thumbnail || item.course?.image ? (
                  <img
                    src={item.course.thumbnail || item.course.image}
                    alt={item.course?.title || "Course"}
                  />
                ) : (
                  <div className="wishlist-item-placeholder">No Image</div>
                )}
              </div>

              <div className="wishlist-item-content">
                <h3>{item.course?.title || "Khóa học"}</h3>
                <p>
                  {item.course?.shortDescription ||
                    item.course?.description ||
                    ""}
                </p>
                <div className="wishlist-item-meta">
                  <span>{formatPrice(item.course?.price || 0)}</span>
                  <span>Thêm ngày: {formatDate(item.createdAt)}</span>
                </div>
              </div>

              <div className="wishlist-item-actions">
                <Link
                  to={`/courses/${item.course?.id || item.courseId}`}
                  className="btn btn-outline btn-sm"
                >
                  Xem chi tiết
                </Link>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => handleRemove(item.courseId)}
                  disabled={removingId === item.courseId}
                >
                  Xóa
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

export default WishListPage;
