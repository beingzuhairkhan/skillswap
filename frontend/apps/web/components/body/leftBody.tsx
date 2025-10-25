'use client'
import React from "react";
import { MdGroups, MdEventAvailable, MdOutlineNewspaper, MdSaveAlt } from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext";

const LeftBody = () => {
  const {user} = useAuth()
  return (
    <div className="mt-20 hidden sm:block text-black w-[260px] space-y-5">
      {/* Profile Card */}
      <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
        {/* Banner */}
        <div className="h-20 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center">
          <span className="text-white text-sm font-semibold tracking-wide">
            Tech Network
          </span>
        </div>

        {/* Avatar & Info */}
        <div className="flex flex-col items-center -mt-10 px-4 pb-4">
          <div className="w-20 h-20 rounded-full bg-gray-200 border-4 border-white flex items-center justify-center text-gray-700 font-bold text-2xl shadow">
            +
          </div>
          <h2 className="mt-3 font-semibold text-base text-gray-900">{user?.name}</h2>
          <p className="text-xs text-gray-500">Mumbai, Maharashtra</p>
          <button className="mt-3 w-full border border-gray-300 rounded-lg py-1.5 text-xs font-medium hover:bg-gray-50 active:scale-[0.98] transition-all duration-150">
            + Add Skills
          </button>
        </div>
      </div>

      {/* Profile Analytics */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-2 text-sm">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Profile viewers</span>
          <span className="text-blue-600 font-semibold cursor-pointer hover:underline">
            4
          </span>
        </div>
        <div className="text-gray-500 cursor-pointer hover:text-blue-600 hover:underline transition">
          View all analytics
        </div>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-sm space-y-2">
        {[
          { icon: <MdSaveAlt size={16} />, text: "Saved items" },
          { icon: <MdGroups size={16} />, text: "Groups" },
          { icon: <MdOutlineNewspaper size={16} />, text: "Newsletters" },
          { icon: <MdEventAvailable size={16} />, text: "Events" },
        ].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 cursor-pointer transition"
          >
            {item.icon}
            <span>{item.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeftBody;
