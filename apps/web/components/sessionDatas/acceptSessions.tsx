import React from "react";
import Image from "next/image";
import sessionImage from "../../public/book-seesion.png";
import Link from "next/link"
const AcceptSessions = () => {
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
    <div className="flex gap-6 bg-white ">
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

      {/* Session Accept Details Card */}
      <div className="flex-1">
        <div className="border rounded-lg shadow-sm p-6 bg-white">
          <h2 className="text-xl font-semibold text-black flex items-center gap-2 mb-4">
             Your session has been accepted!
          </h2>

          {/* Session Info */}
          <div className="flex gap-4 mb-6">
            <Image
              src={sessionImage}
              alt="Student avatar"
              width={48}
              height={48}
              className="rounded-full"
            />
            <div>
              <p className="font-medium">Sophia Carter</p>
              <p className="text-sm text-gray-500">Student</p>
            </div>
            {/* <Image
              src={sessionImage}
              alt="Session"
              width={160}
              height={100}
              className="rounded-lg object-cover"
            /> */}
          </div>

          {/* Student Info */}
          <div className="flex items-center gap-3 mb-6">
           
             <div>
              <h3 className="text-lg font-medium">Learn Data Visualization</h3>
              <p className="text-sm text-gray-600">
                July 20, 2024 · 10:00 AM · 1 hour
              </p>
              <span className="inline-block mt-2 px-3 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                Upcoming
              </span>
            </div>
          </div>

          {/* Meeting Link */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-md mb-4">
            <div>
              <p className="text-sm font-medium">Meeting Link</p>
              <Link
                href="https://meet.example.com/xyz123"
                target="_blank"
                className="text-sm text-blue-600 underline"
              >
                https://meet.example.com/xyz123
              </Link>
            </div>
            <button className="px-3 py-1 text-sm rounded-md bg-gray-200 hover:bg-gray-300">
              Copy Link
            </button>
          </div>


          {/* Countdown */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            {[
              { label: "Days", value: "02" },
              { label: "Hours", value: "04" },
              { label: "Minutes", value: "32" },
              { label: "Seconds", value: "00" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="bg-gray-50 rounded-md p-3 text-center shadow-sm"
              >
                <p className="text-lg font-semibold">{item.value}</p>
                <p className="text-xs text-gray-500">{item.label}</p>
              </div>
            ))}
          </div>

          {/* Actions */}
          <div className="flex justify-between">
          <Link href="/messaging" >
            <button className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800">
              Chat with Student
            </button>
          </Link>
            <button className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200">
              Cancel Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AcceptSessions;
