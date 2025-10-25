'use client'
import { useParams } from "next/navigation";
import LeftSideMessage from "../../../components/message/leftSide";
import { useState, useRef, useEffect } from "react";

interface ChatMessage {
  text: string;
  sender: "me" | "other";
  time: string;
}

const UserMessagePage = () => {
  const { id } = useParams();
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { text: "Hey! How are you?", sender: "other", time: "10:00 AM" },
    { text: "I’m good, what about you?", sender: "me", time: "10:02 AM" },
    { text: "Can you help me with React hooks?", sender: "other", time: "10:05 AM" },
    { text: "Sure! Let's go through it.", sender: "me", time: "10:06 AM" },
     { text: "Hey! How are you?", sender: "other", time: "10:00 AM" },
    { text: "I’m good, what about you?", sender: "me", time: "10:02 AM" },
    { text: "Can you help me with React hooks?", sender: "other", time: "10:05 AM" },
    { text: "Sure! Let's go through it.", sender: "me", time: "10:06 AM" },
  ]);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handleSend = () => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { text: message, sender: "me", time: getCurrentTime() },
    ]);
    setMessage("");
  };

  const handleGenerateSession = () => {
    alert(`Session generated for User ID: ${id}`);
  };

  return (
    <div className="flex gap-6 bg-white mt-20 max-w-6xl mx-auto">
      {/* Sidebar */}
      <LeftSideMessage />

      {/* Chat container (full height flex) */}
      <div className="flex-1 border rounded-lg shadow-sm flex flex-col h-[calc(95vh-5rem)]">
        {/* Header - fixed */}
        <div className="p-4 border-b bg-white">
          <h1 className="text-xl font-semibold">
            Chat with User ID: {id}
          </h1>
        </div>

        {/* Messages (scrollable only here) */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto hide-scrollbar  p-4 space-y-3 bg-white"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[70%] ${
                  msg.sender === "me"
                    ? "bg-black text-white rounded-br-none"
                    : "bg-gray-200 text-black rounded-bl-none"
                }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`text-xs mt-1 block ${
                    msg.sender === "me" ? "text-gray-300" : "text-gray-600"
                  }`}
                >
                  {msg.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Input - fixed at bottom */}
        <div className="p-4 border-t flex gap-2 bg-white">
          <input
            type="text"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black"
          />
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Send
          </button>
          <button
            onClick={handleGenerateSession}
            className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          >
            Generate Session
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserMessagePage;
