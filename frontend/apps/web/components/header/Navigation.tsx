// "use client";

// import React, { useState, useRef, useEffect } from "react";
// import Link from "next/link";
// import { AiFillHome, AiOutlineEdit, AiOutlineSafetyCertificate } from "react-icons/ai";
// import { IoChatbubbleEllipsesSharp, IoNotifications, IoLogOutOutline } from "react-icons/io5";
// import { RxAvatar } from "react-icons/rx";
// import { FaUsers } from "react-icons/fa";
// import { SiGooglemeet } from "react-icons/si";
// import { FiCode } from 'react-icons/fi';
// import { usePathname } from "next/navigation";
// import { useAuth } from "../../contexts/AuthContext";
// import { userDataAPI } from "../../services/api";
// import { io, Socket } from "socket.io-client";
// import Image from "next/image";

// interface UserData {
//   _id: string;
//   name?: string;
//   email?: string;
//   imageUrl?: string;
// }

// interface Notification {
//   title: string;
//   message: string;
//   type?: string;
//   _id?: string;
// }

// const Navigation = () => {
//   const pathname = usePathname();
//   const { logout } = useAuth();
//   const [showDropdown, setShowDropdown] = useState(false);
//   const dropdownRef = useRef<HTMLDivElement>(null);
//   const [userFetchData, setUserFetchData] = useState<UserData | null>(null);
//   const [imageError, setImageError] = useState(false);
//   const [notifications, setNotifications] = useState<Notification[]>([]);
//   const socketRef = useRef<Socket | null>(null);

//   const navItems = [
//     { logo: <AiFillHome size={22} />, title: "Home", href: "/" },
//     { logo: <FaUsers size={22} />, title: "Session", href: "/session" },
//     { logo: <SiGooglemeet size={22} />, title: "Room", href: "/room" },
//     { logo: <IoChatbubbleEllipsesSharp size={22} />, title: "Messaging", href: "/messaging" },
//     { logo: <IoNotifications size={22} />, title: "Notifications", href: "/notifications" },
//   ];

//   // Fetch user profile and setup socket
//   useEffect(() => {
//     const fetchUser = async () => {
//       try {
//         console.log("[Navigation] Fetching user profile...");
//         const response = await userDataAPI.getProfile();
//         const userData = {
//           ...response.data,
//           imageUrl: response.data.imageUrl || "/default-avatar.png",
//         };
//         console.log("[Navigation] User data fetched:", userData);
//         setUserFetchData(userData);

//         // Connect to socket.io
//         socketRef.current = io("http://localhost:4000", {
//           query: { userId: userData._id },
//           transports: ["websocket"],
//         });

//         socketRef.current.on("connect", () => {
//           console.log("[Navigation] Socket connected, id:", socketRef.current?.id);
//         });

//         socketRef.current.on("connect_error", (err) => {
//           console.error("[Navigation] Socket connection error:", err);
//         });

//         socketRef.current.on("notification", (notif: Notification) => {
//           console.log("[Navigation] Received notification:", notif);
//           setNotifications((prev) => [notif, ...prev]);
//         });

//       } catch (error) {
//         console.error("[Navigation] Failed to fetch user data:", error);
//       }
//     };
//     fetchUser();

//     return () => {
//       console.log("[Navigation] Cleaning up socket...");
//       socketRef.current?.disconnect();
//     };
//   }, []);

//   // Close dropdown on route change
//   useEffect(() => {
//     setShowDropdown(false);
//   }, [pathname]);

//   // Close dropdown if clicked outside
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
//         setShowDropdown(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   // Reset notifications when visiting /notifications page
//   useEffect(() => {
//     if (pathname === "/notifications") {
//       console.log("[Navigation] Resetting notifications as user visited /notifications");
//       setNotifications([]);
//     }
//   }, [pathname]);


//   return (
//     <nav className="flex items-center gap-14 h-16 relative px-6 shadow-sm">
//       {/* Navigation Links */}
//       {navItems.map((item) => {
//          const Logo = item.logo;
//         const isActive = pathname === item.href;
//         const isNotification = item.title === "Notifications";

//         return (
//           <Link
//             key={item.title}
//             href={item.href}
//             className={`relative flex flex-col items-center justify-center h-full transition ${isActive ? "text-black" : "text-gray-600 hover:text-black"
//               }`}
//           >
//             {Logo}

//             {/* Notification badge */}
//             {isNotification && notifications.length > 0 && (
//               <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
//                 {notifications.length}
//               </span>
//             )}

//             <span className="text-xs">{item.title}</span>
//             {isActive && <div className="absolute bottom-0 h-0.5 w-12 bg-black rounded"></div>}
//           </Link>
//         );
//       })}

//       {/* User Dropdown */}
//       {userFetchData && (
//         <div className="relative ml-auto" ref={dropdownRef}>
//           <button
//             onClick={() => setShowDropdown(!showDropdown)}
//             className="flex flex-col items-center py-2 rounded-full hover:bg-gray-100 transition focus:outline-none"
//           >
//             {!userFetchData.imageUrl || imageError ? (
//               <div className="flex flex-col items-center">
//                 <RxAvatar size={22} className="text-gray-700" />
//                 <span className="text-xs text-gray-700 font-medium">Profile</span>
//               </div>
//             ) : (
//               <div className="flex flex-col items-center">
//                 <Image
//                   src={userFetchData.imageUrl}
//                   alt={userFetchData.name || "User Avatar"}
//                    width={30}
//                   height={30}
//                   className="w-7 h-7 rounded-full object-cover"
//                   onError={() => setImageError(true)}
//                 />
//                 <span className="text-xs text-gray-700 font-medium">Profile</span>
//               </div>
//             )}
//           </button>

//           {showDropdown && (
//             <div className="absolute right-0 mt-2 w-52 px-1 bg-white border border-gray-200 rounded-[14px] shadow-lg py-2 z-50">
//               <Link
//                 href={`/profile/${userFetchData._id}`}
//                 className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
//               >
//                 <RxAvatar size={22} />
//                 <span className="text-gray-500 font-medium">Profile</span>
//               </Link>

//               <Link
//                 href={`/coding-profile/${userFetchData._id}`}
//                 className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
//               >
//                 <FiCode size={22} />
//                 <span className="text-gray-500 font-medium">Coding Profile</span>
//               </Link>

//               <Link
//                 href="/profile/edit"
//                 className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
//               >
//                 <AiOutlineEdit size={20} />
//                 <span className="text-gray-500 font-medium">Edit Profile</span>
//               </Link>
//               <Link
//                 href="/profile/certificates"
//                 className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
//               >
//                 <AiOutlineSafetyCertificate size={20} />
//                 <span className="text-gray-500 font-medium">Certificates</span>
//               </Link>

//               <button
//                 onClick={logout}
//                 className="flex items-center gap-3 w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
//               >
//                 <IoLogOutOutline size={20} />
//                 <span className="text-gray-500 font-medium">Logout</span>
//               </button>
//             </div>
//           )}
//         </div>
//       )}
//     </nav>
//   );
// };

// export default Navigation;


"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { AiFillHome, AiOutlineEdit, AiOutlineSafetyCertificate } from "react-icons/ai";
import { IoChatbubbleEllipsesSharp, IoNotifications, IoLogOutOutline } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { FaUsers } from "react-icons/fa";
import { SiGooglemeet } from "react-icons/si";
import { FiCode } from 'react-icons/fi';
import { usePathname } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import { userDataAPI } from "../../services/api";
import { io, Socket } from "socket.io-client";
import Image from "next/image";

interface UserData {
  _id: string;
  name?: string;
  email?: string;
  imageUrl?: string;
}

interface Notification {
  title: string;
  message: string;
  type?: string;
  _id?: string;
}

const Navigation = () => {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [userFetchData, setUserFetchData] = useState<UserData | null>(null);
  const [imageError, setImageError] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const socketRef = useRef<Socket | null>(null);

  // Changed to use component references instead of JSX elements
  const navItems = [
    { Icon: AiFillHome, title: "Home", href: "/" },
    { Icon: FaUsers, title: "Session", href: "/session" },
    { Icon: SiGooglemeet, title: "Room", href: "/room" },
    { Icon: IoChatbubbleEllipsesSharp, title: "Messaging", href: "/messaging" },
    { Icon: IoNotifications, title: "Notifications", href: "/notifications" },
  ];

  // Fetch user profile and setup socket
  useEffect(() => {
    const fetchUser = async () => {
      try {
        console.log("[Navigation] Fetching user profile...");
        const response = await userDataAPI.getProfile();
        const userData = {
          ...response.data,
          imageUrl: response.data.imageUrl || "/default-avatar.png",
        };
        console.log("[Navigation] User data fetched:", userData);
        setUserFetchData(userData);

        // Connect to socket.io
        socketRef.current = io("http://localhost:4000", {
          query: { userId: userData._id },
          transports: ["websocket"],
        });

        socketRef.current.on("connect", () => {
          console.log("[Navigation] Socket connected, id:", socketRef.current?.id);
        });

        socketRef.current.on("connect_error", (err) => {
          console.error("[Navigation] Socket connection error:", err);
        });

        socketRef.current.on("notification", (notif: Notification) => {
          console.log("[Navigation] Received notification:", notif);
          setNotifications((prev) => [notif, ...prev]);
        });

      } catch (error) {
        console.error("[Navigation] Failed to fetch user data:", error);
      }
    };
    fetchUser();

    return () => {
      console.log("[Navigation] Cleaning up socket...");
      socketRef.current?.disconnect();
    };
  }, []);

  // Close dropdown on route change
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

  // Reset notifications when visiting /notifications page
  useEffect(() => {
    if (pathname === "/notifications") {
      console.log("[Navigation] Resetting notifications as user visited /notifications");
      setNotifications([]);
    }
  }, [pathname]);


  return (
    <nav className="flex items-center gap-14 h-16 relative px-6 shadow-sm">
      {/* Navigation Links */}
      {navItems.map((item) => {
        const Icon = item.Icon; // Get the component reference
        const isActive = pathname === item.href;
        const isNotification = item.title === "Notifications";

        return (
          <Link
            key={item.title}
            href={item.href}
            className={`relative flex flex-col items-center justify-center h-full transition ${
              isActive ? "text-black" : "text-gray-600 hover:text-black"
            }`}
          >
            <Icon size={22} />

            {/* Notification badge */}
            {isNotification && notifications.length > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {notifications.length}
              </span>
            )}

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
                <Image
                  src={userFetchData.imageUrl}
                  alt={userFetchData.name || "User Avatar"}
                  width={30}
                  height={30}
                  className="w-7 h-7 rounded-full object-cover"
                  onError={() => setImageError(true)}
                />
                <span className="text-xs text-gray-700 font-medium">Profile</span>
              </div>
            )}
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-52 px-1 bg-white border border-gray-200 rounded-[14px] shadow-lg py-2 z-50">
              <Link
                href={`/profile/${userFetchData._id}`}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <RxAvatar size={22} />
                <span className="text-gray-500 font-medium">Profile</span>
              </Link>

              <Link
                href={`/coding-profile/${userFetchData._id}`}
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <FiCode size={22} />
                <span className="text-gray-500 font-medium">Coding Profile</span>
              </Link>

              <Link
                href="/profile/edit"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <AiOutlineEdit size={20} />
                <span className="text-gray-500 font-medium">Edit Profile</span>
              </Link>
              <Link
                href="/profile/certificates"
                className="flex items-center gap-3 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
              >
                <AiOutlineSafetyCertificate size={20} />
                <span className="text-gray-500 font-medium">Certificates</span>
              </Link>

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