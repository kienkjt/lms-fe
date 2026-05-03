import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { cartService } from "../../services/cartService";
import { setCart, removeFromCart, clearCart } from "../../store/cartSlice";
import { formatPrice } from "../../utils/helpers";
import { ROUTES } from "../../utils/constants";
import { FaShoppingCart, FaTrash } from "react-icons/fa";
import Loading from "../common/Loading";
import "./Cart.css";

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, loading } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      cartService
        .getCart()
        .then((res) => {
          const data = res.data;
          const cartItems = data?.items || data?.cartItems || [];
          const total =
            data?.totalAmount ||
            cartItems.reduce((sum, item) => sum + (item.price || 0), 0);
          dispatch(setCart({ items: cartItems, total }));
        })
        .catch(() => {});
    }
  }, [isAuthenticated, dispatch]);

  const handleRemove = async (cartItemId) => {
    try {
      await cartService.removeItem(cartItemId);
      dispatch(removeFromCart(cartItemId));
      toast.success("Đã xóa khỏi giỏ hàng");
    } catch (error) {
      console.error("Remove cart item failed:", error);
      toast.error("Không thể xóa");
    }
  };

  const handleClear = async () => {
    try {
      await cartService.clearCart();
      dispatch(clearCart());
      toast.success("Đã xóa giỏ hàng");
    } catch {
      toast.error("Không thể xóa giỏ hàng");
    }
  };

  const total = items.reduce(
    (sum, item) =>
      sum +
      (item.price || item.course?.discountPrice || item.course?.price || 0),
    0,
  );

  if (loading) return <Loading />;

  return (
    <div className="cart-page">
      <div className="container">
        <h1 style={{ marginBottom: "var(--space-6)" }}>
          <FaShoppingCart style={{ marginRight: "12px" }} /> Giỏ hàng của tôi
        </h1>

        {items.length === 0 ? (
          <div className="empty-state" style={{ padding: "80px 0" }}>
            <div className="empty-state-icon">
              <FaShoppingCart size={48} />
            </div>
            <h3>Giỏ hàng trống</h3>
            <p>Thêm khóa học bạn yêu thích vào giỏ hàng</p>
            <Link to={ROUTES.COURSES} className="btn btn-primary">
              Khám phá khóa học
            </Link>
          </div>
        ) : (
          <div className="cart-layout">
            {/* Items */}
            <div className="cart-items">
              <div className="cart-header-bar">
                <span>{items.length} khóa học</span>
                <button className="btn btn-ghost btn-sm" onClick={handleClear}>
                  Xóa tất cả
                </button>
              </div>

              {items.map((item) => {
                const title =
                  item.courseTitle || item.course?.title || "Khóa học";
                const thumbnail =
                  item.courseThumbnail || item.course?.thumbnail;
                const instructorName =
                  item.instructorName || item.course?.instructorName;
                const price =
                  item.price ||
                  item.course?.discountPrice ||
                  item.course?.price ||
                  0;
                const originalPrice =
                  item.originalPrice ||
                  item.course?.originalPrice ||
                  item.course?.price ||
                  0;
                return (
                  <div key={item.id || item.courseId} className="cart-item">
                    {thumbnail && (
                      <img
                        src={thumbnail}
                        alt={title}
                        className="cart-item-img"
                      />
                    )}
                    <div className="cart-item-info">
                      <Link
                        to={`/courses/${item.courseId || item.course?.id}`}
                        className="cart-item-title"
                      >
                        {title}
                      </Link>
                      <p className="cart-item-instructor">{instructorName}</p>
                      <div className="cart-item-meta">
                        {originalPrice > price && (
                          <span
                            className="text-muted"
                            style={{ textDecoration: "line-through" }}
                          >
                            {formatPrice(originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="cart-item-actions">
                      <span className="cart-item-price">
                        {formatPrice(price)}
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => handleRemove(item.id)}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="cart-summary">
              <div className="card">
                <div className="card-body">
                  <h3>Tổng đơn hàng</h3>
                  <div className="summary-row">
                    <span>Giá gốc:</span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Giảm giá:</span>
                    <span className="text-success">- ₫0</span>
                  </div>
                  <hr className="divider" style={{ margin: "12px 0" }} />
                  <div className="summary-row summary-total">
                    <span>Tổng cộng:</span>
                    <span
                      style={{
                        color: "var(--primary)",
                        fontSize: "22px",
                        fontWeight: 800,
                      }}
                    >
                      {formatPrice(total)}
                    </span>
                  </div>

                  <button
                    className="btn btn-primary btn-full btn-lg"
                    style={{ marginTop: "16px" }}
                    onClick={() => navigate("/checkout")}
                    id="checkout-btn"
                  >
                    💳 Thanh toán ngay
                  </button>

                  <Link
                    to={ROUTES.COURSES}
                    className="btn btn-ghost btn-full"
                    style={{ marginTop: "8px" }}
                  >
                    Tiếp tục mua hàng
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
