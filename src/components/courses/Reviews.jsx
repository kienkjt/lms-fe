import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { reviewService } from "../../services/reviewService";
import { ROLES, hasRole } from "../../utils/constants";
import {
  FaStar,
  FaTrash,
  FaEdit,
  FaPaperPlane,
  FaReply,
  FaTimes,
} from "react-icons/fa";
import "./Reviews.css";

const STUDENT_FEATURE_ROLES = [ROLES.STUDENT, ROLES.INSTRUCTOR, ROLES.ADMIN];

const ReviewForm = ({ onSubmit, initialData = null, onCancel = null }) => {
  const { user } = useSelector((state) => state.auth);
  const [rating, setRating] = useState(initialData?.rating || 5);
  const [comment, setComment] = useState(initialData?.comment || "");
  const [hoveredRating, setHoveredRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      toast.error("Bạn cần đăng nhập để bình luận");
      return;
    }
    if (rating === 0) {
      toast.error("Vui lòng chọn đánh giá sao");
      return;
    }
    if (comment.trim().length === 0) {
      toast.error("Vui lòng nhập bình luận");
      return;
    }

    try {
      setSubmitting(true);
      await onSubmit({ rating, comment });
      setRating(5);
      setComment("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="review-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Đánh giá của bạn:</label>
        <div className="rating-input">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`star-btn ${star <= (hoveredRating || rating) ? "active" : ""}`}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              title={`${star} sao`}
            >
              <FaStar />
            </button>
          ))}
        </div>
        <span className="rating-text">{rating > 0 && `${rating} sao`}</span>
      </div>

      <div className="form-group">
        <label htmlFor="comment">Bình luận:</label>
        <textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Chia sẻ trải nghiệm của bạn về khóa học..."
          rows={4}
          maxLength={2000}
        />
        <span className="char-count">{comment.length}/2000</span>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn btn-ghost"
          onClick={onCancel}
          disabled={submitting}
        >
          Hủy
        </button>
        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? (
            <>
              <span className="spinner"></span> Đang gửi...
            </>
          ) : (
            <>
              <FaPaperPlane /> Gửi bình luận
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const ReplyForm = ({ onSubmit, onCancel, submitting = false }) => {
  const [reply, setReply] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reply.trim()) {
      toast.error("Vui lòng nhập câu trả lời");
      return;
    }
    onSubmit(reply);
    setReply("");
  };

  return (
    <form className="reply-form" onSubmit={handleSubmit}>
      <textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Nhập câu trả lời của bạn..."
        rows={3}
        maxLength={2000}
        required
      />
      <span className="char-count">{reply.length}/2000</span>
      <div className="form-actions">
        <button
          type="button"
          className="btn btn-ghost btn-sm"
          onClick={onCancel}
          disabled={submitting}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="btn btn-primary btn-sm"
          disabled={submitting}
        >
          {submitting ? "Đang gửi..." : "Gửi câu trả lời"}
        </button>
      </div>
    </form>
  );
};

const ReviewCard = ({
  review,
  isOwn,
  isCourseOwner,
  onDelete,
  onEdit,
  onReply,
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleReplySubmit = async (replyText) => {
    try {
      setSubmitting(true);
      await onReply(review.id, replyText);
      setShowReplyForm(false);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="review-card">
      {/* Header */}
      <div className="review-header">
        <div className="reviewer-info">
          <div className="reviewer-avatar">
            {review.studentAvatar ? (
              <img src={review.studentAvatar} alt={review.studentName} />
            ) : (
              review.studentName?.charAt(0)?.toUpperCase()
            )}
          </div>
          <div className="reviewer-details">
            <h4 className="reviewer-name">
              {review.studentName || "Anonymous"}
            </h4>
            <div className="review-meta">
              <div className="rating-display">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < review.rating ? "filled" : ""}
                    size={12}
                  />
                ))}
              </div>
              <span className="review-date">
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>
        </div>

        {isOwn && (
          <div className="review-actions">
            <button className="btn-icon" onClick={onEdit} title="Chỉnh sửa">
              <FaEdit />
            </button>
            <button className="btn-icon delete" onClick={onDelete} title="Xóa">
              <FaTrash />
            </button>
          </div>
        )}
      </div>

      {/* Comment */}
      <div className="review-comment">
        <p>{review.comment}</p>
      </div>

      {/* Instructor Reply */}
      {review.instructorReply && (
        <div className="instructor-reply">
          <div className="reply-header">
            <FaReply size={14} />
            <span className="reply-label">Phản hồi từ giảng viên</span>
            {review.repliedAt && (
              <span className="reply-date">
                {new Date(review.repliedAt).toLocaleDateString("vi-VN")}
              </span>
            )}
          </div>
          <p className="reply-text">{review.instructorReply}</p>
        </div>
      )}

      {/* Reply Form (for instructors) */}
      {isCourseOwner && !review.instructorReply && (
        <>
          {!showReplyForm ? (
            <button
              className="btn-reply-small"
              onClick={() => setShowReplyForm(true)}
            >
              <FaReply size={12} /> Phản hồi
            </button>
          ) : (
            <ReplyForm
              onSubmit={handleReplySubmit}
              onCancel={() => setShowReplyForm(false)}
              submitting={submitting}
            />
          )}
        </>
      )}
    </div>
  );
};

const Reviews = ({ courseId, canReview = false, isCourseOwner = false }) => {
  const { user } = useSelector((state) => state.auth);
  const isStudent = hasRole(user?.role, STUDENT_FEATURE_ROLES);

  const [reviews, setReviews] = useState([]);
  const [myReview, setMyReview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [stats, setStats] = useState(null);

  // Load reviews
  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);

      // Load my review if authenticated
      if (user && isStudent) {
        try {
          const myRes = await reviewService.getMyReview(courseId);
          setMyReview(myRes.data);
        } catch {
          // No review yet
        }
      }

      // Load all reviews
      const res = await reviewService.getByCourse(courseId, { page, size: 10 });
      const data = res.data;
      const reviewsList = Array.isArray(data) ? data : data?.content || [];
      const total = data?.totalElements || reviewsList.length;

      if (page === 1) {
        setReviews(reviewsList);
        setHasMore(reviewsList.length < total);
      } else {
        setReviews((prev) => {
          const updated = [...prev, ...reviewsList];
          setHasMore(updated.length < total);
          return updated;
        });
      }

      // Load rating stats
      try {
        const statsRes = await reviewService.getRatingStats(courseId);
        setStats(statsRes.data);
      } catch {
        // Stats not available
      }
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast.error("Lỗi tải đánh giá");
    } finally {
      setLoading(false);
    }
  }, [courseId, user, isStudent, page]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleCreateReview = async (data) => {
    try {
      await reviewService.create(courseId, data);
      toast.success("Đánh giá đã được gửi");
      setShowForm(false);
      setPage(1);
      loadReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể gửi đánh giá");
    }
  };

  const handleUpdateReview = async (data) => {
    try {
      await reviewService.updateMyReview(courseId, data);
      toast.success("Đánh giá đã được cập nhật");
      setEditingReview(null);
      setPage(1);
      loadReviews();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Không thể cập nhật đánh giá",
      );
    }
  };

  const handleDeleteReview = async () => {
    if (!window.confirm("Bạn có chắc muốn xóa đánh giá này?")) return;

    try {
      await reviewService.deleteMyReview(courseId);
      toast.success("Đánh giá đã được xóa");
      setPage(1);
      loadReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể xóa đánh giá");
    }
  };

  const handleReplyReview = async (reviewId, replyText) => {
    try {
      await reviewService.replyReview(courseId, reviewId, { reply: replyText });
      toast.success("Câu trả lời đã được gửi");
      loadReviews();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi gửi câu trả lời");
    }
  };

  return (
    <div className="reviews-section">
      <h2>Đánh giá khóa học</h2>

      {/* Rating Summary */}
      {stats && (
        <div className="rating-summary">
          <div className="rating-average">
            <div className="average-score">
              <span className="score">{stats.avgRating?.toFixed(1)}</span>
              <div className="stars">
                {[...Array(5)].map((_, i) => (
                  <FaStar
                    key={i}
                    className={i < Math.round(stats.avgRating) ? "filled" : ""}
                  />
                ))}
              </div>
              <span className="review-count">
                ({stats.totalReviews} đánh giá)
              </span>
            </div>
          </div>
        </div>
      )}

      {/* My Review Form */}
      {!user && (
        <div className="review-access-note">
          Đăng nhập bằng tài khoản học viên đã đăng ký khóa học để viết đánh
          giá.
        </div>
      )}

      {user && isStudent && !canReview && !isCourseOwner && (
        <div className="review-access-note">
          Chỉ học viên đã đăng ký khóa học mới có thể viết đánh giá.
        </div>
      )}

      {canReview && !myReview && !editingReview && (
        <>
          {!showForm ? (
            <button
              className="btn btn-primary btn-new-review"
              onClick={() => setShowForm(true)}
            >
              Viết đánh giá
            </button>
          ) : (
            <ReviewForm
              onSubmit={handleCreateReview}
              onCancel={() => setShowForm(false)}
            />
          )}
        </>
      )}

      {/* Editing Review */}
      {editingReview && (
        <ReviewForm
          initialData={editingReview}
          onSubmit={handleUpdateReview}
          onCancel={() => setEditingReview(null)}
        />
      )}

      {/* Reviews List */}
      <div className="reviews-list">
        {myReview && (
          <div className="my-review-section">
            <h3>Đánh giá của bạn</h3>
            <ReviewCard
              review={myReview}
              isOwn={true}
              isCourseOwner={isCourseOwner}
              onDelete={handleDeleteReview}
              onEdit={() => setEditingReview(myReview)}
              onReply={handleReplyReview}
            />
          </div>
        )}

        <div className="other-reviews">
          {reviews
            .filter((r) => !myReview || r.id !== myReview.id)
            .map((review) => (
              <ReviewCard
                key={review.id}
                review={review}
                isOwn={review.studentId === user?.id}
                isCourseOwner={isCourseOwner}
                onDelete={() =>
                  window.confirm("Bạn có chắc muốn xóa bình luận này?") &&
                  handleDeleteReview()
                }
                onEdit={() => setEditingReview(review)}
                onReply={handleReplyReview}
              />
            ))}
        </div>

        {loading && <div className="loading">Đang tải đánh giá...</div>}

        {hasMore && (
          <button
            className="btn btn-outline btn-load-more"
            onClick={() => setPage((p) => p + 1)}
          >
            Xem thêm đánh giá
          </button>
        )}

        {!loading && reviews.length === 0 && !myReview && (
          <div className="empty-reviews">
            <p>Chưa có đánh giá nào.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reviews;

// Export sub-components for testing
export { ReviewForm, ReviewCard, ReplyForm };
