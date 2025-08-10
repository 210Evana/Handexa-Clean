import React, { useEffect, useState, useContext, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { Context } from "../../main";
import toast from "react-hot-toast";
import { io } from "socket.io-client";
import MessageBubble from "./MessageBubble";
import "./Messages.css";


const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket"],
});


const MessagePage = () => {
  const { applicationId } = useParams();
  const { user } = useContext(Context);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [application, setApplication] = useState(null);
  const [isLoadingMessages, setIsLoadingMessages] = useState(true); // Start as true
  const [isLoadingApplication, setIsLoadingApplication] = useState(true); // Start as true
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchMessages = async () => {
      setIsLoadingMessages(true); // Set loading state
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/message/${applicationId}`, {
          withCredentials: true,
        });
        //console.log("Messages received:", data.messages);
        setMessages(data.messages );

      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to load messages: " + error.message);
      } finally {
        setIsLoadingMessages(false);
      }
    };
    fetchMessages();

    socket.emit("joinRoom", applicationId);

    socket.on("receiveMessage", (msg) => {
      if (msg.applicationId.toString() === applicationId) {
        console.log("Received message:", msg);
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.emit("leaveRoom", applicationId);
      socket.off("receiveMessage");
    };
  }, [applicationId]);

  useEffect(() => {
    const fetchApplicationDetails = async () => {
    setIsLoadingApplication(true); // Set loading state
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/v1/application/${applicationId}`, {
          withCredentials: true,
        });
        //console.log("Application received:", res.data.application);
        setApplication(res.data.application);
      } catch (error) {
        console.error("Error fetching application:", error);
        toast.error("Failed to load application info");
      } finally {
        setIsLoadingApplication(false);
      }
    };
    fetchApplicationDetails();
  }, [applicationId]);

 const handleSend = async (e) => {
  e.preventDefault();
  if (!newMessage.trim()) {
    toast.error("Message cannot be empty");
    return;
  }
  try {
    console.log("Sending message:", { applicationId, message: newMessage });
    const response = await axios.post(
      `${import.meta.env.VITE_BACKEND_URL}/api/v1/message/send`,
      { applicationId, message: newMessage },
      { withCredentials: true }
    );
    console.log("Message sent successfully:", response.data.newMessage);
    setNewMessage("");
  } catch (error) {
    console.error("Error sending message:", error.response || error);
    const message = error.response?.data?.message || error.message;
    if (error.response?.status === 401) {
      toast.error("Please log in to send messages");
    } else if (error.response?.status === 403) {
      toast.error("You are not authorized to send messages for this application");
    } else if (error.response?.status === 404) {
      toast.error("Application not found");
    } else {
      toast.error(`Failed to send message: ${message}`);
    }
  }
};

  if (!user) return <div>Loading user...</div>;

  return (
    <div className="message-page">
      {isLoadingApplication ? (
        <div className="loading">Loading application details...</div>
      ) : application ? (
            
         <div className="chat-header">
          <h2>Chat: {user.name} ↔ {application.user.name || "Unknown User"}</h2>
        </div>
      ):(
        <div className="error">Application not found</div>
      )}
      <div className ="chat-container">
        {isLoadingMessages ? (

          <div className="loading">Loading messages...</div>
        ) : messages.length === 0 ? (
          <div className="no-messages">No messages yet. Start the conversation!</div>
        ) : (
          <div className="messages">
            {messages.map((message, i) => (
              <MessageBubble
                key={i}
                message={message}
                isOwn={message.sender._id.toString() === user._id}
                name={message.sender.name || "Unknown"}
              />
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>
      <div className="chat-footer">
        <input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="message-input"
        />
        <button onClick={handleSend} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};

export default MessagePage;