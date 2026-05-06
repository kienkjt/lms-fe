import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { dashboardService } from "../../services/dashboardService";
import { withdrawalService } from "../../services/withdrawalService";
import { ROUTES } from "../../utils/constants";
import { formatPrice } from "../../utils/helpers";
import {
  validateBankAccount,
  validateWithdrawalAmount,
  validateRequired,
} from "../../utils/validators";
import {
  FaBook,
  FaCheck,
  FaUsers,
  FaStar,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import Loading from "../../components/common/Loading";
import "./Dashboard.css";

const InstructorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [cancelingId, setCancelingId] = useState("");
  const [withdrawForm, setWithdrawForm] = useState({
    requestedAmount: "",
    accountHolder: "",
    bankName: "",
    bankAccount: "",
    reason: "",
  });
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadWithdrawalData = async () => {
    try {
      const [walletRes, requestsRes] = await Promise.all([
        withdrawalService.getWallet(),
        withdrawalService.getMyRequests({ page: 0, size: 5 }),
      ]);

      setWallet(walletRes.data || null);

      const requestData = requestsRes.data;
      const requestList = Array.isArray(requestData)
        ? requestData
        : requestData?.content || [];
      setWithdrawals(requestList);
    } catch (error) {
      console.error("Failed to load withdrawal data:", error);
    }
  };

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        dashboardService
          .getInstructorDashboard()
          .then((res) => setDashboardStats(res.data || null))
          .catch(() => setDashboardStats(null)),
        loadWithdrawalData(),
      ]).finally(() => setLoading(false));
    }
  }, [user]);

  const validateWithdrawalForm = () => {
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

  const handleWithdrawInputChange = (field, value) => {
    setWithdrawForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreateWithdrawal = async (e) => {
    e.preventDefault();

    if (!validateWithdrawalForm()) {
      return;
    }

    try {
      setSubmittingWithdrawal(true);
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
      await loadWithdrawalData();
    } catch (error) {
      console.error("Create withdrawal request failed:", error);
      toast.error(
        error.response?.data?.message || "Không thể tạo yêu cầu rút tiền",
      );
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const handleCancelWithdrawal = async (requestId) => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu rút tiền này?")) {
      return;
    }

    try {
      setCancelingId(requestId);
      await withdrawalService.cancelRequest(requestId);
      toast.success("Đã hủy yêu cầu rút tiền");
      await loadWithdrawalData();
    } catch (error) {
      console.error("Cancel withdrawal request failed:", error);
      toast.error(error.response?.data?.message || "Không thể hủy yêu cầu");
    } finally {
      setCancelingId("");
    }
  };

  const handleViewDetail = (request) => {
    setSelectedRequest(request);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedRequest(null);
  };

  const stats = [
    {
      label: "Tổng khóa học",
      value: dashboardStats?.totalCourses ?? 0,
      icon: <FaBook size={24} />,
      color: "var(--primary)",
    },
    {
      label: "Đang hoạt động",
      value: dashboardStats?.publishedCourses ?? 0,
      icon: <FaCheck size={24} />,
      color: "var(--success)",
    },
    {
      label: "Tổng học sinh",
      value: dashboardStats?.totalStudents ?? 0,
      icon: <FaUsers size={24} />,
      color: "var(--secondary)",
    },
    {
      label: "Đánh giá TB",
      value: Number(
        dashboardStats?.avgRating ?? dashboardStats?.averageRating ?? 0,
      ).toFixed(1),
      icon: <FaStar size={24} />,
      color: "var(--warning)",
    },
  ];

  if (loading) return <Loading />;

  return (
    <div className="dashboard-page instructor-dashboard-page animate-fade-in">
      <div className="welcome-banner">
        <div>
          <h1>
            Dashboard Giảng viên{" "}
            <FaStar size={28} style={{ display: "inline" }} />
          </h1>
          <p>Quản lý khóa học và theo dõi tiến độ học sinh của bạn.</p>
        </div>
        <Link
          to={ROUTES.INSTRUCTOR_CREATE_COURSE}
          className="btn btn-primary"
          style={{ background: "white", color: "var(--primary)" }}
        >
          <FaPlus style={{ marginRight: "6px" }} /> Tạo khóa học mới
        </Link>
      </div>

      <div className="stats-grid">
        {stats.map((s) => (
          <div
            key={s.label}
            className="stat-card"
            style={{ "--stat-color": s.color }}
          >
            <div className="stat-icon">{s.icon}</div>
            <div>
              <div className="stat-number">{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Withdrawal Detail Modal */}
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
          onClick={handleCloseDetailModal}
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
              <h2 style={{ margin: 0 }}>Chi tiết yêu cầu rút tiền</h2>
              <button
                onClick={handleCloseDetailModal}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "24px",
                  cursor: "pointer",
                  color: "#666",
                }}
              >
                <FaTimes />
              </button>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              <div
                style={{
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "16px",
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
                    margin: "4px 0 0 0",
                    fontSize: "16px",
                    fontWeight: "600",
                  }}
                >
                  {selectedRequest.id}
                </p>
              </div>

              <div
                style={{
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "16px",
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
                <p style={{ margin: "4px 0 0 0" }}>
                  <span
                    className={`badge ${selectedRequest.status === "PENDING" ? "badge-warning" : selectedRequest.status === "COMPLETED" ? "badge-success" : selectedRequest.status === "APPROVED" ? "badge-info" : "badge-gray"}`}
                  >
                    {selectedRequest.status}
                  </span>
                </p>
              </div>

              <div
                style={{
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "16px",
                }}
              >
                <label
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    textTransform: "uppercase",
                  }}
                >
                  Số tiền yêu cầu
                </label>
                <p
                  style={{
                    margin: "4px 0 0 0",
                    fontSize: "18px",
                    fontWeight: "700",
                    color: "var(--success)",
                  }}
                >
                  {formatPrice(selectedRequest.requestedAmount || 0)}
                </p>
              </div>

              <div
                style={{
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "16px",
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
                <p style={{ margin: "4px 0 0 0", fontSize: "16px" }}>
                  {selectedRequest.accountHolder || "-"}
                </p>
              </div>

              <div
                style={{
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "16px",
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
                <p style={{ margin: "4px 0 0 0", fontSize: "16px" }}>
                  {selectedRequest.bankName || "-"}
                </p>
              </div>

              <div
                style={{
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "16px",
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
                    margin: "4px 0 0 0",
                    fontSize: "16px",
                    fontFamily: "monospace",
                  }}
                >
                  {selectedRequest.bankAccount || "-"}
                </p>
              </div>

              {selectedRequest.reason && (
                <div
                  style={{
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: "16px",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      textTransform: "uppercase",
                    }}
                  >
                    Lý do
                  </label>
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px" }}>
                    {selectedRequest.reason}
                  </p>
                </div>
              )}

              <div
                style={{
                  borderBottom: "1px solid var(--border-color)",
                  paddingBottom: "16px",
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
                <p style={{ margin: "4px 0 0 0", fontSize: "14px" }}>
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
                    borderBottom: "1px solid var(--border-color)",
                    paddingBottom: "16px",
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
                  <p style={{ margin: "4px 0 0 0", fontSize: "14px" }}>
                    {new Date(selectedRequest.approvedAt).toLocaleString(
                      "vi-VN",
                    )}
                  </p>
                </div>
              )}

              {selectedRequest.rejectReason && (
                <div
                  style={{
                    background: "#fee",
                    borderRadius: "8px",
                    padding: "12px",
                    borderLeft: "4px solid #e74c3c",
                  }}
                >
                  <label
                    style={{
                      fontSize: "12px",
                      color: "#666",
                      textTransform: "uppercase",
                    }}
                  >
                    Lý do từ chối
                  </label>
                  <p
                    style={{
                      margin: "4px 0 0 0",
                      fontSize: "14px",
                      color: "#c0392b",
                    }}
                  >
                    {selectedRequest.rejectReason}
                  </p>
                </div>
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                marginTop: "24px",
              }}
            >
              {selectedRequest.status === "PENDING" && (
                <button
                  className="btn btn-danger"
                  onClick={() => {
                    handleCloseDetailModal();
                    handleCancelWithdrawal(selectedRequest.id);
                  }}
                  style={{ flex: 1 }}
                >
                  Hủy yêu cầu
                </button>
              )}
              <button
                className="btn btn-outline"
                onClick={handleCloseDetailModal}
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

export default InstructorDashboard;
