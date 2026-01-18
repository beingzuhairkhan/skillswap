import React from "react";

interface ChatMessageProps {
  msg: {
    message: string;
    senderId: string;
    isAI?: boolean | undefined;
  };
  myId: string;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ msg, myId }) => {
  const isMe = msg.senderId === myId;
  const isAI = msg.isAI;
  const isImage = typeof msg.message === "string" && msg.message.startsWith("data:image");

  return (
    <div className={`flex ${isAI ? "justify-center" : isMe ? "justify-end" : "justify-start"}`}>
      <div
        className={`px-3 py-2 rounded-lg max-w-xs ${
          isAI ? "bg-green-100 text-green-800" : isMe ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-800"
        }`}
      >
        {isAI && !isImage && "🤖 "}
        {isImage ? (
          <img
            src={msg.message}
            alt="AI"
            className="rounded-md w-48 h-auto max-w-full"
          />
        ) : (
          msg.message
        )}
      </div>
    </div>
  );
};

export default ChatMessage;
