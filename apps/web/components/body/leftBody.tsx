import React from "react";
import { MdGroups } from "react-icons/md";
import { MdEventAvailable } from "react-icons/md";
import { MdOutlineNewspaper } from "react-icons/md";
import { MdSaveAlt } from "react-icons/md";
const LeftBody = () => {
  return (
   <div className="mt-20 hidden sm:block text-black w-[240px] space-y-4">
      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        {/* Banner */}
        <div className="h-16 bg-gray-200"></div>

        {/* Avatar */}
        <div className="flex flex-col items-center -mt-8 px-4 pb-4">
          <div className="w-16 h-16 rounded-full bg-gray-300 border-4 border-white flex items-center justify-center">
            <span className="text-2xl">+</span>
          </div>
          <h2 className="mt-2 font-bold">Zuhair Khan</h2>
          <p className="text-sm text-gray-600">Mumbai, Maharashtra</p>
          <button className="mt-3 w-full border border-gray-400 rounded-lg py-1 text-sm hover:bg-gray-100">
            + Experience
          </button>
        </div>
      </div>

      {/* Profile Analytics */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Profile viewers</span>
          <span className="text-blue-600 font-medium cursor-pointer">4</span>
        </div>
        <div className="text-gray-600 cursor-pointer hover:underline">
          View all analytics
        </div>
      </div>

      {/* Premium Banner */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-sm">
        <p className="text-gray-600 mb-2">
          Grow your connections and get ahead
        </p>
        <button className="text-yellow-600 font-medium hover:underline">
          ⭐ Try Premium for ₹0
        </button>
      </div>

      {/* Quick Links */}
      <div className="bg-white rounded-lg shadow border border-gray-200 p-4 text-sm space-y-3">
        <div className="flex items-center gap-2 cursor-pointer hover:underline">
          <span><MdSaveAlt size={15} /></span> <span>Saved items</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:underline">
          <span><MdGroups size={15}/></span> <span>Groups</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:underline">
          <span><MdOutlineNewspaper size={15} /></span> <span>Newsletters</span>
        </div>
        <div className="flex items-center gap-2 cursor-pointer hover:underline">
          <span><MdEventAvailable size={15}/></span> <span>Events</span>
        </div>
      </div>
    </div>
  );
};

export default LeftBody;
