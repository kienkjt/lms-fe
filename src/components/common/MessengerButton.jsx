import { FaFacebookMessenger } from "react-icons/fa";
import "./MessengerButton.css";

const MESSENGER_URL = "https://m.me/61584898455052";

const MessengerButton = () => {
  return (
    <a
      className="messenger-button"
      href={MESSENGER_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat qua Messenger"
      title="Chat qua Messenger"
    >
      <FaFacebookMessenger size={26} aria-hidden="true" />
    </a>
  );
};

export default MessengerButton;
