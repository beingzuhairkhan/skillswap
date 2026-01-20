'use client'
import React from "react";
import { MdGroups, MdEventAvailable, MdOutlineNewspaper, MdSaveAlt, MdTrendingUp, MdMessage, MdAddCircleOutline } from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";

const LeftBody = () => {
  const { user } = useAuth()

  return (
    <div className="mt-20 hidden sm:block w-[260px] space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="h-20 bg-gradient-to-r from-gray-100 via-slate-100 to-gray-100 relative">
          <div className="absolute inset-0 bg-black/5"></div>
        </div>

        <div className="flex flex-col items-center -mt-12 px-5 pb-5">
          <div className="relative group">
            <Link href={`/profile/${user?._id}`} className="block">
              <div className="w-24 h-24 rounded-full border border-gray-200 bg-white shadow-sm transition-all duration-200 group-hover:shadow-md">
                <div className="w-full h-full rounded-full overflow-hidden relative">
                  {user?.imageUrl ? (
                    <Image
                      src={user.imageUrl}
                      alt={user?.name || "User profile"}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full rounded-full"
                    />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-gray-600 font-semibold text-xl">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-white/80 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                    <span className="text-gray-700 text-xs font-medium">
                      View Profile
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          <h2 className="mt-4 font-bold text-base text-gray-900">{user?.name}</h2>
          <p className="text-sm text-gray-600 mt-1 text-center">{user?.collegeName}</p>
          <p className="text-xs text-gray-400 mt-0.5">@{user?.domain}</p>
        </div>
      </div>

      {/* Skill/Session Stats */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-3">
          <MdTrendingUp className="text-blue-500" size={20} />
          <h3 className="text-sm font-semibold text-gray-900">Your Skill Stats</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Skills to Teach</span>
            <span className="text-sm font-bold text-gray-900">{user?.skillsToTeach?.length || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Skills to Learn</span>
            <span className="text-sm font-bold text-gray-900">{user?.skillsToLearn?.length || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Sessions Completed</span>
            <span className="text-sm font-bold text-gray-900">{user?.sessionsCompleted || 0}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Rating</span>
            <span className="text-sm font-bold text-gray-900">{user?.ratings || 0} ⭐</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {/* AI LLM Features */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300">
    
        {/* Minimal AI LLM Features */}
        <div className="bg-white transition-shadow duration-300">
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: <MdTrendingUp size={24} />, text: "Skill Gap Analysis" },
             { icon: <MdSaveAlt size={20} />, text: "Saved", color: "blue" },
            ].map((item, idx) => (
              <div
                key={idx}
                className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95"
              >
                <div className="text-blue-500">{item.icon}</div>
                <span className="text-xs font-medium text-gray-700">{item.text}</span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeftBody;
