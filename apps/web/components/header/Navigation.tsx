"use client";
import React from "react";
import Link from "next/link";
import { AiFillHome } from "react-icons/ai";
import { IoChatbubbleEllipsesSharp, IoNotifications } from "react-icons/io5";
import { RxAvatar } from "react-icons/rx";
import { usePathname } from "next/navigation";
import { FaUsers } from "react-icons/fa";
import { SiGooglemeet } from "react-icons/si";
const navItems = [
  { logo: <AiFillHome size={22} />, title: "Home", href: "/" },
  {logo : <FaUsers size={22} /> , title:"Session" , href:"/session"},
  {logo : <SiGooglemeet size={22} /> , title:"Room" , href:"/room"},
  { logo: <IoChatbubbleEllipsesSharp size={22} />, title: "Messaging", href: "/messaging" },
  { logo: <IoNotifications size={22} />, title: "Notifications", href: "/notifications" },
  { logo: <RxAvatar size={22} />, title: "Me", href: "/profile" }
  
];

const Navigation = () => {
  const pathname = usePathname();

  return (
    <nav className="flex items-center gap-14 h-15">
      {navItems.map((item) => {
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.title}
            href={item.href}
            className={`relative flex flex-col items-center justify-center h-full transition ${
              isActive ? "text-black" : "text-gray-600 hover:text-black"
            }`}
          >
            {item.logo}
            <span className="text-xs">{item.title}</span>

            {/* underline indicator - sticks at bottom */}
            {isActive && (
              <div className="absolute bottom-[-10] h-0.5 w-12 bg-black rounded"></div>
            )}
          </Link>
        );
      })}
    </nav>
  );
};

export default Navigation;
