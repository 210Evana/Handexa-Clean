import React from "react";
// CSS imported in parent MessagePage

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
      {!isOwn && <span className="msg-sender-name">{name}</span>}
      <div className={`msg-bubble ${isOwn ? "own" : "other"}`}>
        <p className="msg-bubble-text">{message.message}</p>
        <div className="msg-bubble-meta">
          <span className="msg-bubble-time">{formatTime(message.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
