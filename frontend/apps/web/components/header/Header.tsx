'use client'
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { IoSearchSharp } from "react-icons/io5";
import Navigation from "./Navigation";
import logo from "../../public/logo.png";
import { Input } from '../../../../packages/ui/src/input'



export const Header = () => {
  return (
    <header className="fixed left-0 top-0 w-full bg-[#f5f5f5] shadow-sm z-50">
      <div className="mx-auto flex max-w-7.5xl items-center justify-around py-1 px-4">
       
        <div className="flex items-center">
          <Link href="/" className="flex items-center bg-[#f5f5f5]">
            <Image src={logo} alt="SkillSwap logo" height={50} width={50} />
            <span className="hidden sm:block text-xl font-semibold text-black ml-[-10px]">
              <i>SkillSwap</i>
            </span>
          </Link>

          {/* Search Bar right next to logo */}
          <div className="relative hidden md:flex w-64 ml-6">
            <Input
              type="text"
              placeholder="Search..."
              className="w-[550px] rounded-full border border-gray-300 bg-white px-4 py-2 pl-10 text-sm focus:border-[#1867C2] focus:outline-none"
            />
            <IoSearchSharp className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          </div>
        </div>

        {/* Right Section: Navigation */}
        <Navigation />
      </div>
    </header>
  );
};
