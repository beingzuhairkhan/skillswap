'use client';

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChatAPI } from "../../services/api";

interface User {
  id: string;
  name: string;
  topic: string;
  imageUrl: string;
  collegeName?: string;
  online?: boolean;
}

interface ChatMessage {
  text: string;
  sender: "me" | "other";
  time: string;
}

const Message = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [message, setMessage] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);

  // 1️⃣ Fetch all chats (sidebar)
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await ChatAPI.getAllChats(); // GET /chat
        const chats = res.data;

        const usersList: User[] = chats.map((chat: any) => ({
          id: chat.user._id,
          name: chat.user.name,
          topic: chat.user.domain || "No domain",
          imageUrl: chat.user.imageUrl || "https://via.placeholder.com/40?text=User",
          collegeName: chat.user.collegeName,
          online: false,
        }));

        setUsers(usersList);
      } catch (err) {
        console.error("Error fetching chats:", err);
      }
    };

    fetchChats();
  }, []);

  // 2️⃣ Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // 3️⃣ Fetch messages for selected user
// Fetch messages for selected user
const handleSelectUser = async (user: User) => {
  setSelectedUser(user);
  try {
    console.log("user" , user)
    const res = await ChatAPI.getMessages(user.id); // GET /chat/messages?userId=...
    const chatMessages = res.data;
    console.log("chat", chatMessages);

    const formattedMessages: ChatMessage[] = chatMessages.map((msg: any) => ({
      text: msg.message,
      sender: msg.sender._id
        ? msg.sender._id === user.id
          ? "other"
          : "me"
        : msg.sender === user.id
        ? "other"
        : "me",
      time: new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }));

    setMessages(formattedMessages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    setMessages([]);
  }
};



  // 4️⃣ Send a new message
  const handleSend = async () => {
    if (!message.trim() || !selectedUser) return;
    try {
      await ChatAPI.sendMessage(selectedUser.id, message);
      setMessages((prev) => [
        ...prev,
        { text: message, sender: "me", time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) },
      ]);
      setMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  const handleGenerateSession = () => {
    if (selectedUser) {
      alert(`Session generated for User: ${selectedUser.name}`);
    }
  };

  return (
    <div className="flex gap-6 bg-white mt-20 max-w-6xl mx-auto">
      {/* Sidebar */}
      <div className="w-1/4">
        <div className="border rounded-lg shadow-sm bg-gray-50 p-4 h-[610px] flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Chats</h3>
          <div className="space-y-4 overflow-y-auto pr-2 hide-scrollbar">
            {users.length === 0 ? (
              <p className="text-gray-500 text-center">No chats found</p>
            ) : (
              users.map((user) => (
  <div
    key={user.id}
    className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${
      selectedUser?.id === user.id ? "bg-gray-50" : "hover:bg-gray-100"
    }`}
    onClick={() => handleSelectUser(user)}
  >
    {/* User avatar */}
    <div className="relative flex-shrink-0">
      <Image
        src={user.imageUrl || sessionImage}
        alt={user.name}
        width={50}
        height={50}
        className="rounded-full object-cover border-2 border-gray-200"
      />
      {user.online && (
        <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border border-white"></span>
      )}
    </div>

    {/* User info */}
    <div className="flex flex-col overflow-hidden">
      <p className="font-semibold text-gray-900 truncate">{user.name}</p>
      <p className="text-sm text-gray-500 truncate">@{user.topic}</p>
    </div>
  </div>
))

            )}
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 border rounded-lg shadow-sm flex flex-col h-[610px]">
        {selectedUser ? (
          <>
            {/* Header */}
            <div className="p-4 border-b bg-white flex items-center gap-3">
              <Image
                src={selectedUser.imageUrl}
                alt={selectedUser.name}
                width={40}
                height={40}
                className="rounded-full"
              />
              <h2 className="text-lg font-semibold">{selectedUser.name}</h2>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-3 bg-white hide-scrollbar"
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

            {/* Input */}
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
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <p>Select a user to start chatting</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Message;
