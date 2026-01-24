'use client';
import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../../../contexts/AuthContext';
import { userDataAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import ProfileImage from '../../../public/book-seesion.png';
import { FaUserFriends, FaUserPlus, FaStar } from 'react-icons/fa';
import { AiOutlineUserAdd } from 'react-icons/ai';
import LeetCodeCard from '../../../components/codingProfile/Leetcode';
import GitHubCard from '../../../components/codingProfile/Github';
import { useParams } from 'next/navigation';
const UserProfile = () => {
  const params = useParams();
  const profileId = params?.id;
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('LeetCode');
  const { user } = useAuth();

  let skillsTeach: string[] = [];
  let skillsLearn: string[] = [];

  if (profile?.skillsToTeach) {
    if (Array.isArray(profile.skillsToTeach)) {
      skillsTeach = profile.skillsToTeach;
      console.log("t" , skillsTeach)
    } else {
      console.warn('skillsToTeach is not an array:', profile.skillsToTeach);
      skillsTeach = [];
    }
  }

  if (profile?.skillsToLearn) {
    if (Array.isArray(profile.skillsToLearn)) {
      skillsLearn = profile.skillsToLearn;
    } else {
      console.warn('skillsToLearn is not an array:', profile.skillsToLearn);
      skillsLearn = [];
    }
  }


  // --- Fetch user profile ---
  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await userDataAPI.getUserProfileData(profileId);
        console.log("data", res)
        setProfile(res.data);
      } catch (err) {
        console.error(err);
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    if (profileId) fetchProfile();
  }, [profileId]);

  const tabClasses = (tab: string) =>
    `cursor-pointer px-4 py-2 font-medium border-b-2 ${activeTab === tab
      ? 'border-blue-600 text-blue-600'
      : 'border-transparent text-gray-600 hover:text-blue-500'
    }`;

  if (loading)
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>
    );

  return (
    <div className="mt-20 flex flex-col items-center mx-auto max-w-7xl px-4 space-y-6">
      {/* Profile Header */}
      <Image
        src={profile?.imageUrl || ProfileImage}
        alt="avatar"
        width={120}
        height={120}
        className="rounded-full"
      />

      <div className="text-center space-y-1 py-2">
        <h1 className="text-gray-800 font-semibold text-[30px]">{profile?.name}</h1>
        <h2 className="text-gray-600 font-medium text-2xl">@{profile?.domain}</h2>
        <h2 className="text-gray-600 font-medium text-lg">{profile?.collegeName}</h2>
      </div>

      <p className="text-gray-600 text-center max-w-4xl text-base">
        {profile?.bio || 'No bio available.'}
      </p>

      {/* Social Stats */}
      <div className="flex flex-wrap justify-center max-w-2xl gap-4 mt-4">
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3">
          <FaUserFriends size={20} className="text-blue-500" />
          <span className="font-medium text-gray-800">
            Followers {profile?.follower?.length || 0}
          </span>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3">
          <FaUserPlus size={20} className="text-green-500" />
          <span className="font-medium text-gray-800">
            Following {profile?.following?.length || 0}
          </span>
        </div>
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3">
          <FaStar size={20} className="text-yellow-500" />
          <span className="font-medium text-gray-800">
            {profile?.ratings || 0} Rating
          </span>
        </div>
        {user?._id !== profile?._id && (
          <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-200 transition">
            <AiOutlineUserAdd size={20} className="text-purple-500" />
            <span className="font-medium text-gray-800">Connect</span>
          </div>
        )}
         {/* <button
              className="font-semibold text-sm px-3 py-1 rounded"
              onClick={() => followUser(post.user)}
            > */}
              {/* {isConnected ? "Connected" : "+ Connect"} */}
              {/* + Connect */}
              {/* </button> */}
      </div>

      {/* Skills Section */}
      <div className="mt-6 max-w-4xl w-full space-y-6">
        <div>
          <h2 className="text-black text-lg font-semibold mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {skillsTeach.map((skill, i) => (
              <span
                key={i}
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
            {skillsLearn.map((skill, i) => (
              <span
                key={i}
                className="bg-gray-100 text-black rounded-full px-3 py-1 text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Coding Profile Tabs */}
      <div className="mt-8 max-w-4xl w-full">
        <div className="flex justify-between border-b mb-8 space-x-6">
          {['LeetCode', 'GitHub', 'Resume', 'Portfolio'].map((tab) => (
            <div
              key={tab}
              className={tabClasses(tab)}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        <div className="mb-16 ">
          {/* LeetCode */}
          {activeTab === 'LeetCode' && (
            profile?.leetcodeUsername ? (
              <LeetCodeCard username={profile.leetcodeUsername} />
            ) : (
              <p className="text-gray-500 italic">LeetCode data not available.</p>
            )
          )}

          {/* GitHub */}
          {activeTab === 'GitHub' && (
            profile?.githubUsername ? (
              <GitHubCard username={profile.githubUsername} />
            ) : (
              <p className="text-gray-500 italic">GitHub data not available.</p>
            )
          )}

          {/* Resume */}
          {activeTab === 'Resume' && (
            profile?.resume ? (
              <object
                data={profile.resume}
                type="application/pdf"
                width="100%"
                height="600px"
                className="rounded border"
              />
            ) : (
              <p className="text-gray-500 italic">Resume not available.</p>
            )
          )}

          {/* Portfolio */}
          {activeTab === 'Portfolio' && (
            profile?.portfolioUrl ? (
              <div className="mt-4 mb-4 flex items-center justify-between bg-gray-100 p-4 rounded-lg shadow-sm">
                <span className="truncate text-gray-800 font-medium">{profile.portfolioUrl}</span>
                <a
                  href={profile.portfolioUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 font-medium hover:underline"
                >
                  Visit
                </a>
              </div>
            ) : (
              <p className="text-gray-500 italic">Portfolio data not available.</p>
            )
          )}
        </div>

      </div>
    </div>
  );
};

export default UserProfile;
