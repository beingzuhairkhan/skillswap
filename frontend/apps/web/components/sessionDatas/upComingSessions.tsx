'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import sessionPlaceholder from "../../public/book-seesion.png";
import { SessionAPI } from "../../services/api";
import toast from "react-hot-toast";

const UpComingSessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
   const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchAllBookSession = async () => {
      try {
        const response = await SessionAPI.getAllBookSession();
        // console.log("response", response.data);
        setSessions(response.data); // assume response.data is array of sessions
        if (response.data.length > 0) setSelectedSession(response.data[0]); // select first by default
      } catch (error) {
        console.error("Error fetching sessions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllBookSession();
  }, []);

    if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleAccept = async (requesterId: string, sessionId: string) => {
    try {

      await SessionAPI.postAcceptSession({ requesterId, sessionId });
      toast.success("Session accepted successfully");
    } catch (error) {
      console.error("Error accepting session:", error);
      toast.error("Failed to accept session");
    }
  };

  const handleReject = async (requesterId: string, sessionId: string) => {
    try {
      await SessionAPI.postCancelSession({ requesterId, sessionId });

      toast.success("Session Cancel successfully");
    } catch (error) {
      console.error("Error Cancel session:", error);
      toast.error("Failed to accept session");
    }
  };


  return (
    <div className="flex gap-6 bg-white">
      {/* Sidebar */}
      <div className="w-1/4">
        <div className="border rounded-lg shadow-sm bg-gray-50 p-4 h-[600px] flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Incoming Requests</h3>
          <div className="space-y-4 overflow-y-auto pr-2 hide-scrollbar">
            {sessions.map((session, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition
                  ${selectedSession?._id === session._id ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                onClick={() => setSelectedSession(session)}
              >
                <div className="relative">
                  <Image
                    src={session.requesterId?.imageUrl || sessionPlaceholder}
                    alt={session.requesterId?.name || "User"}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                 <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${session.requesterId?.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                    ></div>
                  </div>
                </div>
                <div>
                  <p className="font-medium">{session.requesterId?.name}</p>
                  <p className="text-sm text-gray-500">@{session.requesterId?.domain || "N/A"}</p>
                </div>
              </div>
            ))}
            {sessions.length === 0 && (
              <p className="text-gray-500 text-sm">No upcoming sessions</p>
            )}
          </div>
        </div>
      </div>

      {/* Session Details */}
      <div className="flex-1">
        <div className="border rounded-lg shadow-lg p-6 h-[600px] overflow-y-auto hide-scrollbar">
          {selectedSession ? (
            <>
              <h2 className="text-2xl font-bold mb-4">Session Request Details</h2>

              {/* Profile Info */}
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={selectedSession.requesterId?.imageUrl || sessionPlaceholder}
                  alt={selectedSession.requesterId?.name || "User"}
                  width={70}
                  height={70}
                  className="rounded-full"
                />
                <div className="flex flex-col ">
                  <h3 className="text-lg font-semibold text-gray-900">{selectedSession.requesterId?.name}</h3>
                  <p className="text-sm text-gray-500">{selectedSession.requesterId?.collegeName || "Student"}</p>
                  <p className="text-sm text-gray-500 italic">@{selectedSession.requesterId?.domain || "Student"}</p>
                </div>
              </div>
              <div>
                <p className="text-gray-500 text-justify">{selectedSession.requesterId?.bio || "Student"}</p>
              </div>

              {/* Session Details */}
              <div className="border-t mt-4 pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">Topic</span>
                  <span>{selectedSession.postId.wantToLearn}</span>
                </div>
                <hr />

                <div className="flex justify-between">
                  <span className="text-gray-500">Session Type</span>
                  <span>{selectedSession.sessionType}</span>
                </div>
                <hr />

                <div className="flex justify-between">
                  <span className="text-gray-500">Date & Time</span>
                  <span>{new Date(selectedSession.date + 'T' + selectedSession.time).toLocaleString()}</span>
                </div>
                <hr />

                <div className="flex justify-between">
                  <span className="text-gray-500">Duration</span>
                  <span>{selectedSession.durationTime} minutes</span>
                </div>
                <hr />

                <div>
                  <span className="text-gray-500">Student’s Note</span>
                  <p className="mt-1 text-justify">{selectedSession.studentNotes || "No notes"}</p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-4">
                <button
                  className="px-4 py-2 bg-black text-white rounded-md"
                  onClick={() => handleAccept(selectedSession.requesterId._id, selectedSession._id)}
                >
                  Accept Request
                </button>
                <button className="px-4 py-2 bg-gray-300 text-black rounded-md"
                 onClick={() => handleReject(selectedSession.requesterId._id, selectedSession._id)}
                >Decline</button>
              </div>

              {/* Message Box */}
              <div className="mt-4">
                <textarea
                  placeholder="Reason for Decline"
                  className="w-full border rounded-md p-2"
                  rows={3}
                />
              </div>
            </>
          ) : (
            <p className="text-gray-500">Select a session to see details</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpComingSessions;
