import { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import {
  FiMessageCircle,
  FiMinimize2,
  FiRefreshCw,
  FiSend,
  FiX,
} from "react-icons/fi";
import { learningAssistantService } from "../../services/learningAssistantService";
import { ROUTES } from "../../utils/constants";
import { getDisplayName } from "../../utils/helpers";
import "./LearningAssistant.css";

const MAX_CONTEXT_LENGTH = 5000;
const MAX_HISTORY_ITEMS = 6;

const HIDDEN_PATHS = new Set([
  ROUTES.LOGIN,
  ROUTES.REGISTER,
  ROUTES.FORGOT_PASSWORD,
  ROUTES.RESET_PASSWORD,
  ROUTES.VERIFY_OTP,
]);

const starterMessages = [
  {
    id: "assistant-welcome",
    role: "assistant",
    content:
      "Xin chào, mình là trợ lý học tập AI. Bạn có thể hỏi về nội dung khóa học, bài học hiện tại hoặc lộ trình học tiếp theo.",
  },
];

const quickPrompts = [
  "Tóm tắt nội dung trang này",
  "Giải thích phần khó hiểu",
  "Gợi ý bài học tiếp theo",
];

const normalizeText = (value) =>
  String(value || "")
    .replace(/\s+/g, " ")
    .trim();

const getElementText = (selector) => {
  const element = document.querySelector(selector);
  return normalizeText(element?.textContent);
};

const getVisiblePageText = () => {
  const bodyClone = document.body.cloneNode(true);

  bodyClone
    .querySelectorAll(
      "script, style, noscript, .learning-assistant-widget, .Toastify",
    )
    .forEach((node) => node.remove());

  return normalizeText(bodyClone.textContent).slice(0, MAX_CONTEXT_LENGTH);
};

const getPageHeadings = () =>
  Array.from(document.querySelectorAll("h1, h2, h3"))
    .map((heading) => normalizeText(heading.textContent))
    .filter(Boolean)
    .slice(0, 8);

const inferCourseName = () =>
  getElementText(".course-detail-title") ||
  getElementText(".learning-title") ||
  getElementText("h1") ||
  "LMS";

const inferCurrentLesson = () =>
  getElementText(".lesson-title") ||
  getElementText(".current-lesson-title") ||
  getElementText("h2") ||
  document.title ||
  "Trang hiện tại";

const inferProgressPercent = () => {
  const text =
    getElementText(".progress-text") ||
    getElementText(".purchase-progress-block") ||
    "";
  const match = text.match(/(\d{1,3})\s*%/);
  const value = match ? Number(match[1]) : 0;

  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.min(100, Math.max(0, value));
};

const buildContext = (history) => {
  const headings = getPageHeadings();
  const pageText = getVisiblePageText();
  const recentHistory = history
    .slice(-MAX_HISTORY_ITEMS)
    .map((message) => {
      const speaker = message.role === "user" ? "Hoc vien" : "Tro ly";
      return `${speaker}: ${message.content}`;
    })
    .join("\n");

  return [
    `Duong dan hien tai: ${window.location.pathname}`,
    document.title ? `Tieu de trinh duyet: ${document.title}` : "",
    headings.length ? `Tieu de noi dung: ${headings.join(" | ")}` : "",
    pageText ? `Noi dung trang:\n${pageText}` : "",
    recentHistory ? `Lich su hoi dap gan day:\n${recentHistory}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
};

const createMessage = (role, content, meta = {}) => ({
  id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  role,
  content,
  ...meta,
});

const LearningAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState(starterMessages);
  const [draft, setDraft] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesRef = useRef(null);
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const isHiddenPath = HIDDEN_PATHS.has(location.pathname);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages, isSending, isOpen]);

  if (!isAuthenticated || isHiddenPath) {
    return null;
  }

  const sendQuestion = async (question) => {
    const cleanQuestion = normalizeText(question);
    if (!cleanQuestion || isSending) {
      return;
    }

    const userMessage = createMessage("user", cleanQuestion);
    const nextMessages = [...messages, userMessage];
    const displayName = getDisplayName(user);

    setDraft("");
    setIsOpen(true);
    setMessages(nextMessages);
    setIsSending(true);

    try {
      const response = await learningAssistantService.ask({
        studentName: displayName || user?.email || "Hoc vien",
        courseName: inferCourseName(),
        progressPercent: inferProgressPercent(),
        currentLesson: inferCurrentLesson(),
        retrievedChunks:
          buildContext(nextMessages) ||
          "Khong co them ngu canh tu trang hien tai.",
        userQuestion: cleanQuestion,
      });

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage(
          "assistant",
          response.data?.answer ||
            "Mình chưa nhận được nội dung trả lời phù hợp từ trợ lý AI.",
        ),
      ]);
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Không thể kết nối trợ lý AI lúc này.";

      setMessages((currentMessages) => [
        ...currentMessages,
        createMessage(
          "assistant",
          `Mình chưa thể trả lời ngay bây giờ. ${errorMessage}`,
          { tone: "error" },
        ),
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    sendQuestion(draft);
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendQuestion(draft);
    }
  };

  const resetConversation = () => {
    setMessages(starterMessages);
    setDraft("");
  };

  return (
    <div className={`learning-assistant-widget ${isOpen ? "is-open" : ""}`}>
      {isOpen ? (
        <section className="learning-assistant-panel" aria-label="Trợ lý học tập AI">
          <header className="learning-assistant-header">
            <div className="learning-assistant-title">
              <span className="learning-assistant-avatar" aria-hidden="true">
                <FiMessageCircle />
              </span>
              <div>
                <strong>Trợ lý học tập</strong>
                <span>AI hỗ trợ theo ngữ cảnh LMS</span>
              </div>
            </div>
            <div className="learning-assistant-actions">
              <button
                type="button"
                className="learning-assistant-icon-btn"
                onClick={resetConversation}
                title="Làm mới hội thoại"
                aria-label="Làm mới hội thoại"
              >
                <FiRefreshCw />
              </button>
              <button
                type="button"
                className="learning-assistant-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Thu gọn"
                aria-label="Thu gọn"
              >
                <FiMinimize2 />
              </button>
              <button
                type="button"
                className="learning-assistant-icon-btn"
                onClick={() => setIsOpen(false)}
                title="Đóng"
                aria-label="Đóng"
              >
                <FiX />
              </button>
            </div>
          </header>

          <div className="learning-assistant-messages" ref={messagesRef}>
            {messages.map((message) => (
              <div
                key={message.id}
                className={`learning-assistant-message ${message.role} ${
                  message.tone || ""
                }`}
              >
                {message.content}
              </div>
            ))}
            {isSending && (
              <div className="learning-assistant-message assistant pending">
                Đang đọc ngữ cảnh và trả lời...
              </div>
            )}
          </div>

          <div className="learning-assistant-prompts">
            {quickPrompts.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => sendQuestion(prompt)}
                disabled={isSending}
              >
                {prompt}
              </button>
            ))}
          </div>

          <form className="learning-assistant-form" onSubmit={handleSubmit}>
            <textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nhập câu hỏi về bài học..."
              rows={2}
              disabled={isSending}
            />
            <button
              type="submit"
              className="learning-assistant-send"
              disabled={!normalizeText(draft) || isSending}
              title="Gửi câu hỏi"
              aria-label="Gửi câu hỏi"
            >
              <FiSend />
            </button>
          </form>
        </section>
      ) : (
        <button
          type="button"
          className="learning-assistant-launcher"
          onClick={() => setIsOpen(true)}
          aria-label="Mở trợ lý học tập AI"
          title="Mở trợ lý học tập AI"
        >
          <FiMessageCircle />
        </button>
      )}
    </div>
  );
};

export default LearningAssistant;
