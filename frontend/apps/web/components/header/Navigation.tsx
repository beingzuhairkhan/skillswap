"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AiFillHome, AiOutlineEdit } from "react-icons/ai";
import { IoChatbubbleEllipsesSharp, IoNotifications, IoLogOutOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { FaUsers } from "react-icons/fa";
import { SiGooglemeet } from "react-icons/si";
import { FiCode } from 'react-icons/fi';
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { userDataAPI } from "../../services/api";

interface UserData {
  _id: string;
  name?: string;
  email?: string;
  imageUrl?: string;
}

const Navigation = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userFetchData, setUserFetchData] = useState<UserData | null>(null);
  const [imageError, setImageError] = useState(false);
  const navItems = [
    { logo: <AiFillHome size={22} />, title: "Home", href: "/" },
    { logo: <FaUsers size={22} />, title: "Session", href: "/session" },
    { logo: <SiGooglemeet size={22} />, title: "Room", href: "/room" },
    { logo: <IoChatbubbleEllipsesSharp size={22} />, title: "Messaging", href: "/messaging" },
    { logo: <IoNotifications size={22} />, title: "Notifications", href: "/notifications" },
  ];

  // Fetch user profile
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await userDataAPI.getProfile();
        // Ensure imageUrl always exists
        const userData = {
          ...response.data,
          imageUrl: response.data.imageUrl || "/default-avatar.png", // fallback image
        };
        setUserFetchData(userData);
      } catch (error) {
        console.error("Failed to fetch user data:", error);
      }
    };
    fetchUser();
  }, []);

  // Close dropdown when route changes
  useEffect(() => {
    setShowDropdown(false);
  }, [pathname]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="flex items-center gap-14 h-16 relative px-6 shadow-sm">
      {/* Navigation Links */}
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.title}
            href={item.href}
            className={`relative flex flex-col items-center justify-center h-full transition ${isActive ? "text-black" : "text-gray-600 hover:text-black"
              }`}
          >
            {item.logo}
            <span className="text-xs">{item.title}</span>
            {isActive && <div className="absolute bottom-0 h-0.5 w-12 bg-black rounded"></div>}
          </Link>
        );
      })}

      {/* User Dropdown */}
      {userFetchData && (
        <div className="relative ml-auto" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex flex-col items-center py-2 rounded-full hover:bg-gray-100 transition focus:outline-none"
          >
            {!userFetchData.imageUrl || imageError ? (
              <div className="flex flex-col items-center">
                <RxAvatar size={22} className="text-gray-700" />
                <span className="text-xs text-gray-700 font-medium">Profile</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <img
                  src={userFetchData.imageUrl}
                  alt={userFetchData.name || "User Avatar"}
                  className="w-7 h-7 rounded-full object-cover"
                  onError={() => setImageError(true)}
                />
                <span className="text-xs text-gray-700 font-medium">Profile</span>
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-[14px] shadow-lg py-2 z-50">
              {/* Profile */}
              <Link
                href={`/profile/${userFetchData._id}`}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <RxAvatar size={22} />
                <span className="text-gray-500 font-medium">Profile</span>
              </Link>

              {/* Coding Profile */}
              <Link
                href={`/coding-profile/${userFetchData._id}`}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <FiCode size={22} />
                <span className="text-gray-500 font-medium">Coding Profile</span>
              </Link>

              {/* Edit Profile */}
              <Link
                href="/profile/edit"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <AiOutlineEdit size={20} />
                <span className="text-gray-500 font-medium">Edit Profile</span>
              </Link>

              {/* Logout */}
              <button
                onClick={logout}
                className="flex items-center gap-3 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <IoLogOutOutline size={20} />
                <span className="text-gray-500 font-medium">Logout</span>
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navigation;
