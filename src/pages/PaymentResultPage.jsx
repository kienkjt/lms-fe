import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaExclamationTriangle,
  FaBook,
  FaArrowLeft,
  FaClock,
} from "react-icons/fa";
import { orderService } from "../services/orderService";
import { ROUTES } from "../utils/constants";
import { formatPrice } from "../utils/helpers";
import "../pages/OrdersPage.css";

const PaymentResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Query parameters from VNPay return
  const success = searchParams.get("success") === "true";
  const result = searchParams.get("result"); // 'success', 'cancelled', or 'failed'
  const orderId = searchParams.get("orderId");
  const orderCode = searchParams.get("orderCode");
  const status = searchParams.get("status");
  const transactionId = searchParams.get("transactionId");
  const message = searchParams.get("message");
  const responseCode = searchParams.get("responseCode");

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true);

        if (orderId) {
          const response = await orderService.getOrder(orderId);
          const orderData = response.data?.data || response.data;
          setOrder(orderData);

          // Show appropriate message
          if (success && status === "COMPLETED") {
            toast.success("Thanh toán thành công!");
          } else if (result === "cancelled") {
            toast.info("Bạn đã hủy giao dịch thanh toán");
          } else if (message) {
            toast.error(message);
          } else if (!success) {
            toast.error("Thanh toán không thành công");
          }
        } else {
          toast.error("Thiếu thông tin đơn hàng");
        }
      } catch (error) {
        console.error("Error loading order:", error);
        toast.error("Không thể tải thông tin đơn hàng");
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [orderId, message, result, status, success]);

  const getErrorMessage = () => {
    if (message) return message;

    const codeMessages = {
      "07": "Giao dịch tổng hợp được gửi",
      "09": "Ngân hàng từ chối giao dịch",
      10: "Checksum không đúng",
      11: "Tài khoản nhà cung cấp chưa được xác nhận",
      12: "Tài khoản nhà cung cấp bị khóa",
      13: "Loại tiền tệ không được hỗ trợ",
      24: "Khách hàng hủy giao dịch",
      25: "Yêu cầu không hợp lệ",
      51: "Tài khoản không đủ số dư",
      65: "Tình trạng tài khoản nhà cung cấp không hợp lệ",
      75: "Cổng thanh toán hết thời gian chờ",
      79: "Lỗi không xác định",
      99: "Lỗi không rõ",
    };

    return codeMessages[responseCode] || "Thanh toán không thành công";
  };

  if (loading) {
    return (
      <div className="payment-status-page">
        <div className="status-container">
          <div className="spinner"></div>
          <h2>Đang tải thông tin...</h2>
          <p>Vui lòng chờ trong giây lát</p>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-status-page">
      <div className="status-container">
        {success && status === "COMPLETED" ? (
          // Success State
          <>
            <div className="success-icon">
              <FaCheckCircle size={64} />
            </div>
            <h1>Thanh toán thành công!</h1>
            <p className="status-message">
              Cảm ơn bạn! Đơn hàng của bạn đã được xác nhận và bạn có thể bắt
              đầu học các khóa học ngay lập tức.
            </p>

            {order && (
              <div className="order-summary-compact">
                <div className="summary-item">
                  <label>Mã đơn hàng:</label>
                  <strong>{orderCode || order.id}</strong>
                </div>
                <div className="summary-item">
                  <label>Tổng tiền:</label>
                  <strong>{formatPrice(order.totalAmount || 0)}</strong>
                </div>
                {transactionId && (
                  <div className="summary-item">
                    <label>Mã giao dịch:</label>
                    <strong>{transactionId}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="action-buttons">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate(ROUTES.STUDENT_COURSES)}
              >
                <FaBook /> Bắt đầu học ngay
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => navigate(ROUTES.STUDENT_ORDERS)}
              >
                <FaClock /> Lịch sử đơn hàng
              </button>
            </div>
          </>
        ) : result === "cancelled" ? (
          // Cancelled State
          <>
            <div className="warning-icon">
              <FaExclamationTriangle size={64} />
            </div>
            <h1>Giao dịch đã bị hủy</h1>
            <p className="status-message">
              Bạn đã hủy giao dịch thanh toán. Đơn hàng của bạn vẫn chưa được
              hoàn tất.
            </p>

            {order && (
              <div className="order-summary-compact">
                <div className="summary-item">
                  <label>Mã đơn hàng:</label>
                  <strong>{orderCode || order.id}</strong>
                </div>
                <div className="summary-item">
                  <label>Trạng thái:</label>
                  <strong>{status}</strong>
                </div>
              </div>
            )}

            <div className="action-buttons">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate(ROUTES.CHECKOUT)}
              >
                <FaArrowLeft /> Quay lại thanh toán
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => navigate(ROUTES.CART)}
              >
                <FaArrowLeft /> Quay lại giỏ hàng
              </button>
            </div>
          </>
        ) : (
          // Failed State
          <>
            <div className="error-icon">
              <FaTimesCircle size={64} />
            </div>
            <h1>Thanh toán không thành công</h1>
            <p className="status-message">{getErrorMessage()}</p>

            {order && (
              <div className="order-summary-compact">
                <div className="summary-item">
                  <label>Mã đơn hàng:</label>
                  <strong>{orderCode || order.id}</strong>
                </div>
                <div className="summary-item">
                  <label>Tổng tiền:</label>
                  <strong>{formatPrice(order.totalAmount || 0)}</strong>
                </div>
                {responseCode && (
                  <div className="summary-item">
                    <label>Mã lỗi:</label>
                    <strong>{responseCode}</strong>
                  </div>
                )}
              </div>
            )}

            <div className="action-buttons">
              <button
                className="btn btn-primary btn-lg"
                onClick={() => navigate(ROUTES.CHECKOUT)}
              >
                <FaArrowLeft /> Thử lại
              </button>
              <button
                className="btn btn-outline btn-lg"
                onClick={() => navigate(ROUTES.CART)}
              >
                <FaArrowLeft /> Quay lại giỏ hàng
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentResultPage;
