'use client'
import { useEffect, useState } from "react";

const SessionTimer = () => {
  const [seconds, setSeconds] = useState(0);
  const [roomId, setRoomId] = useState<string | null>(null);

  // ⏱️ Start timer if roomId exists
  useEffect(() => {
    const id = localStorage.getItem("meet");
    const parsedId = id ? JSON.parse(id) : null;

    if (!parsedId) return;

    setRoomId(parsedId);

    const interval = setInterval(() => {
      setSeconds(prev => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // ⏰ Time calculation
  const hours = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const secs = String(seconds % 60).padStart(2, "0");

  // 🚪 Leave session
  const handleLeaveSession = () => {
    localStorage.removeItem("meet");
    setRoomId(null);
    setSeconds(0);

    // optional redirect
     window.location.reload();
  };

  // ❌ No room → don’t show timer
  if (!roomId) return null;

  return (
    <>
      <div className="p-4 flex justify-center gap-6">
        {[
          { label: "Hours", value: hours },
          { label: "Minutes", value: minutes },
          { label: "Seconds", value: secs },
        ].map((item, i) => (
          <div key={i} className="text-center bg-gray-100 rounded-lg p-2 w-20">
            <p className="text-2xl font-bold">{item.value}</p>
            <p className="text-xs text-gray-500 uppercase">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="p-4">
        <button
          onClick={handleLeaveSession}
          className="w-full py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
        >
          Leave Session
        </button>
      </div>
    </>
  );
};

export default SessionTimer;
