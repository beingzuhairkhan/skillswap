'use client';
import React, { useEffect, useState } from "react";
import Image from "next/image";
import sessionImage from "../../public/book-seesion.png";
import Link from "next/link";
import { SessionAPI } from "../../services/api";
import toast from "react-hot-toast";
import Countdown from "../Countdown";
const AcceptSessions = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);
   const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAcceptSession = async () => {
      try {
        const res = await SessionAPI.getAllAcceptSession();
        setSessions(res.data);
        if (res.data.length > 0) setSelectedSession(res.data[0]);
      } catch (error) {
        console.log("Error fetching accepted sessions:", error);
      }finally{
          setLoading(false);
      }
    };
    fetchAcceptSession();
  }, []);

  const formatDateTime = (date: string, time: string) => {
    return new Date(`${date}T${time}`).toLocaleString();
  };

  const sessionDateTime =
    selectedSession && selectedSession.date && selectedSession.time
      ? new Date(`${selectedSession.date}T${selectedSession.time}`)
      : new Date();

 if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 bg-white">
      {/* Incoming Requests Sidebar */}
      <div className="w-1/4">
        <div className="border rounded-lg shadow-sm bg-gray-50 p-4 h-[600px] flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Incoming Requests</h3>
          <div className="space-y-4 overflow-y-auto pr-2 hide-scrollbar">
            {sessions.length > 0 ? (
              sessions.map((session, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 p-2 rounded-md cursor-pointer transition ${selectedSession?._id === session._id ? "bg-gray-200" : "hover:bg-gray-100"}`}
                  onClick={() => setSelectedSession(session)}
                >
                  <div className="relative">
                    <Image
                      src={session.requesterId?.imageUrl || sessionImage}
                      alt={session.requesterId?.name || "User"}
                      width={40}
                      height={40}
                      className="rounded-full"
                    />
                    <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border border-white"></span>
                  </div>
                  <div>
                    <p className="font-medium">{session.requesterId?.name || "N/A"}</p>
                    <p className="text-sm text-gray-500">{session.requesterId?.domain || "N/A"}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500">No accepted sessions yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Session Accept Details Card */}
      <div className="flex-1">
        <div className="border rounded-lg shadow-lg p-6 h-[600px] overflow-y-auto hide-scrollbar">
          <h2 className="text-xl font-semibold text-black flex items-center gap-2 mb-4">
            Your session has been accepted!
          </h2>

          {selectedSession ? (
            <>
              {/* Session Info */}
              <div className="flex gap-4 mb-6 items-center">
                <Image
                  src={selectedSession?.requesterId?.imageUrl || sessionImage}
                  alt={selectedSession?.requesterId?.name || "Student avatar"}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
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


              {/* Student Info */}
              <div className="flex items-center gap-3 mb-6">
                <div>
                  <h3 className="text-lg font-medium">
                    Want To Learn {selectedSession.postId?.wantToLearn || "N/A"}
                  </h3>
                  <p className="text-sm mt-1 text-gray-600">
                    {selectedSession.date && selectedSession.time
                      ? formatDateTime(selectedSession.date, selectedSession.time)
                      : "N/A"}{' '}
                    &middot;{' '}
                    {selectedSession.durationTime ? `${selectedSession.durationTime} mins` : "N/A"}
                  </p>

                  <span className="inline-block mt-3 px-3 py-1 text-xs font-semibold bg-green-100 text-green-700 rounded-full w-fit">
                    Upcoming
                  </span>
                </div>
              </div>

              {/* Meeting Link */}
              <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md mb-4">
                <div>
                  <p className="text-sm font-medium">Meeting Link</p>
                  {selectedSession.googleMeetLink ? (
                    <Link
                      href={selectedSession.googleMeetLink}
                      target="_blank"
                      className="text-sm text-blue-600 underline break-all"
                    >
                      {selectedSession.googleMeetLink.slice(0, 60)}...
                    </Link>
                  ) : (
                    <p className="text-sm text-gray-500">N/A</p>
                  )}
                </div>
                <button
                  className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
                  onClick={() => {
                    if (selectedSession.googleMeetLink) {
                      navigator.clipboard.writeText(selectedSession.googleMeetLink);
                      toast.success("Meeting link copied to clipboard!");
                    } else {
                      toast.error("No meeting link available.");
                    }
                  }}
                >
                  Copy Link
                </button>
              </div>

              {/* Countdown (Placeholder) */}

              <Countdown targetDate={sessionDateTime} />


              {/* Actions */}
              <div className="flex justify-between">
                <Link
                  href={`/messaging/${selectedSession.requesterId._id}`}
                >
                  <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                    Chat with Student
                  </button>
                </Link>

              </div>
            </>
          ) : (
            <p className="text-gray-500">No session selected</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AcceptSessions;
