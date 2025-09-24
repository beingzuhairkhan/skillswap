'use client'
import React, { useState } from "react";

const Room = () => {
  const [roomUrl, setRoomUrl] = useState("");

  const handleJoinRoom = () => {
    if (!roomUrl.trim()) {
      alert("Please enter a valid room link");
      return;
    }
    // open the room link in new tab
    window.location.href = "http://localhost:3001";
  };

  return (
    <div className="flex items-center justify-center h-screen ">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Join a Room</h1>

        {/* Input field */}
        <input
          type="text"
          placeholder="Paste your room link here..."
          value={roomUrl}
          onChange={(e) => setRoomUrl(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* Button */}
        <button
          onClick={handleJoinRoom}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition"
        >
          Join Room
        </button>
      </div>
    </div>
  );
};

export default Room;
