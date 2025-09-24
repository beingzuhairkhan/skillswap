'use client'
import React, { useState } from 'react'
import Video from '../components/video/mainBody'
import RightChatBody from './video/rightChatBody';
import CodeEditorBody from './editor/leftEditorBody'
import WhiteBoard from './board/leftBoardBody'
import Notes from './notes/leftnotesBody'
const Navigation = () => {
  const [selected, setSelected] = useState("Video");
  const options = ["Video", "Code Editor", "WhiteBoard", "Notes"];

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Left Side (70%) */}
      <div className="flex flex-col w-[70%] h-full">
        {/* Navigation Bar */}
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
                className={`relative z-10 flex-1 text-center py-2 text-sm rounded-md transition-colors duration-300 ${
                  selected === option ? "text-white font-semibold" : "text-black"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-2 overflow-auto">
          {selected === "Video" && <Video />}
          {selected === "Code Editor" && <CodeEditorBody/>}
          {selected === "WhiteBoard" && <WhiteBoard/>}
          {selected === "Notes" && <Notes/>}
        </div>
      </div>

      {/* Right Side Chat (30%) */}
      <div className="w-[30%] h-full border-l bg-white overflow-auto">
        <RightChatBody />
      </div>
    </div>
  )
}

export default Navigation
