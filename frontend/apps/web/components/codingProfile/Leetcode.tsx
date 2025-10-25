import React, { useEffect, useState } from "react";
import { userDataAPI } from "../../services/api";

interface LeetCodeCardProps {
  username: string;
}

interface Stats {
  total: number;
  easy: number;
  medium: number;
  hard: number;
}

interface LeetCodeProfile {
  username: string;
  avatar?: string;
  ranking?: number;
  badges?: { name: string; displayName: string }[];
}

const LeetCodeCard: React.FC<LeetCodeCardProps> = ({ username }) => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [profile, setProfile] = useState<LeetCodeProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!username) return;

    const fetchStats = async () => {
      setLoading(true);
      setError("");

      try {
        const response = await userDataAPI.getLeetcodeProfile();
        const user = response.data.data.matchedUser;

        setProfile({
          username: user.username,
          avatar: user.profile?.userAvatar,
          ranking: user.profile?.ranking,
          badges: user.badges || [],
        });

        const submissions = user.submitStats.acSubmissionNum;
        const statsObj: Stats = {
          total: submissions.find((s: any) => s.difficulty === "All")?.count || 0,
          easy: submissions.find((s: any) => s.difficulty === "Easy")?.count || 0,
          medium: submissions.find((s: any) => s.difficulty === "Medium")?.count || 0,
          hard: submissions.find((s: any) => s.difficulty === "Hard")?.count || 0,
        };
        setStats(statsObj);
      } catch (err) {
        setError("Failed to fetch LeetCode data");
        setStats(null);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [username]);

 if (loading)
    return (
      <div className="flex  justify-center items-center">
        <div className="w-16 h-16 border-4 border-blue-500 border-dashed rounded-full animate-spin"></div>
      </div>

    );
  if (error)
    return (
      <p className="text-red-500 text-center py-8 font-semibold">{error}</p>
    );

  if (!stats || !profile) return null;

  return (
    <div className=" p-4  rounded-3xl  max-w-5xl mx-auto  text-gray-900">
      {/* Profile Header */}
      <div className="flex items-center gap-10 mb-10">
        {profile.avatar && (
          <img
            src={profile.avatar}
            alt={profile.username}
            className="w-32 h-32 rounded-full border-4  object-cover"
          />
        )}
        <div>
          <h2 className="text-3xl font-bold">{profile.username}</h2>
          <span className="text-gray-500 text-lg">@{profile.username}</span>
          {profile.ranking && (
            <div className="mt-2 text-md text-gray-400">Ranking: #{profile.ranking}</div>
          )}
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex justify-between items-center gap-8 mb-10">
        <CircleStat label="Easy" value={stats.easy} color="#4ADE80" />
        <CircleStat label="Medium" value={stats.medium} color="#FACC15" />
        <CircleStat label="Hard" value={stats.hard} color="#F87171" />
        <CircleStat label="Total" value={stats.total} color="#60A5FA" />
      </div>

      {/* Badges Display */}
      {profile.badges && profile.badges.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-3">
          {profile.badges.map((badge) => (
            <span
              key={badge.name}
              className="px-3 py-1 bg-yellow-200 text-yellow-800 text-sm font-semibold rounded-full"
            >
              {badge.displayName || badge.name}
            </span>
          ))}
        </div>
      )}

      {/* Visit Profile Button */}
      <div className="flex justify-center mt-4">
        <a
          href={`https://leetcode.com/${username}`}
          target="_blank"
          rel="noopener noreferrer"
          className="px-8 py-4 bg-gray-800 text-white rounded-full font-semibold text-lg"
        >
          Visit LeetCode Profile
        </a>
      </div>
    </div>
  );
};

const CircleStat = ({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) => {
  return (
    <div className="flex flex-col items-center">
      <div
        className="w-24 h-24 rounded-full border-8 flex items-center justify-center mb-2"
        style={{ borderColor: color }}
      >
        <span className="text-3xl font-extrabold">{value}</span>
      </div>
      <span className="text-lg text-gray-700 font-medium">{label}</span>
    </div>
  );
};

export default LeetCodeCard;
