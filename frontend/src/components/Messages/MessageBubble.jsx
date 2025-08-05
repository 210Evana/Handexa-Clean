import React from "react";
import "./Messages.css";


const MessageBubble = ({ message, isOwn, name }) => {
  const bubbleClass = isOwn ? "message-bubble own" : "message-bubble";

  // Format date function
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className={bubbleClass}>
      <div className="username">{name}</div>
      <p className="message-content">{message.message}</p>
      <span className="message-time">{formatDate(message.createdAt)}</span>
    </div>
  );
};

export default MessageBubble;