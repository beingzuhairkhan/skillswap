'use client'
import React from "react";
import { MdGroups, MdEventAvailable, MdOutlineNewspaper, MdSaveAlt, MdTrendingUp } from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";

const LeftBody = () => {
  const { user } = useAuth()

  return (
    <div className="mt-20 hidden sm:block w-[260px] space-y-3">
      {/* Profile Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        {/* Banner with gradient */}
        <div className="h-20 bg-gradient-to-r from-gray-100 via-slate-100 to-gray-100 relative">
          <div className="absolute inset-0 bg-black/5"></div>
        </div>



        {/* Avatar & Info */}
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

                  {/* Subtle Hover Overlay */}
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

      {/* Stats Card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-3">
          <MdTrendingUp className="text-blue-500" size={20} />
          <h3 className="text-sm font-semibold text-gray-900">Your Stats</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Profile views</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900">247</span>
              <span className="text-xs text-green-500 font-medium">+12%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Post impressions</span>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900">1.2K</span>
              <span className="text-xs text-green-500 font-medium">+8%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">Connections</span>
            <span className="text-sm font-bold text-gray-900">156</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl border border-gray-100 p-3 hover:shadow-lg transition-shadow duration-300">
        <div className="grid grid-cols-2 gap-2">
          {[
            { icon: <MdSaveAlt size={20} />, text: "Saved", color: "blue" },
            { icon: <MdGroups size={20} />, text: "Groups", color: "purple" },
            { icon: <MdOutlineNewspaper size={20} />, text: "News", color: "pink" },
            { icon: <MdEventAvailable size={20} />, text: "Events", color: "indigo" },
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all duration-200 hover:scale-105 active:scale-95 group"
            >
              <div className={`text-${item.color}-500 group-hover:text-${item.color}-600 transition-colors`}>
                {item.icon}
              </div>
              <span className="text-xs font-medium text-gray-700 group-hover:text-gray-900">{item.text}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default LeftBody;