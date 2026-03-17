import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { getSocket } from "../lib/socket";
import axios from "axios";

const Chat = () => {
  const { taskId } = useParams();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const currentUser = localStorage.getItem("userId");

  // LOAD OLD MESSAGES
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5000/api/chat/${taskId}`
        );
        setMessages(res.data);
      } catch (err) {
        console.error("❌ Failed to load messages", err);
      }
    };

    fetchMessages();
  }, [taskId]);

  // SOCKET CONNECTION
  useEffect(() => {
    const socket = getSocket();
    socketRef.current = socket;

    // JOIN ONLY AFTER CONNECT
    socket.on("connect", () => {
      console.log("🔌 Connected, joining room:", taskId);
      socket.emit("join_task_room", taskId);
    });

    const handleMessage = (msg) => {
      console.log("📥 RECEIVED:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive_task_message", handleMessage);

    return () => {
      socket.off("receive_task_message", handleMessage);
      socket.off("connect");
    };
  }, [taskId]);

  const sendMessage = () => {
    if (!text.trim()) return;

    if (!currentUser) {
      console.error("❌ userId not set in localStorage");
      return;
    }

    
    if (!socketRef.current?.connected) {
      console.log("⏳ Wait for socket connection...");
      return;
    }

    const msgData = {
      taskId,
      senderId: currentUser,
      text,
      time: new Date().toLocaleTimeString(),
    };

    console.log("📤 SENDING:", msgData);

    socketRef.current.emit("send_task_message", msgData);

    setText("");
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ padding: 20 }}>
      <h2>Task Chat</h2>

      <div
        style={{
          height: 400,
          overflowY: "auto",
          border: "1px solid #ddd",
          padding: 10,
          marginBottom: 10,
        }}
      >
        {messages.map((m, i) => (
          <div
            key={i}
            style={{
              textAlign:
                m.senderId === currentUser ? "right" : "left",
              marginBottom: 8,
            }}
          >
            <span
              style={{
                background:
                  m.senderId === currentUser ? "#1976d2" : "#eee",
                color:
                  m.senderId === currentUser ? "#fff" : "#000",
                padding: "6px 10px",
                borderRadius: 8,
                display: "inline-block",
              }}
            >
              {m.text}
            </span>
          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type message..."
        style={{ marginRight: 10, padding: 8, width: "70%" }}
      />

      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;