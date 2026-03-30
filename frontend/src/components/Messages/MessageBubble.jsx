import React from "react";
// CSS is imported in MessagePage — no import needed here

/**
 * Tick SVG — a single checkmark path
 * Used twice (overlapping) for the double-tick effect
 */
const TickSVG = () => (
  <svg className="msg-tick" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M1.5 6L4.5 9L10.5 3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * ReadTicks
 * status: "sent" | "delivered" | "read"
 *
 * sent      → single grey tick
 * delivered → double grey tick
 * read      → double accent-coloured tick
 */
const ReadTicks = ({ status = "sent" }) => (
  <div className={`msg-ticks ${status}`} title={status}>
    <TickSVG />
    <TickSVG />
  </div>
);

const MessageBubble = ({ message, isOwn, name }) => {
  const formatTime = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`msg-bubble-group ${isOwn ? "own" : "other"}`}>
      {/* Show sender name only for received messages */}
      {!isOwn && <span className="msg-sender-name">{name}</span>}

      <div className={`msg-bubble ${isOwn ? "own" : "other"}`}>
        <p className="msg-bubble-text">{message.message}</p>

        <div className="msg-bubble-meta">
          <span className="msg-bubble-time">{formatTime(message.createdAt)}</span>
          {/* Only own messages get ticks */}
          {isOwn && <ReadTicks status={message.status || "sent"} />}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
