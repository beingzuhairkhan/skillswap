'use client'
import React, { useState, useEffect } from 'react'
import Video from './video/mainBody'
import RightChatBody from './video/rightChatBody';
import CodeEditorBody from './editor/leftEditorBody'
import WhiteBoard from './board/leftBoardBody'
import Notes from './notes/leftnotesBody'
import { usePathname } from 'next/navigation';

const Navigation = () => {
  const [selected, setSelected] = useState("Video");
  const options = ["Video", "Code Editor", "WhiteBoard", "Notes"];
  const [roomId, setRoomId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("meet");
    const parsedId = id ? JSON.parse(id) : null;

    setRoomId(parsedId);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

if (!roomId) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-black rounded-full mb-4">
            <svg
              className="w-7 h-7 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-black mb-2">
            Room Not Found
          </h1>
          <p className="text-gray-600 text-sm">
            The room you're looking for doesn't exist.
          </p>
        </div>

        <div className="bg-black/5 rounded-xl border border-black/10 p-5">
          <div className="space-y-3">
            <button
              onClick={() => (window.location.href = "https://skillswap-iota-three.vercel.app")}
              className="w-full bg-black hover:bg-gray-800 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              <svg
                className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Return to Home
            </button>
            
            <button
              onClick={() => window.history.back()}
              className="w-full bg-transparent hover:bg-black/5 text-black font-medium py-3 px-4 rounded-lg border border-black/20 transition-all duration-200"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
  return (
    <div className="flex h-screen w-screen overflow-hidden">
      <div className="flex flex-col w-[75%] h-full">
        <div className="flex justify-center mt-2 px-2">
          <div className="relative flex flex-row bg-gray-200 rounded-lg p-2 max-w-full w-[400px] justify-between items-center overflow-hidden">
            <div
              className="absolute top-2 h-[32px] bg-black rounded-md transition-all duration-300"
              style={{
                width: `${97 / options.length}%`,
                transform: `translateX(${options.indexOf(selected) * 100}%)`,
              }}
            />
            {options.map((option) => (
              <button
                key={option}
                onClick={() => setSelected(option)}
                className={`relative z-10 flex-1 text-center py-2 text-sm rounded-md transition-colors duration-300 ${selected === option ? "text-white font-semibold" : "text-black"
                  }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-2 overflow-auto">

          <div className={selected === "Video" ? "block" : "hidden"}>
            <Video roomId={roomId} />
          </div>

          <div className={selected === "Code Editor" ? "block" : "hidden"}>
            <CodeEditorBody />
          </div>

          <div className={selected === "WhiteBoard" ? "block" : "hidden"}>
            <WhiteBoard />
          </div>

          <div className={selected === "Notes" ? "block" : "hidden"}>
            <Notes />
          </div>

        </div>

      </div>

      <div className="w-[25%] h-full border-l bg-white overflow-auto">
        <RightChatBody roomId={roomId} />
      </div>
    </div>
  )
}

export default Navigation
