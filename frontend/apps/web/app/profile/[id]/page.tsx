'use client';
import React, { useState, useEffect } from "react";
import Image from 'next/image';
import ProfileImage from '../../../public/book-seesion.png';
import { FaUserFriends, FaUserPlus, FaStar } from "react-icons/fa";
import { AiOutlineUserAdd } from "react-icons/ai";
import { useAuth } from '../../../contexts/AuthContext'
import { userDataAPI } from '../../../services/api'
import toast from 'react-hot-toast';
import ProfilePosts from "../../../components/ProfileData/ProfilePosts";
import ProfileRequestSessio from "../../../components/ProfileData/ProfileRequestSessio";
import ProfileAcceptSession from "../../../components/ProfileData/ProfileAcceptSession";
import ProfileCancelSession from "../../../components/ProfileData/ProfileCancelSession";
import { SessionStatus } from '../../../components/constants/sessionStatus'


// export const SessionStatus = {
//   ACCEPT: "accept",
//   PENDING: "pending",
//   REJECT: "reject",
// } as const;

// export type SessionStatusType =
//   (typeof SessionStatus)[keyof typeof SessionStatus];

const Profile = () => {
  const [activeTab, setActiveTab] = useState("Posts");
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { token, user } = useAuth();
  // let skillsTeach: string[] = [];
  // let skillsLearn: string[] = [];

  // if (profile?.skillsToTeach) {
  //   try {
  //     skillsTeach = JSON.parse(profile.skillsToTeach);
  //   } catch (error) {
  //     console.error("Invalid JSON for skillsToTeach:", error);
  //   }
  // }

  // if (profile?.skillsToLearn) {
  //   try {
  //     skillsLearn = JSON.parse(profile.skillsToLearn);
  //   } catch (error) {
  //     console.error("Invalid JSON for skillsToLearn:", error);
  //   }
  // }

  const tabs = ["Posts", "Reviews", "Upcoming Sessions", "Request Sessions", "Cancel Session"];
  // console.log("P" , profile)
  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        if (!token) return;
        const res = await userDataAPI.getProfile();
        setProfile(res.data);
      } catch (err) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [token]);


  const renderContent = () => {
    switch (activeTab) {
      case "Posts":
        return <ProfilePosts/>;
      case "Reviews":
        return <div>Here are your reviews...</div>;
      case "Upcoming Sessions":
        return <ProfileAcceptSession status={SessionStatus.ACCEPT} />;
      case "Request Sessions":
        return <ProfileRequestSessio status={SessionStatus.PENDING} />;
      case "Cancel Session":
        return <ProfileCancelSession status={SessionStatus.REJECT}/>;
      default:
        return null;
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>

    );


  return (
    <div className="mt-20 flex flex-col items-center mx-auto max-w-7xl px-4 space-y-6">

      {/* Profile Image */}
      <Image
        src={profile?.imageUrl || ProfileImage}
        alt="avatar"
        width={120}
        height={120}
        className="rounded-full"
      />

      {/* Name & Education */}
      <div className="text-center space-y-1 py-2">
        <h1 className="text-gray-800 font-semibold text-[30px]">{profile?.name || 'User Name'}</h1>
        <h2 className="text-gray-600 font-medium text-2xl">@{profile?.domain || 'Blockchain Developer'}</h2>
        <h2 className="text-gray-600 font-medium text-lg">{profile?.collegeName || 'College/University'}</h2>
      </div>


      {/* Bio */}
      <p className="text-gray-600 text-center max-w-4xl text-base">
        {profile?.bio || 'No bio available.'}
      </p>

      {/* Social Stats */}
      <div className="flex flex-wrap justify-center max-w-2xl gap-4 mt-4">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3">
          <FaUserFriends size={20} className="text-blue-500" />
          <span className="font-medium text-gray-800">Followers {profile?.follower?.length || 0}</span>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3">
          <FaUserPlus size={20} className="text-green-500" />
          <span className="font-medium text-gray-800">Following {profile?.following?.length || 0}</span>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3">
          <FaStar size={20} className="text-yellow-500" />
          <span className="font-medium text-gray-800">{profile?.ratings || 0} Rating</span>
        </div>
        {
          user?._id !== profile?._id ? (
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-200 transition">
              <AiOutlineUserAdd size={20} className="text-purple-500" />
              <span className="font-medium text-gray-800">Connect</span>
            </div>
          ) : (null)
        }
      </div>

      {/* Skills & Learning */}
      <div className="mt-6 max-w-4xl w-full space-y-6">
        <div>
          <h2 className="text-black text-lg font-semibold mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {profile?.skillsToTeach.map((skill: string, index: number) => (
              <span
                key={index}
                className="bg-gray-100 text-black rounded-full px-3 py-1 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-black text-lg font-semibold mb-2">Learning</h2>
          <div className="flex flex-wrap gap-2">
            {profile?.skillsToLearn.map((item: string, index: number) => (
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
        <div className="flex justify-between flex-wrap gap-4 border-b">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-2 font-medium ${activeTab === tab
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
