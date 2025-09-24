'use client'
import React, { useState } from "react";
import Image from 'next/image';
import ProfileImage from '../../../public/book-seesion.png';
import { FaUserFriends, FaUserPlus, FaStar } from "react-icons/fa";
import { AiOutlineUserAdd } from "react-icons/ai";

const skills = ["React", "Node.js", "MongoDB", "C++", "Blockchain", "Generative AI", "Cloud Computing"];
const learning = ["Rust", "GoLang", "System Design"];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Posts");

  const tabs = ["Posts", "Reviews", "Upcoming Sessions", "Request Sessions", "Cancel Session"];

  const renderContent = () => {
    switch (activeTab) {
      case "Posts":
        return <div>Here are your posts...</div>;
      case "Reviews":
        return <div>Here are your reviews...</div>;
      case "Upcoming Sessions":
        return <div>Here are your upcoming sessions...</div>;
      case "Request Sessions":
        return <div>Here are your requested sessions...</div>;
      case "Cancel Session":
        return <div>Here are your canceled sessions...</div>;
      default:
        return null;
    }
  };

  return (
    <div className="mt-20 flex flex-col items-center mx-auto max-w-7xl px-4 space-y-6">

      {/* Profile Image */}
      <Image
        src={ProfileImage}
        alt="avatar"
        width={120}
        height={120}
        className="rounded-full"
      />

      {/* Name & Education */}
      <div className="text-center">
        <h1 className="text-gray-800 font-semibold text-2xl">Zuhair Khan</h1>
        <h2 className="text-gray-600 font-medium text-lg mt-1">
          Computer Science at Mumbai University
        </h2>
      </div>

      {/* Bio */}
      <p className="text-gray-600 text-center max-w-4xl text-base">
        I am a software engineer passionate about learning Blockchain and Generative AI.
        Always exploring new technologies and building innovative projects.
      </p>

      {/* Social Stats */}
      <div className="flex flex-wrap justify-center max-w-2xl gap-4 mt-4">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3">
          <FaUserFriends size={20} className="text-blue-500" />
          <span className="font-medium text-gray-800">Followers 500</span>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3">
          <FaUserPlus size={20} className="text-green-500" />
          <span className="font-medium text-gray-800">Following 10</span>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3">
          <FaStar size={20} className="text-yellow-500" />
          <span className="font-medium text-gray-800">4.8 Rating</span>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-200 transition">
          <AiOutlineUserAdd size={20} className="text-purple-500" />
          <span className="font-medium text-gray-800">Connect</span>
        </div>
      </div>

      {/* Skills & Learning */}
      <div className="mt-6 max-w-4xl w-full space-y-6">
        <div>
          <h2 className="text-black text-lg font-semibold mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skills.map((item, index) => (
              <span
                key={index}
                className="bg-gray-100 text-black rounded-full px-3 py-1 text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-black text-lg font-semibold mb-2">Learning</h2>
          <div className="flex flex-wrap gap-2">
            {learning.map((item, index) => (
              <span
                key={index}
                className="bg-gray-100 text-black rounded-full px-3 py-1 text-sm"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8 max-w-4xl w-full ">
        <div className="flex flex-wrap gap-4 border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium ${
                activeTab === tab
                  ? "border-b-2 border-blue-500 text-blue-500"
                  : "text-gray-600"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="mt-4">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default Profile;
