import React from "react";
import { UserPlus } from "lucide-react";

const RightBody = () => {
  const skills = [
    "React.js",
    "Next.js",
    "Node.js",
    "Python",
    "AI/ML",
    "TailwindCSS",
    "MongoDB",
    "TypeScript",
    "OOPs",
    "DBMS",
    "OS",
    "React.js",
    "Next.js",
    "Node.js",
    "Python",
    "AI/ML",
    "TailwindCSS",
    "MongoDB",
    "TypeScript",
    "OOPs",
    "DBMS",
    "OS"
  ];

  const users = [
    { id: 1, name: "Abdul Hameed", followers: 238, time: "Node.js" },
    { id: 2, name: "Sufiyan Khan", followers: 120, time: "Blockchain" },
    { id: 3, name: "Sohail khan", followers: 340, time: "React.js" },
    { id: 4, name: "Zuhair Khan", followers: 95, time: "Next.js" },
    { id: 1, name: "Abdul Hameed", followers: 238, time: "GenAI" },
    { id: 2, name: "Sufiyan Khan", followers: 120, time: "AI/ML" },
    { id: 3, name: "Sohail khan", followers: 340, time: "Oops" },
    { id: 4, name: "Zuhair Khan", followers: 95, time: "Data Analysis" }
  ];

  return (
    <div className="hidden sm:block text-black mt-20 w-72 space-y-6">
      {/* Trending Skills */}
      <div className="bg-white rounded-lg shadow border p-4">
        <h2 className="font-bold text-lg mb-3">Trending Skills</h2>
        <div className="flex flex-wrap gap-2 overflow-y-auto hide-scrollbar max-h-[150px]">
          {skills.map((skill, i) => (
            <span
              key={i}
              className="px-3 py-1 bg-gray-100 rounded-full text-sm text-gray-700 cursor-pointer hover:bg-gray-200"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>


      {/* Suggested Users */}
      <div className="bg-white rounded-lg shadow border p-4">
        <h2 className="font-bold text-lg mb-3">Suggested Users</h2>
        <div className="space-y-3 overflow-y-auto hide-scrollbar max-h-[300px]">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between bg-gray-50 p-3 rounded-lg hover:bg-gray-100"
            >
              <div className="flex items-center space-x-3">
                {/* Avatar placeholder */}
                <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                <div>
                  <h3 className="font-semibold text-sm">{user.name}</h3>
                  <p className="text-xs text-gray-500">
                    {user.followers} followers · {user.time}
                  </p>
                </div>
              </div>
              <button className="p-2 rounded-full hover:bg-gray-200">
                <UserPlus size={18} className="text-gray-700" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightBody;
