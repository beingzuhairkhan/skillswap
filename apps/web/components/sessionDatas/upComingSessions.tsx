"use client";
import React from "react";
import Image from "next/image";
import sessionImage from "../../public/book-seesion.png";

const UpComingSessions = () => {
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
    <div className="flex gap-6  bg-white">
      {/* Incoming Requests Sidebar */}
      <div className="w-1/4">
        <div className="border rounded-lg shadow-sm bg-gray-50 p-4 h-[600px] flex flex-col">
          <h3 className="font-semibold text-lg mb-4">Incoming Requests</h3>
          <div className="space-y-4 overflow-y-auto pr-2 hide-scrollbar">
            {users.map((user, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-2  rounded-md cursor-pointer hover:bg-gray-100 transition"
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

      {/* Session Request Details Card */}
      <div className="flex-1">
        <div className="border rounded-lg shadow-lg p-6 h-[600px] overflow-y-auto hide-scrollbar">
          <h2 className="text-2xl font-bold mb-4">Session Request Details</h2>

          {/* Profile Info */}
          <div className="flex items-center gap-4 mb-6">
            <Image
              src={sessionImage}
              alt="Sophia Clark"
              width={70}
              height={70}
              className="rounded-full"
            />
            <div>
              <h3 className="font-semibold text-lg">Sophia Clark</h3>
              <p className="text-gray-500">Student at State University</p>
            </div>
          </div>

          <p className="mb-6 text-gray-600">
            Sophia is a motivated student with a keen interest in data analysis.
            She is eager to learn more about data visualization techniques and
            statistical modeling.
          </p>

          {/* Tags */}
          <div className="mb-6">
            <h4 className="font-semibold mb-2">What Sophia Wants to Learn</h4>
            <div className="flex gap-2 flex-wrap">
              {["Data Visualization", "Statistical Modeling", "Data Analysis"].map(
                (tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                )
              )}
            </div>
          </div>

          {/* Session Details */}
          <div className="border-t pt-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-500">Session Type</span>
              <span>1 To 1</span>
            </div>
            <hr />

            <div className="flex justify-between">
              <span className="text-gray-500">Topic</span>
              <span>Data Analysis</span>
            </div>
            <hr />

            <div className="flex justify-between">
              <span className="text-gray-500">Date & Time</span>
              <span>July 20, 2024, 2:00 PM</span>
            </div>
            <hr />

            <div className="flex justify-between">
              <span className="text-gray-500">Duration</span>
              <span>1 hour</span>
            </div>
            <hr />

            <div>
              <span className="text-gray-500">Student’s Note</span>
              <p className="mt-1">
                I’m excited to learn from your expertise in data analysis and
                gain insights into real-world applications.
              </p>
            </div>
          </div>


          {/* Buttons */}
          <div className="flex gap-3 mt-6">
            <button className="px-4 py-2 bg-black text-white rounded-md">
              Accept Request
            </button>
            <button className="px-4 py-2 bg-gray-300 text-black rounded-md">
              Decline
            </button>
          </div>

          {/* Message Box */}
          <div className="mt-6">
            <textarea
              placeholder="Reason for Decline"
              className="w-full border rounded-md p-2"
              rows={3}
              required
            />
          
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpComingSessions;
