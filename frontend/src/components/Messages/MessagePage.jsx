import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { Context } from "../../main";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import MessageBubble from "./MessageBubble";
import { FaArrowLeft, FaPaperPlane, FaComments } from "react-icons/fa";
import "./Messages.css";

/* ─────────────────────────────────────────────────────────────────────────────
   SOCKET  (module-level singleton so it isn't recreated on every render)
   We pass userId via auth so the server's presence map (roomUsers) can track
   who is in each room without a separate event.
───────────────────────────────────────────────────────────────────────────── */
let _userId = null; // set once user is known (see useEffect below)

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket"],
  auth: (cb) => cb({ userId: _userId }),
});

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────────────────────────────────────── */
const initials = (name) =>
  name
    ? name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : "?";

const groupByDate = (messages) => {
  const groups = {};
  messages.forEach((msg) => {
    const d = msg.createdAt ? new Date(msg.createdAt) : new Date();
    const today     = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    let label;
    if (d.toDateString() === today.toDateString())          label = "Today";
    else if (d.toDateString() === yesterday.toDateString()) label = "Yesterday";
    else label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

    if (!groups[label]) groups[label] = [];
    groups[label].push(msg);
  });
  return groups;
};

/* ─────────────────────────────────────────────────────────────────────────────
   COMPONENT
───────────────────────────────────────────────────────────────────────────── */
const MessagePage = () => {
  const { applicationId } = useParams();
  const { user }          = useContext(Context);
  const navigateTo        = useNavigate();

  const [messages,        setMessages]        = useState([]);
  const [newMessage,      setNewMessage]       = useState("");
  const [application,     setApplication]      = useState(null);
  const [loadingMessages, setLoadingMessages]  = useState(true);
  const [loadingApp,      setLoadingApp]       = useState(true);
  const [appError,        setAppError]         = useState(false);
  const [sending,         setSending]          = useState(false);

  // ── Presence & typing state ──
  const [otherOnline,     setOtherOnline]      = useState(false);
  const [otherTyping,     setOtherTyping]      = useState(false);
  const [otherTypingName, setOtherTypingName]  = useState("");

  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  const typingTimer    = useRef(null);

  const isEmployer = user?.role === "Employer";
  const roleClass  = isEmployer ? "employer" : "seeker";

  /* ── Keep module-level _userId in sync so socket.auth sends it ── */
  useEffect(() => {
    if (user?._id) _userId = user._id.toString();
  }, [user?._id]);

  /* ── Scroll to bottom whenever messages or typing indicator changes ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, otherTyping]);

  /* ─────────────────────────────────────────────────────────────────
     FETCH: messages on load
  ───────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;

    axios
      .get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/message/${applicationId}`,
        { withCredentials: true }
      )
      .then(({ data }) => {
        setMessages(data.messages || []);
        // Mark everything as read as soon as we open the chat
        callMarkRead();
      })
      .catch(() => toast.error("Failed to load messages"))
      .finally(() => setLoadingMessages(false));
  }, [applicationId, user]);

  /* ─────────────────────────────────────────────────────────────────
     FETCH: application details (for header names / job title)
  ───────────────────────────────────────────────────────────────── */
  useEffect(() => {
    axios
      .get(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/application/${applicationId}`,
        { withCredentials: true }
      )
      .then(({ data }) => setApplication(data.application))
      .catch((err) => {
        setAppError(true);
        toast.error(
          err.response?.status === 403
            ? "Not authorised to view this application"
            : "Application not found"
        );
      })
      .finally(() => setLoadingApp(false));
  }, [applicationId]);

  /* ─────────────────────────────────────────────────────────────────
     SOCKET: all real-time events
  ───────────────────────────────────────────────────────────────── */
  useEffect(() => {
    if (!user) return;

    // Join the socket room for this application
    socket.emit("joinRoom", applicationId);

    /* ── Someone came online ── */
    socket.on("userOnline", ({ userId }) => {
      if (userId?.toString() !== user._id?.toString()) setOtherOnline(true);
    });

    /* ── Someone went offline / disconnected ── */
    socket.on("userOffline", ({ userId }) => {
      if (userId?.toString() !== user._id?.toString()) setOtherOnline(false);
    });

    /* ── Snapshot of who's already in the room when we join ── */
    socket.on("roomPresence", ({ onlineUsers }) => {
      const othersOnline = onlineUsers.some(
        (id) => id?.toString() !== user._id?.toString()
      );
      setOtherOnline(othersOnline);
    });

    /* ── New message arrives ── */
    socket.on("receiveMessage", (msg) => {
      if (msg.applicationId?.toString() === applicationId) {
        setMessages((prev) => [...prev, msg]);
        // If we're looking at the chat right now, mark it read immediately
        if (document.hasFocus()) callMarkRead();
      }
    });

    /* ── Our "sent" messages upgraded to "delivered" ──
         Fires when the recipient joins the room.
         Updates tick from single grey → double grey. ── */
    socket.on("messagesDelivered", ({ applicationId: roomId }) => {
      if (roomId?.toString() === applicationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender?._id?.toString() === user._id?.toString() && m.status === "sent"
              ? { ...m, status: "delivered" }
              : m
          )
        );
      }
    });

    /* ── Our messages upgraded to "read" ──
         Fires when the recipient calls markRead (opens / focuses chat).
         Updates tick from double grey → double coloured. ── */
    socket.on("messagesRead", ({ applicationId: roomId }) => {
      if (roomId?.toString() === applicationId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender?._id?.toString() === user._id?.toString()
              ? { ...m, status: "read" }
              : m
          )
        );
      }
    });

    /* ── Typing indicator ── */
    socket.on("userTyping", ({ userId, userName }) => {
      if (userId?.toString() !== user._id?.toString()) {
        setOtherTyping(true);
        setOtherTypingName(userName || "");
      }
    });
    socket.on("userStopTyping", ({ userId }) => {
      if (userId?.toString() !== user._id?.toString()) {
        setOtherTyping(false);
        setOtherTypingName("");
      }
    });

    return () => {
      socket.emit("leaveRoom", applicationId);
      socket.off("userOnline");
      socket.off("userOffline");
      socket.off("roomPresence");
      socket.off("receiveMessage");
      socket.off("messagesDelivered");
      socket.off("messagesRead");
      socket.off("userTyping");
      socket.off("userStopTyping");
    };
  }, [applicationId, user]);

  /* ── Mark read when the browser tab regains focus ── */
  useEffect(() => {
    const onFocus = () => callMarkRead();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [applicationId]);

  /* ─────────────────────────────────────────────────────────────────
     HTTP: mark messages as read
     PUT /api/v1/message/read/:applicationId
     The controller updates the DB then emits "messagesRead" via socket
     so the sender's ticks turn coloured.
  ───────────────────────────────────────────────────────────────── */
  const callMarkRead = () => {
    if (!applicationId || !user) return;
    axios
      .put(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/message/read/${applicationId}`,
        {},
        { withCredentials: true }
      )
      .catch(() => {
        // Non-critical — silently ignore
      });
  };

  /* ─────────────────────────────────────────────────────────────────
     TYPING: emit socket events while the user types
  ───────────────────────────────────────────────────────────────── */
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    // Tell the other person we're typing
    socket.emit("typing", { applicationId, userName: user?.name });

    // Stop typing signal after 1.5s of inactivity
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => {
      socket.emit("stopTyping", { applicationId });
    }, 1500);
  };

  /* ─────────────────────────────────────────────────────────────────
     SEND: HTTP POST only
     Your controller already calls io.to(room).emit("receiveMessage")
     after saving, so we do NOT emit via socket here — avoids duplicates.
  ───────────────────────────────────────────────────────────────── */
  const handleSend = async (e) => {
    e?.preventDefault();
    const text = newMessage.trim();
    if (!text || sending) return;

    // Stop typing indicator immediately on send
    clearTimeout(typingTimer.current);
    socket.emit("stopTyping", { applicationId });

    setSending(true);
    setNewMessage(""); // optimistic clear

    try {
      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/api/v1/message/send`,
        { applicationId, message: text },
        { withCredentials: true }
      );
      // The "receiveMessage" socket event fired by the server adds it to state.
      // No manual setMessages needed here.
    } catch (err) {
      const status = err.response?.status;
      if (status === 401)      toast.error("Please log in to send messages");
      else if (status === 403) toast.error("Not authorised");
      else if (status === 404) toast.error("Application not found");
      else                     toast.error("Failed to send message");
      setNewMessage(text); // restore on failure
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend(e);
    }
  };

  if (!user) return null;

  /* ── Display names for header ── */
  const myName    = user.name || "You";
  const otherName = application
    ? isEmployer
      ? application.name || "Applicant"
      : application.employer?.name || application.user?.name || "Employer"
    : "…";

  const jobTitle      = application?.jobId?.title || "";
  const messageGroups = groupByDate(messages);

  /* ─────────────────────────────────────────────────────────────────
     RENDER
  ───────────────────────────────────────────────────────────────── */
  return (
    <div className={`msg-root ${roleClass}`}>

      {/* ══ HEADER ══ */}
      <div className="msg-header">
        <div className="msg-header-left">

          <button className="msg-back" onClick={() => navigateTo(-1)} title="Go back">
            <FaArrowLeft />
          </button>

          {/* Avatar pair — online dot sits on the other person's avatar */}
          <div className="msg-avatar-pair">
            <div className="msg-avatar a">{initials(myName)}</div>
            <div className="msg-avatar b">
              {initials(otherName)}
              <span className={`msg-online-ring ${otherOnline ? "active" : "offline"}`} />
            </div>
          </div>

          <div className="msg-header-info">
            {loadingApp ? (
              <span className="msg-header-title" style={{ opacity: 0.4 }}>Loading…</span>
            ) : appError ? (
              <span className="msg-header-title" style={{ color: "#f87171" }}>Unavailable</span>
            ) : (
              <>
                <span className="msg-header-title">{myName} &amp; {otherName}</span>
                <span
                  className={`msg-header-sub ${
                    otherTyping   ? "is-typing" :
                    otherOnline   ? "is-online"  : ""
                  }`}
                >
                  <span className="msg-header-dot" />
                  {otherTyping
                    ? `${otherTypingName || otherName} is typing…`
                    : otherOnline
                    ? "Online now"
                    : jobTitle || "Application Chat"}
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

      {/* ══ ERROR BANNER ══ */}
      {appError && (
        <div className="msg-error-banner">
          You are not authorised to view this conversation.
        </div>
      )}

      {/* ══ CHAT AREA ══ */}
      <div className="msg-chat-area">
        {loadingMessages ? (
          <div className="msg-center-state">
            <div className="msg-loading-dots"><span /><span /><span /></div>
          </div>

        ) : messages.length === 0 && !otherTyping ? (
          <div className="msg-center-state">
            <div className="msg-center-icon"><FaComments /></div>
            <p className="msg-center-text">No messages yet.</p>
            <p className="msg-center-hint">Send a message to start the conversation.</p>
          </div>

        ) : (
          <>
            {Object.entries(messageGroups).map(([date, msgs]) => (
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
            ))}

            {/* Typing indicator bubble */}
            {otherTyping && (
              <div className="msg-typing-row">
                <div className="msg-typing-bubble">
                  <span className="msg-typing-dot" />
                  <span className="msg-typing-dot" />
                  <span className="msg-typing-dot" />
                </div>
                <span style={{ fontSize: "0.72rem", color: "var(--text-muted)" }}>
                  {otherTypingName || otherName} is typing
                </span>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ══ FOOTER ══ */}
      <div className="msg-footer">
        <div className="msg-input-row">
          <input
            ref={inputRef}
            className="msg-input"
            type="text"
            placeholder="Type a message…"
            value={newMessage}
            onChange={handleInputChange}
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
