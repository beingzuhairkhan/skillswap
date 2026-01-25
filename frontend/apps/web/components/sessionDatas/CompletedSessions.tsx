'use client';

import React, { useEffect, useState } from "react";
import Image from "next/image";
import sessionImage from "../../public/book-seesion.png";
import Link from "next/link";
import { SessionAPI } from "../../services/api";
import toast from "react-hot-toast";

const CompletedSessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompletedSessions = async () => {
      try {
        const res = await SessionAPI.getAllCompleteSession();
        console.log("data", res.data)
        setSessions(res.data);
        if (res.data.length > 0) setSelectedSession(res.data[0]);
      } catch (error) {
        toast.error("Failed to load completed sessions");
      } finally {
        setLoading(false);
      }
    };
    fetchCompletedSessions();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }
  return (
    <div className="flex gap-6 bg-white">
      {/* Sidebar */}
      <div className="w-1/4">
        <div className="border rounded-lg shadow-sm bg-gray-50 p-4 h-[600px] flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Completed Sessions</h3>

          <div className="space-y-4 overflow-y-auto pr-2">
            {sessions.length === 0 ? (
              <p className="text-sm text-gray-500 text-center mt-4">
                No completed sessions
              </p>
            ) : (
              sessions.map((session) => (
                <div
                  key={session._id}
                  onClick={() => setSelectedSession(session)}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${selectedSession?._id === session._id
                      ? "bg-gray-200"
                      : "hover:bg-gray-100"
                    }`}
                >
                  <div className="relative">
                    <Image
                      src={session.requesterId?.imageUrl || sessionImage}
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
                    <p className="font-medium">
                      {session.requesterId?.name || "Unknown"}
                    </p>
                    <p className="text-sm text-gray-500">
                      @{session.requesterId?.domain || "N/A"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1">
        {selectedSession ? (
          <div className="border rounded-lg shadow-sm p-6 bg-white">
            <h2 className="text-xl font-semibold text-black flex items-center gap-2 mb-4">
              Session Completed Successfully
            </h2>

            <div className="flex items-center gap-3 mb-6">
              <Image
                src={selectedSession.requesterId?.imageUrl || sessionImage}
                alt="Student avatar"
                width={64}
                height={64}
                className="rounded-full"
              />
              <div className="flex flex-col">
                <p className="font-medium text-black">
                  {selectedSession?.requesterId?.name || "N/A"}
                </p>
                <p className="text-sm text-gray-500">
                  {selectedSession?.requesterId?.collegeName || "Student"}
                </p>
                <p className="text-sm text-gray-500 italic">
                  @{selectedSession?.requesterId?.domain || "N/A"}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-md mb-6">
              <p className="text-sm text-gray-600">
                The session on{" "}
                <strong>{selectedSession.postId?.wantToLearn}</strong> scheduled for{" "}
                <em>
                  {new Date(selectedSession.date).toLocaleDateString()} ·{" "}
                  {selectedSession.time}
                </em>{" "}
                was completed successfully.
              </p>
            </div>

            <div className="flex justify-center gap-4">
              <Link
                href={`/messaging/${selectedSession.requesterId._id}`}
              >
                <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">  Chat with Student
                </button>
              </Link>

              <Link href="/">
                <button className="px-4 py-2 bg-gray-100 rounded-md">
                  View Other Sessions
                </button>
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-center text-gray-500">
            Select a completed session
          </p>
        )}
      </div>
    </div>
  );
};

export default CompletedSessions;
