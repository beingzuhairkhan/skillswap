import React from "react";
import Image from "next/image";
import sessionImage from "../../public/book-seesion.png";
import Link from "next/link";

const RejectSessions = () => {
  const users = [
    { name: "Sophia Clark", topic: "Data Analysis" },
    { name: "Ethan Carter", topic: "Machine Learning" },
    { name: "Olivia Bennett", topic: "Web Development" },
    { name: "Liam Harper", topic: "UI/UX Design" },
    { name: "Ava Foster", topic: "Mobile App Development" },
      { name: "Sophia Clark", topic: "Data Analysis" },
    { name: "Ethan Carter", topic: "Machine Learning" },
    { name: "Olivia Bennett", topic: "Web Development" },
    { name: "Liam Harper", topic: "UI/UX Design" },
    { name: "Ava Foster", topic: "Mobile App Development" },
  ];

  return (
    <div className="flex gap-6 bg-white">
      {/* Incoming Requests Sidebar */}
      <div className="w-1/4">
        <div className="border rounded-lg shadow-sm bg-gray-50 p-4 h-[600px] flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Incoming Requests</h3>
          <div className="space-y-4 overflow-y-auto pr-2 hide-scrollbar">
            {users.map((user, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2 rounded-md cursor-pointer hover:bg-gray-100 transition"
              >
                <div className="relative">
                  <Image
                    src={sessionImage}
                    alt={user.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                  />
                  <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border border-white"></span>
                </div>
                <div>
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-gray-500">{user.topic}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Session Rejection Details Card */}
      <div className="flex-1">
        <div className="border rounded-lg shadow-sm p-6 bg-white text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Your session request was not approved
          </h2>

          {/* Student Info */}
          <div className="flex   items-center gap-3 mb-6">
            <Image
              src={sessionImage}
              alt="Student avatar"
              width={64}
              height={64}
              className="rounded-full"
            />
            <div>
              <p className="font-medium">Sophia Carter</p>
              <p className="text-sm text-gray-500">Student</p>
            </div>
          </div>

          {/* Reason / Message */}
          <div className="bg-gray-50 p-4 rounded-md mb-6">
            <p className="text-sm text-gray-600">
              The requested session <strong>"Learn Data Visualization"</strong>{" "}
              scheduled for <em>July 20, 2024 · 10:00 AM</em> has been declined.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              You may contact the student for further details or explore other
              sessions.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-4">
            <Link href="/messaging">
              <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
                Chat with Student
              </button>
            </Link>
            <Link href="/session">
              <button className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200">
                View Other Sessions
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RejectSessions;
