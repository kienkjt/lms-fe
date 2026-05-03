import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { wishlistService } from "../services/wishlistService";
import { ROUTES } from "../utils/constants";
import { formatDate, formatPrice } from "../utils/helpers";
import "./WishlistPage.css";

const PAGE_SIZE = 10;

const WishListPage = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState("");
  const [page, setPage] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        setLoading(true);
        const response = await wishlistService.getWishlist({
          page,
          pageSize: PAGE_SIZE,
        });
        // Response data has { content: [...], pageNumber, pageSize, etc }
        const pageData = response.data || {};
        const data = Array.isArray(pageData)
          ? pageData
          : pageData.content || [];
        setItems(Array.isArray(data) ? data : []);
        setTotalElements(pageData.totalElements ?? data.length);
        setTotalPages(Math.max(1, pageData.totalPages || 1));
      } catch (error) {
        console.error("Failed to load wishlist:", error);
        toast.error("Không thể tải danh sách yêu thích");
        setItems([]);
        setTotalElements(0);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [page]);

  const handleRemove = async (courseId) => {
    try {
      setRemovingId(courseId);
      await wishlistService.remove(courseId);
      toast.success("Đã xóa khỏi danh sách yêu thích");
      if (items.length === 1 && page > 1) {
        setPage((prev) => prev - 1);
      } else {
        const response = await wishlistService.getWishlist({
          page,
          pageSize: PAGE_SIZE,
        });
        const pageData = response.data || {};
        const data = Array.isArray(pageData)
          ? pageData
          : pageData.content || [];
        setItems(Array.isArray(data) ? data : []);
        setTotalElements(pageData.totalElements ?? data.length);
        setTotalPages(Math.max(1, pageData.totalPages || 1));
      }
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
        <>
          <div className="wishlist-list">
            {items.map((item) => {
              const course = item.course || {};
              const courseId = item.courseId || course.id;

              return (
                <article key={item.id || courseId} className="wishlist-item">
                  <div className="wishlist-item-thumbnail">
                    {course.thumbnail || course.image ? (
                      <img
                        src={course.thumbnail || course.image}
                        alt={course.title || "Course"}
                      />
                    ) : (
                      <div className="wishlist-item-placeholder">No Image</div>
                    )}
                  </div>

                  <div className="wishlist-item-content">
                    <h3>{course.title || "Khóa học"}</h3>
                    <p>{course.shortDescription || course.description || ""}</p>
                    <div className="wishlist-item-meta">
                      <span>{formatPrice(course.price || 0)}</span>
                      <span>Thêm ngày: {formatDate(item.createdAt)}</span>
                    </div>
                  </div>

                  <div className="wishlist-item-actions">
                    <Link
                      to={`/courses/${course.id || courseId}`}
                      className="btn btn-outline btn-sm"
                    >
                      Xem chi tiết
                    </Link>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => handleRemove(courseId)}
                      disabled={removingId === courseId}
                    >
                      Xóa
                    </button>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="wishlist-pagination-row">
            <span>
              Hiển thị {items.length} / {totalElements} khóa học yêu thích
            </span>
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  className="page-btn"
                  onClick={() => setPage((value) => Math.max(value - 1, 1))}
                  disabled={page <= 1}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, index) => (
                  <button
                    key={index + 1}
                    className={`page-btn ${page === index + 1 ? "active" : ""}`}
                    onClick={() => setPage(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                <button
                  className="page-btn"
                  onClick={() =>
                    setPage((value) => Math.min(value + 1, totalPages))
                  }
                  disabled={page >= totalPages}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default WishListPage;
