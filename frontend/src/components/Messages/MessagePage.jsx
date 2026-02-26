import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import MessageBubble from "./MessageBubble";
import { FaArrowLeft, FaPaperPlane, FaComments } from "react-icons/fa";
import "./Messages.css";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket"],
});

/* ─── Helper: initials from name ─── */
const initials = (name) =>
  name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

/* ─── Helper: group messages by date ─── */
const groupByDate = (messages) => {
  const groups = {};
  messages.forEach((msg) => {
    const date = msg.createdAt
      ? new Date(msg.createdAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        })
      : "Today";
    if (!groups[date]) groups[date] = [];
    groups[date].push(msg);
  });
  return groups;
};

const MessagePage = () => {
  const { applicationId } = useParams();
  const { user } = useContext(Context);
  const navigateTo = useNavigate();

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [application, setApplication] = useState(null);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [loadingApp, setLoadingApp] = useState(true);
  const [appError, setAppError] = useState(false);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isEmployer = user?.role === "Employer";
  const roleClass = isEmployer ? "employer" : "seeker";

  /* ─── Scroll to bottom ─── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ─── Fetch messages + socket ─── */
  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/message/${applicationId}`,
          { withCredentials: true }
        );
        setMessages(data.messages || []);
      } catch (err) {
        toast.error("Failed to load messages");
      } finally {
        setLoadingMessages(false);
      }
    };
    fetchMessages();

    socket.emit("joinRoom", applicationId);
    socket.on("receiveMessage", (msg) => {
      if (msg.applicationId?.toString() === applicationId) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.emit("leaveRoom", applicationId);
      socket.off("receiveMessage");
    };
  }, [applicationId]);

  /* ─── Fetch application details ─── */
  useEffect(() => {
    const fetchApp = async () => {
      setLoadingApp(true);
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/${applicationId}`,
          { withCredentials: true }
        );
        setApplication(data.application);
      } catch (err) {
        setAppError(true);
        toast.error(
          err.response?.status === 403
            ? "Not authorised to view this application"
            : "Application not found"
        );
      } finally {
        setLoadingApp(false);
      }
    };
    fetchApp();
  }, [applicationId]);

  /* ─── Send message ─── */
  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setSending(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/message/send`,
        { applicationId, message: newMessage },
        { withCredentials: true }
      );
      setNewMessage("");
      inputRef.current?.focus();
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) toast.error("Please log in to send messages");
      else if (status === 403) toast.error("Not authorised");
      else if (status === 404) toast.error("Application not found");
      else toast.error("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (!user) return null;

  /* ─── Names / avatars ─── */
  const myName = user.name || "You";
  const otherName = application
    ? isEmployer
      ? application.name || "Applicant"
      : application.employer?.name || application.user?.name || "Employer"
    : "...";

  const jobTitle = application?.jobId?.title || "";
  const messageGroups = groupByDate(messages);

  return (
    <div className={`msg-root ${roleClass}`}>

      {/* ── HEADER ── */}
      <div className="msg-header">
        <div className="msg-header-left">
          <button className="msg-back" onClick={() => navigateTo(-1)} title="Go back">
            <FaArrowLeft />
          </button>
          <div className="msg-avatar-pair">
            <div className="msg-avatar a">{initials(myName)}</div>
            <div className="msg-avatar b">{initials(otherName)}</div>
          </div>
          <div className="msg-header-info">
            {loadingApp ? (
              <span className="msg-header-title" style={{ opacity: 0.4 }}>Loading…</span>
            ) : appError ? (
              <span className="msg-header-title" style={{ color: "#f87171" }}>Unavailable</span>
            ) : (
              <>
                <span className="msg-header-title">
                  {myName} &amp; {otherName}
                </span>
                <span className="msg-header-sub">
                  <span className="msg-status-dot" />
                  {jobTitle || "Application Chat"}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="msg-header-right">
          <span className="msg-header-badge">
            {isEmployer ? "Employer" : "Job Seeker"}
          </span>
        </div>
      </div>

      {/* ── ERROR BANNER ── */}
      {appError && (
        <div className="msg-error-banner">
          You are not authorised to view this conversation.
        </div>
      )}

      {/* ── CHAT AREA ── */}
      <div className="msg-chat-area">
        {loadingMessages ? (
          <div className="msg-center-state">
            <div className="msg-loading-dots">
              <span /><span /><span />
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="msg-center-state">
            <div className="msg-center-icon"><FaComments /></div>
            <p className="msg-center-text">No messages yet.</p>
            <p className="msg-center-hint">Send a message to start the conversation.</p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, msgs]) => (
            <React.Fragment key={date}>
              <div className="msg-date-divider">
                <span className="msg-date-label">{date}</span>
              </div>
              {msgs.map((msg, i) => (
                <MessageBubble
                  key={msg._id || i}
                  message={msg}
                  isOwn={msg.sender?._id?.toString() === user._id?.toString()}
                  name={msg.sender?.name || "Unknown"}
                />
              ))}
            </React.Fragment>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── FOOTER ── */}
      <div className="msg-footer">
        <div className="msg-input-row">
          <input
            ref={inputRef}
            className="msg-input"
            type="text"
            placeholder="Type a message…"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={appError}
          />
          <button
            className="msg-send-btn"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending || appError}
            title="Send (Enter)"
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessagePage;
