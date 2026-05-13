import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from "recharts";
import { dashboardService } from "../../services/dashboardService";
import { withdrawalService } from "../../services/withdrawalService";
import { ROUTES } from "../../utils/constants";
import { formatPrice } from "../../utils/helpers";
import {
  FaBook,
  FaCheck,
  FaUsers,
  FaStar,
  FaPlus,
  FaTimes,
} from "react-icons/fa";
import Loading from "../../components/common/Loading";
import InstructorReportsPage from "../../pages/InstructorReportsPage";
import "./Dashboard.css";

const normalizeSeries = (series = [], metric = "amount") =>
  (Array.isArray(series) ? series : [])
    .map((item, index) => ({
      label: item?.label || `N${index + 1}`,
      value: Number(
        metric === "count" ? (item?.count ?? 0) : (item?.amount ?? 0),
      ),
    }))
    .filter((item) => Number.isFinite(item.value));

const InstructorDashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [dashboardStats, setDashboardStats] = useState(null);
  const [wallet, setWallet] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      Promise.all([
        dashboardService.getInstructorDashboard().catch(() => ({ data: null })),
        withdrawalService.getWallet().catch(() => ({ data: null })),
      ])
        .then(([dashRes, walletRes]) => {
          setDashboardStats(dashRes.data || null);
          setWallet(walletRes.data || null);
        })
        .finally(() => setLoading(false));
    }
  }, [user]);

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
      label: "Doanh thu",
      value: formatPrice(wallet?.totalEarned ?? 0),
      icon: <FaStar size={24} />,
      color: "var(--warning)",
    },
  ];

  const statusDistribution = Array.isArray(
    dashboardStats?.courseStatusDistribution,
  )
    ? dashboardStats.courseStatusDistribution.map((item) => ({
        name: item.description || item.status,
        value: item.count ?? 0,
      }))
    : [];

  const COLORS = [
    "#0088FE",
    "#00C49F",
    "#FFBB28",
    "#FF8042",
    "#a855f7",
    "#ec4899",
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

      <div className="dashboard-section">
        <div className="section-header">
          <h2>Trạng thái khóa học</h2>
        </div>
        {statusDistribution.length === 0 ? (
          <div className="empty-state">Chưa có dữ liệu khóa học.</div>
        ) : (
          <div
            style={{
              width: "100%",
              height: 300,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, percent }) =>
                    percent > 0.05
                      ? `${name} (${(percent * 100).toFixed(0)}%)`
                      : ""
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <RechartsTooltip formatter={(value) => [value, "Số lượng"]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div style={{ marginTop: "24px" }}>
        <InstructorReportsPage disableContainer />
      </div>

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
              <h2 style={{ margin: 0 }}>Chi tiet yeu cau rut tien</h2>
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
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorDashboard;
