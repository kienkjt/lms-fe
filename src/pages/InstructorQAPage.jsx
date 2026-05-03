import React from "react";
import { FaComments, FaServer } from "react-icons/fa";

const InstructorQAPage = () => {
  return (
    <div className="dashboard-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1>Hỏi & Đáp</h1>
          <p>Theo dõi và phản hồi câu hỏi của học viên trong khóa học.</p>
        </div>
      </div>

      <div className="card">
        <div
          className="card-body"
          style={{
            minHeight: "320px",
            display: "grid",
            placeItems: "center",
            textAlign: "center",
          }}
        >
          <div style={{ maxWidth: "520px" }}>
            <div className="empty-state-icon" style={{ margin: "0 auto 18px" }}>
              <FaComments size={44} />
            </div>
            <h3 style={{ marginBottom: "10px" }}>Chưa có dữ liệu hỏi đáp</h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
              Frontend đã có trang cho mục này, nhưng backend hiện chưa có API
              hoặc controller riêng cho Hỏi & Đáp. Cần bổ sung API câu hỏi,
              phản hồi và danh sách theo khóa học trước khi trang này có thể
              hiển thị dữ liệu thật.
            </p>
            <div
              style={{
                marginTop: "18px",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                color: "var(--text-tertiary)",
                fontSize: "13px",
                fontWeight: 600,
              }}
            >
              <FaServer /> Chưa tìm thấy API Q&A trong project BE
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorQAPage;
