'use client'
import React, { useState } from "react";
import { RoomAPI } from '../../services/api'

const Room = () => {
  const [roomUrl, setRoomUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleJoinRoom = async () => {
    const trimmedUrl = roomUrl.trim();
    if (!trimmedUrl) {
      alert("Please enter a valid room link");
      return;
    }

    setLoading(true);
    try {
      // Send meet link to backend
      console.log("trim" , trimmedUrl)
      const response = await RoomAPI.getDecodeRoomId(trimmedUrl);
      const { status, message , token } = response.data;
     
      if (status && token) {
        // Only redirect if status is true
        const roomPageUrl = `${process.env.NEXT_PUBLIC_ROOM_URL}/${token}`;
        window.open(roomPageUrl, "_blank");
      } else {
        alert(message || "Invalid meet link");
      }
    } catch (error: any) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to join room");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6">
        <h1 className="text-2xl font-bold mb-4 text-center">Join a Room</h1>

        {/* Input field */}
        <input
          type="text"
          placeholder="Paste your meet link here..."
          value={roomUrl}
          onChange={(e) => setRoomUrl(e.target.value)}
          className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-black"
        />

        {/* Join Button */}
        <button
          onClick={handleJoinRoom}
          disabled={loading}
          className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
        >
          {loading ? "Joining..." : "Join Room"}
        </button>
      </div>
    </div>
  );
};

export default Room;
