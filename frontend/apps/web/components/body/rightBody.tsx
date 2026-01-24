'use client'
import React, { useEffect, useState } from "react";
import { UserPlus, TrendingUp, Users } from "lucide-react";
import { userDataAPI } from "../../services/api";
import Image from "next/image";
import SuggestedUserSkeleton from "../Loading/SuggestedUserSkeleton";

interface ISuggestedUser {
  _id: string;
  name: string | undefined;
  imageUrl?: string;
  followerCount: number;
  firstSkillToLearn?: string;
  isOnline?:boolean
}

interface RightBodyProps {
  onSkillClick: (skill: string) => void;
}

const RightBody: React.FC<RightBodyProps> = ({ onSkillClick }) => {
  const [suggestedUsers, setSuggestedUsers] = useState<ISuggestedUser[]>([]);
  const [trendingSkills, setTrendingSkills] = useState<[]>([]);
  const [followingStates, setFollowingStates] = useState<{ [key: string]: boolean }>({});
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [loadingSkills, setLoadingSkills] = useState<boolean>(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [skillsError, setSkillsError] = useState<string | null>(null);

  const handleFollow = (userId: string) => {
    setFollowingStates(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  useEffect(() => {
    // Fetch suggested users
    const fetchSuggestedUsers = async () => {
      try {
        setLoadingUsers(true);
        const response = await userDataAPI.suggestedUser();
        setSuggestedUsers(response.data);
      } catch (error: any) {
        console.error("Failed to fetch suggested users:", error);
        setUsersError(error.message || "Failed to fetch suggested users");
      } finally {
        setLoadingUsers(false);
      }
    };

    // Fetch trending skills
    const fetchTrendingSkills = async () => {
      try {
        setLoadingSkills(true);
        const response = await userDataAPI.trendingSkills();
        setTrendingSkills(response.data);
      } catch (error: any) {
        console.error("Failed to fetch trending skills:", error);
        setSkillsError(error.message || "Failed to fetch trending skills");
      } finally {
        setLoadingSkills(false);
      }
    };

    fetchSuggestedUsers();
    fetchTrendingSkills();
  }, []);

  return (
    <div className="hidden sm:block text-black mt-20 w-72 space-y-5">
      {/* Trending Skills */}
      <div className=" rounded-2xl border border-gray-200 p-5 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gray-100 rounded-lg">
            <TrendingUp size={18} className="text-gray-700" />
          </div>
          <h2 className="font-bold text-lg">Trending Skills</h2>
        </div>

        {loadingSkills ? (
          <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto hide-scrollbar animate-pulse">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-20 bg-gray-300 rounded-full"
              ></div>
            ))}
          </div>
        ) : trendingSkills.length === 0 ? (
          <p className="text-gray-500 text-sm">No trending skills yet</p>
        ) : (
          <div className="flex flex-wrap gap-2 max-h-[180px] overflow-y-auto hide-scrollbar">
            {trendingSkills.map((skill, i) => (
              <button
                key={i}
                onClick={() => onSkillClick(skill)}
                className="flex items-center gap-1 px-3 py-2 bg-white rounded-full text-sm text-gray-700 cursor-pointer hover:bg-gray-200 hover:scale-105 transition-all duration-200 font-medium border border-gray-200"
              >
                {skill}
              </button>
            ))}
          </div>
        )}
      </div>


      {/* Suggested Users */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-2 bg-gray-50 rounded-lg">
            <Users size={18} className="text-gray-700" />
          </div>
          <h2 className="font-bold text-lg">Suggested Users</h2>
        </div>
        <div className="space-y-3 overflow-y-auto hide-scrollbar max-h-[250px]">
          {loadingUsers ? (
            <>
              <SuggestedUserSkeleton />
              <SuggestedUserSkeleton />
              <SuggestedUserSkeleton />
            </>
          ) : suggestedUsers.map((user) => (
            <div
              key={user._id}
              className="group flex items-center justify-between bg-gray-50 p-3.5 rounded-xl hover:bg-gray-100 transition-all duration-200 border border-transparent hover:border-gray-200"
            >
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                {/* Avatar */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 ring-2 ring-white">
                    {user?.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.name || "User"}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <span className="flex items-center justify-center w-full h-full text-white font-semibold text-lg">
                        {user?.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-white rounded-full flex items-center justify-center">
                    <div
                      className={`w-2.5 h-2.5 rounded-full ${user?.isOnline ? "bg-green-500" : "bg-gray-400"
                        }`}
                    ></div>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-sm text-gray-900 truncate">
                    {user.name}
                  </h3>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                    <span className="font-medium">{user.followerCount}</span>
                    <span>followers</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-600 font-medium">{user?.firstSkillToLearn || 'NA'}</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => handleFollow(user._id)}
                className={`flex-shrink-0 p-2.5 rounded-xl transition-all duration-200 ${followingStates[user._id]
                  ? 'bg-gray-200 text-gray-700'
                  : 'hover:bg-gray-200 group-hover:scale-110'
                  }`}
              >
                <UserPlus
                  size={18}
                  className={`transition-colors duration-200 ${followingStates[user._id] ? 'text-gray-600' : 'text-gray-700'
                    }`}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RightBody;