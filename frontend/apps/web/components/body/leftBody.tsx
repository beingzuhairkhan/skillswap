'use client'
import React, { useEffect, useState } from "react";
import {
  MdTrendingUp,
  MdSaveAlt,
  MdCheckCircle,
  MdStar,
  MdMenuBook,
  MdSchool
} from "react-icons/md";
import { useAuth } from "../../contexts/AuthContext";
import Image from "next/image";
import Link from "next/link";
import { SessionAPI } from "../../services/api";

interface DashboardData {
  skillsToTeach: number;
  skillsToLearn: number;
  sessionsCompleted: number;
  avgRating: number;
  ratingCount: number;
}


const LeftBody = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<DashboardData | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const dashboardData = await SessionAPI.getDashboardData();
        setData(dashboardData.data)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="mt-20 hidden sm:block w-[260px] space-y-4">

      {/* ================= PROFILE CARD ================= */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <div className="h-20 bg-gradient-to-r from-gray-100 via-slate-100 to-gray-100 relative">
          <div className="absolute inset-0 bg-black/5"></div>
        </div>

        <div className="flex flex-col items-center -mt-12 px-5 pb-5">
          {loading ? (
            <>
              {/* Avatar Skeleton */}
              <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />

              {/* Text Skeleton */}
              <div className="mt-4 h-4 w-32 bg-gray-200 rounded animate-pulse" />
              <div className="mt-2 h-3 w-40 bg-gray-200 rounded animate-pulse" />
              <div className="mt-1 h-3 w-24 bg-gray-200 rounded animate-pulse" />
            </>
          ) : (
            <>
              <div className="relative group">
                <Link href={`/profile/${user?._id}`}>
                  <div className="w-24 h-24 rounded-full border border-gray-200 bg-white shadow-sm">
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
                    </div>
                  </div>
                </Link>
              </div>

              <h2 className="mt-4 font-bold text-base text-gray-900">
                {user?.name}
              </h2>
              <p className="text-sm text-gray-600 mt-1 text-center">
                {user?.collegeName}
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                @{user?.domain}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-center gap-2 mb-3">
          <MdTrendingUp size={20} />
          <h3 className="text-sm font-semibold text-gray-900">
            Your Skill Stats
          </h3>
        </div>

        <div className="space-y-3">
          {loading ? (
            [...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
                <div className="h-4 w-6 bg-gray-200 rounded animate-pulse" />
              </div>
            ))
          ) : (
            <>
              <StatRow
                icon={<MdSchool className="text-green-500" size={16} />}
                label="Skills to Teach"
                value={data?.skillsToTeach || 0}
              />
              <StatRow
                icon={<MdMenuBook className="text-purple-500" size={16} />}
                label="Skills to Learn"
                value={data?.skillsToLearn || 0}
              />
              <StatRow
                icon={<MdCheckCircle className="text-blue-500" size={16} />}
                label="Sessions Completed"
                value={data?.sessionsCompleted || 0}
              />
              <StatRow
                icon={<MdStar className="text-yellow-400" size={16} />}
                label="Rating"
                value={data?.avgRating || 0}
              />
            </>
          )}
        </div>
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-shadow duration-300">
        <div className="grid grid-cols-2 gap-3">
          {[
            { icon: <MdTrendingUp size={24} />, text: "Skill Gap Analysis" },
            { icon: <MdSaveAlt size={20} />, text: "Saved" }
          ].map((item, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center justify-center gap-1 p-3 rounded-xl hover:bg-gray-50 cursor-pointer transition-all"
            >
              <div className="text-blue-500">{item.icon}</div>
              <span className="text-xs font-medium text-gray-700">
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const StatRow = ({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      {icon}
      <span className="text-xs text-gray-600">{label}</span>
    </div>
    <span className="text-sm font-bold text-gray-900">{value}</span>
  </div>
);

export default LeftBody;
