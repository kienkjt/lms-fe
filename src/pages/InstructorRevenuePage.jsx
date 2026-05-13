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
      toast.error("KhĂ´ng thá»ƒ táº£i dá»¯ liá»‡u");
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
      toast.error("Vui lĂ²ng nháº­p sá»‘ tiá»n muá»‘n rĂºt");
      return false;
    }

    if (!validateWithdrawalAmount(requestedAmount, wallet?.availableBalance)) {
      if (Number(requestedAmount) > wallet?.availableBalance) {
        toast.error(
          `Sá»‘ tiá»n khĂ´ng Ä‘Æ°á»£c vÆ°á»£t quĂ¡ ${formatPrice(wallet?.availableBalance || 0)}`,
        );
      } else {
        toast.error("Vui lĂ²ng nháº­p sá»‘ tiá»n há»£p lá»‡");
      }
      return false;
    }

    if (!validateRequired(accountHolder)) {
      toast.error("Vui lĂ²ng nháº­p tĂªn chá»§ tĂ i khoáº£n");
      return false;
    }

    if (!validateRequired(bankName)) {
      toast.error("Vui lĂ²ng nháº­p tĂªn ngĂ¢n hĂ ng");
      return false;
    }

    if (!validateRequired(bankAccount)) {
      toast.error("Vui lĂ²ng nháº­p sá»‘ tĂ i khoáº£n");
      return false;
    }

    if (!validateBankAccount(bankAccount)) {
      toast.error("Sá»‘ tĂ i khoáº£n pháº£i lĂ  9-20 chá»¯ sá»‘");
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

      toast.success("Táº¡o yĂªu cáº§u rĂºt tiá»n thĂ nh cĂ´ng");
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
        error.response?.data?.message || "KhĂ´ng thá»ƒ táº¡o yĂªu cáº§u rĂºt tiá»n",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (requestId) => {
    if (!window.confirm("Báº¡n cĂ³ cháº¯c muá»‘n há»§y yĂªu cáº§u rĂºt tiá»n nĂ y?")) return;

    try {
      setCancelingId(requestId);
      await withdrawalService.cancelRequest(requestId);
      toast.success("ÄĂ£ há»§y yĂªu cáº§u");
      await loadData(currentPage);
    } catch (error) {
      console.error("Cancel withdrawal failed:", error);
      toast.error(error.response?.data?.message || "KhĂ´ng thá»ƒ há»§y yĂªu cáº§u");
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
          <h1 style={{ margin: 0 }}>Doanh thu & RĂºt tiá»n</h1>
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
                  Sá» DÆ¯ HIá»†N Táº I
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700" }}>
                {formatPrice(wallet.availableBalance || wallet.currentBalance || 0)}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                Sáºµn sĂ ng Ä‘á»ƒ rĂºt tiá»n (kháº£ dá»¥ng)
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
                  Tá»”NG DOANH THU
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700" }}>
                {formatPrice(wallet.totalEarned || 0)}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                Tá»« Ä‘áº§u
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
                  TIá»€N CHá»œ RELEASE (7 NGĂ€Y)
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700" }}>
                {formatPrice(wallet.pendingBalance || 0)}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                Tá»± Ä‘á»™ng Ä‘Æ°á»£c cá»™ng láº¡i sau 7 ngĂ y
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
                  CHá»œ PHĂ DUYá»†T RĂT
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
                  Tá»”NG ÄĂƒ RĂT
                </span>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "700" }}>
                {formatPrice(wallet.totalWithdrawn || 0)}
              </div>
              <div style={{ fontSize: "12px", opacity: 0.8, marginTop: "4px" }}>
                ThĂ nh cĂ´ng
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Withdrawal Request Form */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Táº¡o yĂªu cáº§u rĂºt tiá»n</h2>
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
                placeholder="LĂ½ do rĂºt tiá»n (tĂ¹y chá»n)"
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
              placeholder="Sá»‘ tiá»n muá»‘n rĂºt"
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
              placeholder="TĂªn chá»§ tĂ i khoáº£n"
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
              placeholder="TĂªn ngĂ¢n hĂ ng"
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
              placeholder="Sá»‘ tĂ i khoáº£n"
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
            {submitting ? "Äang gá»­i..." : "Gá»­i yĂªu cáº§u rĂºt tiá»n"}
          </button>
        </form>
      </div>

      {/* Withdrawal Requests History */}
      <div className="dashboard-section">
        <div className="section-header">
          <h2>Lá»‹ch sá»­ yĂªu cáº§u rĂºt tiá»n</h2>
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
              <p>ChÆ°a cĂ³ yĂªu cáº§u rĂºt tiá»n nĂ o</p>
            </div>
          ) : (
            <>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Tráº¡ng thĂ¡i</th>
                    <th>NgĂ y táº¡o</th>
                    <th>Sá»‘ tiá»n</th>
                    <th>NgĂ¢n hĂ ng</th>
                    <th>Thao tĂ¡c</th>
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
                            Chi tiáº¿t
                          </button>
                          {request.status === "PENDING" &&
                            request.type === "EARNINGS" && (
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => handleCancel(request.id)}
                              disabled={cancelingId === request.id}
                            >
                              {cancelingId === request.id ? "Äang..." : "Há»§y"}
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
              <h2 style={{ margin: 0 }}>Chi tiáº¿t yĂªu cáº§u</h2>
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
                  MĂ£ yĂªu cáº§u
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
                  Tráº¡ng thĂ¡i
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
                  Sá»‘ tiá»n
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
                  Chá»§ tĂ i khoáº£n
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
                  NgĂ¢n hĂ ng
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
                  Sá»‘ tĂ i khoáº£n
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
                  NgĂ y táº¡o
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
                    NgĂ y xá»­ lĂ½
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
                    LĂ½ do tá»« chá»‘i
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
                  Há»§y yĂªu cáº§u
                </button>
              )}
              <button
                className="btn btn-outline"
                onClick={() => setShowDetailModal(false)}
                style={{ flex: 1 }}
              >
                ÄĂ³ng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorRevenuePage;

