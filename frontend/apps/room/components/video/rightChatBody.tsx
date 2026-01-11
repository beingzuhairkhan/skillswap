"use client";
import React, { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import SessionTimer from "./LeaveSessionWithTimer";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL!

interface Message {
  senderId: string;
  message: string;
  time: number;
  isAI?: boolean;
}

interface Props {
  roomId?: string; // optional prop
}

const RightChatBody = ({ roomId }: Props) => {
  const socketRef = useRef<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [myId, setMyId] = useState("");
  const [currentRoomId, setCurrentRoomId] = useState(roomId || "");

  useEffect(() => {
    // Generate a room ID if none provided
    if (!currentRoomId) {
      const generatedId = "room-" + Math.floor(Math.random() * 10000);
      setCurrentRoomId(generatedId);
    }
  }, [currentRoomId]);

  useEffect(() => {
    if (!currentRoomId) return;

    if (socketRef.current) return; // prevent double connect in Strict Mode

    socketRef.current = io(SOCKET_URL);

    socketRef.current.on("connect", () => {
      const id = socketRef.current?.id;
      if (!id) return;
      setMyId(id);
      socketRef.current!.emit("join-room", currentRoomId);
      console.log("Joined room:", currentRoomId, "with id:", id);
    });

    socketRef.current.on("chat-message", (msg: Message) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [currentRoomId]);

  const sendMessage = () => {
    if (!text.trim() || !socketRef.current) return;

    const isAI = text.startsWith('@');

    socketRef.current.emit("chat-message", {
      roomId: currentRoomId,
      message: text,
      isAI,
    });

    setText("");
  };

  return (
    <div className="flex flex-col h-full w-full bg-white border rounded-lg">
      {/* <div className="p-2 text-sm bg-gray-100 text-gray-700 border-b">
        Room ID: <strong>{currentRoomId.slice(6)}</strong>
      </div> */}
      <SessionTimer/>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => {
          const isMe = msg.senderId === myId;
          const isAI = msg.isAI;

          return (
            <div
              key={index}
              className={`flex ${isAI ? "justify-center" : isMe ? "justify-end" : "justify-start"
                }`}
            >
              <div
                className={`px-3 py-2 rounded-lg ${isAI
                  ? "bg-green-100 text-green-800"
                  : isMe
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-800"
                  }`}
              >
                {isAI && "🤖 "}
                {msg.message}
              </div>
            </div>
          );
        })}

      </div>

      <div className="p-3 flex items-center gap-2 border-t">
        <input
          type="text"
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && sendMessage()}
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button className="px-4 py-2 bg-black text-white rounded-lg" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default RightChatBody;
