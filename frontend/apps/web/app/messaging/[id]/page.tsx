'use client'

import LeftSideMessage from "../../../components/message/leftSide";
import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { ChatAPI } from "../../../services/api"; // your API service
import toast from "react-hot-toast";
import Image from "next/image";

interface ChatMessage {
  text: string;
  sender: "me" | "other";
  time: string;
}

interface User {
  id:string;
  _id: string;
  name: string;
  imageUrl?: string;
  domain?: string;
  createdAt?:any
}

const UserMessagePage = () => {
  const params = useParams();
  const userId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatUser, setChatUser] = useState<User | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [users, setUsers] = useState<User[]>([]); // all chats
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Fetch all chats (sidebar)
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const res = await ChatAPI.getAllChats(); // GET /chat
        const chats = res.data;

        // Map chats to users for sidebar
        const usersList: User[] = chats.map((chat: any) => {
          const user = chat.user; // backend already gives the other user
          return {
            id: user._id,
            name: user.name,
            domain: user.domain || "No domain",
            imageUrl: user.imageUrl,
            collegeName: user.collegeName,
            lastMessage: chat.lastMessage,
            lastMessageAt: chat.lastMessageAt,
          };
        });

        setUsers(usersList);

        // Optionally, preselect user if userId is in URL
        if (userId) {
          const preselect = usersList.find((u) => u.id === userId);
          if (preselect) setSelectedUser(preselect);
        }
      } catch (err) {
        console.error("Error fetching chats:", err);
        toast.error("Failed to load chats");
      }
    };

    fetchChats();
  }, [userId]);

  // Fetch messages and other user info
  useEffect(() => {
    if (!userId) return;

    const fetchMessages = async () => {
      try {
        console.log("user", userId)
        const res = await ChatAPI.getMessages(userId);
        const data = res.data;

        // Store other user info
        if (data.user) {
          setChatUser(data.user);
        }

        // Map messages to frontend format
        if (data.messages) {
          const formattedMessages = data.messages.map((msg: any) => ({
            text: msg.message,
            sender: msg.sender._id === userId ? "other" : "me",
            time: new Date(msg.sentAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }),
          }));
          setMessages(formattedMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
        toast.error("Failed to fetch messages");
      }
    };

    fetchMessages();
  }, [userId]);

  // Get current time string
  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Send message to backend
  const handleSend = async () => {
    if (!message.trim() || !userId) return;

    try {
      await ChatAPI.sendMessage(userId, message);

      // Add to local state immediately
      setMessages((prev) => [
        ...prev,
        { text: message, sender: "me", time: getCurrentTime() },
      ]);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };

    const handleSelectUser = async (user: User) => {
      setSelectedUser(user);
      try {
        const res = await ChatAPI.getMessages(user.id); // GET /chat/messages/:userId
        const chatMessages = res.data.messages || []; // backend returns { messages: [...], user: {...} }
  
        const formattedMessages: ChatMessage[] = chatMessages.map((msg: any) => ({
          text: msg.message,
          sender: msg.sender._id === user.id ? "other" : "me",
          time: new Date(msg.sentAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }));
  
        setMessages(formattedMessages);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setMessages([]);
      }
    };

  const handleGenerateSession = () => {
    if (!userId) return;
    alert(`Session generated for User ID: ${userId}`);
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
                  className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors duration-200 ${selectedUser?.id === user.id ? "bg-gray-50" : "hover:bg-gray-100"
                    }`}
                  onClick={() => handleSelectUser(user)} // select chat
                >
                  {/* User avatar */}
                  <div className="relative flex-shrink-0">
                    {user.imageUrl && (
                      <Image
                        src={user.imageUrl}
                        alt={user.name}
                        width={50}
                        height={50}
                        className="rounded-full object-cover border-2 border-gray-200"
                      />
                    )}
                  </div>

                  {/* User info */}
                  <div className="flex flex-col overflow-hidden">
                    <p className="font-semibold text-gray-900 truncate">{user.name}</p>
                    <p className="text-sm text-gray-500 truncate">@{user.domain}</p>
                    {user.createdAt && (
                      <p className="text-xs text-gray-400 truncate">{user.createdAt}</p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Chat container */}
      <div className="flex-1 border rounded-lg shadow-sm flex flex-col h-[calc(95vh-5rem)]">
        {/* Header */}
        <div className="p-4 border-b bg-white flex items-center gap-3">
          {chatUser?.imageUrl && (
            <img
              src={chatUser.imageUrl}
              alt={chatUser.name}
              className="w-8 h-8 rounded-full object-cover"
            />
          )}
          <h1 className="text-xl font-semibold">
            Chat with {chatUser?.name || "User"}
          </h1>
        </div>

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto hide-scrollbar p-4 space-y-3 bg-white"
        >
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`px-4 py-2 rounded-lg max-w-[70%] ${msg.sender === "me"
                  ? "bg-black text-white rounded-br-none"
                  : "bg-gray-200 text-black rounded-bl-none"
                  }`}
              >
                <p>{msg.text}</p>
                <span
                  className={`text-xs mt-1 block ${msg.sender === "me" ? "text-gray-300" : "text-gray-600"
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
      </div>
    </div>
  );
};

export default UserMessagePage;
