import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { withdrawalService } from "../services/withdrawalService";
import { formatPrice } from "../utils/helpers";
import {
  validateBankAccount,
  validateWithdrawalAmount,
  validateRequired,
} from "../utils/validators";
import {
  FaWallet,
  FaMoneyBillWave,
  FaCheckCircle,
  FaClock,
  FaTimesCircle,
  FaTimes,
} from "react-icons/fa";
import Loading from "../components/common/Loading";
import "../components/student/Dashboard.css";
import "./InstructorRevenuePage.css";

const InstructorRevenuePage = () => {
  const [wallet, setWallet] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [cancelingId, setCancelingId] = useState("");
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [withdrawForm, setWithdrawForm] = useState({
    requestedAmount: "",
    accountHolder: "",
    bankName: "",
    bankAccount: "",
    reason: "",
  });

  const loadData = async (page = 0) => {
    try {
      setLoading(true);
      const [walletRes, requestsRes] = await Promise.all([
        withdrawalService.getWallet(),
        withdrawalService.getMyRequests({ page, size: 10 }),
      ]);

      setWallet(walletRes.data || null);

      const requestData = requestsRes.data;
      if (requestData?.content) {
        setRequests((requestData.content || []).filter((item) => item?.type === "EARNINGS"));
        setTotalPages(requestData.totalPages || 1);
      } else if (Array.isArray(requestData)) {
        setRequests(requestData.filter((item) => item?.type === "EARNINGS"));
        setTotalPages(1);
      } else {
        setRequests([]);
      }
      setCurrentPage(page);
    } catch (error) {
      console.error("Failed to load revenue data:", error);
      toast.error("Không thể tải dữ liệu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const validateForm = () => {
    const { requestedAmount, accountHolder, bankName, bankAccount } =
      withdrawForm;

    if (!validateRequired(requestedAmount)) {
      toast.error("Vui lòng nhập số tiền muốn rút");
      return false;
    }

    if (!validateWithdrawalAmount(requestedAmount, wallet?.availableBalance)) {
      if (Number(requestedAmount) > wallet?.availableBalance) {
        toast.error(
          `Số tiền không được vượt quá ${formatPrice(wallet?.availableBalance || 0)}`,
        );
      } else {
        toast.error("Vui lòng nhập số tiền hợp lệ");
      }
      return false;
    }

    if (!validateRequired(accountHolder)) {
      toast.error("Vui lòng nhập tên chủ tài khoản");
      return false;
    }

    if (!validateRequired(bankName)) {
      toast.error("Vui lòng nhập tên ngân hàng");
      return false;
    }

    if (!validateRequired(bankAccount)) {
      toast.error("Vui lòng nhập số tài khoản");
      return false;
    }

    if (!validateBankAccount(bankAccount)) {
      toast.error("Số tài khoản phải là 9-20 chữ số");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);
      await withdrawalService.createRequest({
        requestedAmount: Number(withdrawForm.requestedAmount),
        accountHolder: withdrawForm.accountHolder,
        bankName: withdrawForm.bankName,
        bankAccount: withdrawForm.bankAccount,
        reason: withdrawForm.reason,
      });

      toast.success("Tạo yêu cầu rút tiền thành công");
      setWithdrawForm({
        requestedAmount: "",
        accountHolder: "",
        bankName: "",
        bankAccount: "",
        reason: "",
      });
      await loadData(0);
    } catch (error) {
      console.error("Create withdrawal request failed:", error);
      toast.error(
        error.response?.data?.message || "Không thể tạo yêu cầu rút tiền",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu rút tiền này?")) return;

    try {
      setCancelingId(requestId);
      await withdrawalService.cancelRequest(requestId);
      toast.success("Đã hủy yêu cầu");
      await loadData(currentPage);
    } catch (error) {
      console.error("Cancel withdrawal failed:", error);
      toast.error(error.response?.data?.message || "Không thể hủy yêu cầu");
    } finally {
      setCancelingId("");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <FaClock style={{ color: "var(--warning)" }} />;
      case "APPROVED":
      case "COMPLETED":
        return <FaCheckCircle style={{ color: "var(--success)" }} />;
      case "REJECTED":
        return <FaTimesCircle style={{ color: "var(--danger)" }} />;
      default:
        return null;
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="instructor-revenue-page">
      <div className="dashboard-section">
        <div className="section-header">
          <h1 style={{ margin: 0 }}>Doanh thu & Rút tiền</h1>
        </div>

        {/* Wallet Stats */}
        {wallet && (
          <div className="wallet-stats-grid">
            <div className="wallet-stat-card wallet-stat-primary">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <FaWallet size={24} />
                <span style={{ fontSize: "12px", opacity: 0.9 }}>
                  SỐ DƯ HIỆN TẠI
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700" }}>
                {formatPrice(wallet.availableBalance || wallet.currentBalance || 0)}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                Sẵn sàng để rút tiền (khả dụng)
              </div>
            </div>

            <div className="wallet-stat-card wallet-stat-success">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <FaMoneyBillWave size={24} />
                <span style={{ fontSize: "12px", opacity: 0.9 }}>
                  TỔNG DOANH THU
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700" }}>
                {formatPrice(wallet.totalEarned || 0)}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                Từ đầu
              </div>
            </div>

            <div className="wallet-stat-card wallet-stat-warning">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <FaClock size={24} />
                <span style={{ fontSize: "12px", opacity: 0.9 }}>
                  TIỀN CHỜ RELEASE (7 NGÀY)
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700" }}>
                {formatPrice(wallet.pendingBalance || 0)}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                Tự động được cộng lại sau 7 ngày
              </div>
            </div>

            <div className="wallet-stat-card wallet-stat-danger">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <FaClock size={24} />
                <span style={{ fontSize: "12px", opacity: 0.9 }}>
                  CHỜ PHÊ DUYỆT RÚT
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700" }}>
                {formatPrice(wallet.pendingWithdrawalAmount || 0)}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                PENDING + APPROVED withdrawal
              </div>
            </div>

            <div className="wallet-stat-card wallet-stat-info">
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "8px",
                }}
              >
                <FaCheckCircle size={24} />
                <span style={{ fontSize: "12px", opacity: 0.9 }}>
                  TỔNG ĐÃ RÚT
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700" }}>
                {formatPrice(wallet.totalWithdrawn || 0)}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                Thành công
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Withdrawal Request Form */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Tạo yêu cầu rút tiền</h2>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ gridColumn: "1 / -1" }}>
              <textarea
                className="form-input"
                placeholder="Lý do rút tiền (tùy chọn)"
                rows="3"
                value={withdrawForm.reason}
                onChange={(e) =>
                  setWithdrawForm((prev) => ({
                    ...prev,
                    reason: e.target.value,
                  }))
                }
                style={{ marginBottom: "16px" }}
              />
            </div>

            <input
              className="form-input"
              type="number"
              inputMode="numeric"
              placeholder="Số tiền muốn rút"
              value={withdrawForm.requestedAmount}
              onChange={(e) =>
                setWithdrawForm((prev) => ({
                  ...prev,
                  requestedAmount: e.target.value,
                }))
              }
              required
            />
            <input
              className="form-input"
              type="text"
              placeholder="Tên chủ tài khoản"
              value={withdrawForm.accountHolder}
              onChange={(e) =>
                setWithdrawForm((prev) => ({
                  ...prev,
                  accountHolder: e.target.value,
                }))
              }
              required
            />
            <input
              className="form-input"
              type="text"
              placeholder="Tên ngân hàng"
              value={withdrawForm.bankName}
              onChange={(e) =>
                setWithdrawForm((prev) => ({
                  ...prev,
                  bankName: e.target.value,
                }))
              }
              required
            />
            <input
              className="form-input"
              type="text"
              placeholder="Số tài khoản"
              value={withdrawForm.bankAccount}
              onChange={(e) =>
                setWithdrawForm((prev) => ({
                  ...prev,
                  bankAccount: e.target.value,
                }))
              }
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg"
            disabled={submitting}
          >
            {submitting ? "Đang gửi..." : "Gửi yêu cầu rút tiền"}
          </button>
        </form>
      </div>

      {/* Withdrawal Requests History */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Lịch sử yêu cầu rút tiền</h2>
        </div>

        <div
          style={{
            background: "white",
            borderRadius: "var(--radius-lg)",
            overflow: "hidden",
            border: "1px solid var(--border-color)",
          }}
        >
          {requests.length === 0 ? (
            <div
              style={{
                padding: "48px 24px",
                textAlign: "center",
                color: "#999",
              }}
            >
              <FaWallet
                size={48}
                style={{ marginBottom: "16px", opacity: 0.3 }}
              />
              <p>Chưa có yêu cầu rút tiền nào</p>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Trạng thái</th>
                    <th>Ngày tạo</th>
                    <th>Số tiền</th>
                    <th>Ngân hàng</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                          }}
                        >
                          {getStatusIcon(request.status)}
                          <span
                            className={`badge badge-${request.status === "PENDING" ? "warning" : request.status === "COMPLETED" ? "success" : request.status === "APPROVED" ? "info" : "gray"}`}
                          >
                            {request.status}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontSize: "14px" }}>
                        {request.createdAt
                          ? new Date(request.createdAt).toLocaleDateString(
                              "vi-VN",
                            )
                          : "-"}
                      </td>
                      <td
                        style={{ fontWeight: "600", color: "var(--primary)" }}
                      >
                        {formatPrice(request.requestedAmount || 0)}
                      </td>
                      <td>{request.bankName || "-"}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button
                            className="btn btn-info btn-sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setShowDetailModal(true);
                            }}
                          >
                            Chi tiết
                          </button>
                          {request.status === "PENDING" &&
                            request.type === "EARNINGS" && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(request.id)}
                              disabled={cancelingId === request.id}
                            >
                              {cancelingId === request.id ? "Đang..." : "Hủy"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Pagination */}
              {totalPages > 1 && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "8px",
                    padding: "16px",
                    borderTop: "1px solid var(--border-color)",
                  }}
                >
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i}
                      onClick={() => loadData(i)}
                      className={`btn btn-${currentPage === i ? "primary" : "outline"} btn-sm`}
                      style={{ minWidth: "32px" }}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedRequest && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowDetailModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: "var(--radius-xl)",
              padding: "24px",
              maxWidth: "500px",
              width: "90%",
              maxHeight: "80vh",
              overflow: "auto",
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
              }}
            >
              <h2 style={{ margin: 0 }}>Chi tiết yêu cầu</h2>
              <button
                onClick={() => setShowDetailModal(false)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              <div
                style={{
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textTransform: "uppercase",
                  }}
                >
                  Mã yêu cầu
                </label>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "14px",
                    fontFamily: "monospace",
                  }}
                >
                  {selectedRequest.id}
                </p>
              </div>

              <div
                style={{
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textTransform: "uppercase",
                  }}
                >
                  Trạng thái
                </label>
                <p style={{ margin: "8px 0 0" }}>
                  <span
                    className={`badge badge-${selectedRequest.status === "PENDING" ? "warning" : selectedRequest.status === "COMPLETED" ? "success" : selectedRequest.status === "APPROVED" ? "info" : "gray"}`}
                  >
                    {selectedRequest.status}
                  </span>
                </p>
              </div>

              <div
                style={{
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textTransform: "uppercase",
                  }}
                >
                  Số tiền
                </label>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "20px",
                    fontWeight: "700",
                    color: "var(--primary)",
                  }}
                >
                  {formatPrice(selectedRequest.requestedAmount || 0)}
                </p>
              </div><div
                style={{
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textTransform: "uppercase",
                  }}
                >
                  Chủ tài khoản
                </label>
                <p style={{ margin: "8px 0 0", fontSize: "14px" }}>
                  {selectedRequest.accountHolder || "-"}
                </p>
              </div>

              <div
                style={{
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textTransform: "uppercase",
                  }}
                >
                  Ngân hàng
                </label>
                <p style={{ margin: "8px 0 0", fontSize: "14px" }}>
                  {selectedRequest.bankName || "-"}
                </p>
              </div>

              <div
                style={{
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textTransform: "uppercase",
                  }}
                >
                  Số tài khoản
                </label>
                <p
                  style={{
                    margin: "8px 0 0",
                    fontSize: "14px",
                    fontFamily: "monospace",
                  }}
                >
                  {selectedRequest.bankAccount || "-"}
                </p>
              </div>

              <div
                style={{
                  paddingBottom: "16px",
                  borderBottom: "1px solid var(--border-color)",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textTransform: "uppercase",
                  }}
                >
                  Ngày tạo
                </label>
                <p style={{ margin: "8px 0 0", fontSize: "14px" }}>
                  {selectedRequest.createdAt
                    ? new Date(selectedRequest.createdAt).toLocaleString(
                        "vi-VN",
                      )
                    : "-"}
                </p>
              </div>

              {selectedRequest.approvedAt && (
                <div
                  style={{
                    paddingBottom: "16px",
                    borderBottom: "1px solid var(--border-color)",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      textTransform: "uppercase",
                    }}
                  >
                    Ngày xử lý
                  </label>
                  <p style={{ margin: "8px 0 0", fontSize: "14px" }}>
                    {new Date(selectedRequest.approvedAt).toLocaleString(
                      "vi-VN",
                    )}
                  </p>
                </div>
              )}

              {selectedRequest.rejectReason && (
                <div
                  style={{
                    padding: "12px",
                    background: "#fee",
                    borderRadius: "8px",
                    borderLeft: "4px solid #e74c3c",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      color: "#c0392b",
                      textTransform: "uppercase",
                      fontWeight: "600",
                    }}
                  >
                    Lý do từ chối
                  </label>
                  <p
                    style={{
                      margin: "8px 0 0",
                      fontSize: "14px",
                      color: "#c0392b",
                    }}
                  >
                    {selectedRequest.rejectReason}
                  </p>
                </div>
              )}
            </div>

            <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
              {selectedRequest.status === "PENDING" &&
                selectedRequest.type === "EARNINGS" && (
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    setShowDetailModal(false);
                    handleCancel(selectedRequest.id);
                  }}
                  style={{ flex: 1 }}
                >
                  Hủy yêu cầu
                </button>
              )}
              <button
                className="btn btn-outline"
                onClick={() => setShowDetailModal(false)}
                style={{ flex: 1 }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorRevenuePage;