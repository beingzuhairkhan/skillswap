"use client";

import React from "react";
import {
  Image as ImageIcon,
  Video,
  FileText,
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@repo/ui/button";
import Link from 'next/link'

const PostBody = () => {
  const posts = [
    {
      id: 1,
      user: "Anindita Prakash",
      role: "Assistant Talent Acquisition Partner at Jacobs, India",
      time: "2d",
      content:
        "Hello Connections!! You are welcome to participate in our WalkIn Drive for Structural Design",
      hashtags: [
        "#StructuralDesign",
        "#WalkInDrive",
        "#GurgaonJobs",
        "#EngineeringCareers",
      ],
      image: "https://media.istockphoto.com/id/477473902/photo/tea-plantations.jpg?s=2048x2048&w=is&k=20&c=tiwPjnNHBJxrEXs6XWjshgpuzEjFq-8L9zn1A6TDxFM=", // ✅ safe dummy
    },
    {
      id: 2,
      user: "Priya Sharma",
      role: "Talent Acquisition Partner @ Jacobs || Ex-AECOM",
      time: "2d",
      content: "We are hiring for multiple positions 🚀",
      hashtags: ["#WeAreHiring", "#WalkIn", "#StructuralEngineer"],
      image: "https://media.istockphoto.com/id/995369236/photo/starfish-on-beach.jpg?s=2048x2048&w=is&k=20&c=DfQPdxYOerxX7YOeV2KZ8USjw4vOHwbsec5vYJ9ppDc=",
    },
    {
      id: 3,
      user: "Anindita Prakash",
      role: "Assistant Talent Acquisition Partner at Jacobs, India",
      time: "2d",
      content:
        "Hello Connections!! You are welcome to participate in our WalkIn Drive for Structural Design",
      hashtags: [
        "#StructuralDesign",
        "#WalkInDrive",
        "#GurgaonJobs",
        "#EngineeringCareers",
      ],
      image: "https://media.istockphoto.com/id/995369236/photo/starfish-on-beach.jpg?s=2048x2048&w=is&k=20&c=DfQPdxYOerxX7YOeV2KZ8USjw4vOHwbsec5vYJ9ppDc=",
    },
  ];

  return (
    <div className="text-black mt-20 w-[600px] h-[80vh] overflow-y-scroll space-y-6 px-3 hide-scrollbar">
      {/* Create Post Box */}
      <div className="bg-white rounded-lg shadow border p-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          {/* <input
            type="text"
            placeholder="Start a post"
            className="flex-1 border rounded-full px-4 py-2 focus:outline-none hover:bg-gray-50 cursor-pointer"
          /> */}
          <Link href="/create-post">
            <div className="flex-1 border w-[490px] rounded-full px-4 py-2 focus:outline-none hover:bg-gray-50 cursor-pointer">
              Start a post
            </div>
          </Link>

        </div>
        <div className="flex justify-around mt-4 text-gray-600 text-sm">
          <button className="flex items-center space-x-1 hover:text-blue-500">
            <Video size={18} /> <span>Video</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-green-500">
            <ImageIcon size={18} /> <span>Photo</span>
          </button>
          <button className="flex items-center space-x-1 hover:text-orange-500">
            <FileText size={18} /> <span>Write article</span>
          </button>
        </div>
      </div>

      {/* Feed Posts */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-lg shadow border p-4 space-y-3"
        >
          {/* User Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
              <div>
                <h3 className="font-semibold">{post.user}</h3>
                <p className="text-xs text-gray-500">{post.role}</p>
                <span className="text-xs text-gray-400">{post.time} · 🌍</span>
              </div>
            </div>
            <button className="text-blue-600 font-semibold text-sm">
              + Follow
            </button>
          </div>

          {/* Post Content */}
          <p className="text-sm text-gray-800">{post.content}</p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2 text-blue-600 text-sm">
            {post.hashtags.map((tag, i) => (
              <span key={i} className="cursor-pointer hover:underline">
                {tag}
              </span>
            ))}
          </div>

          {/* Post Image */}
          {post.image && (
            <Image
              src={post.image}
              alt="post"
              width={600}
              height={300}
              className="rounded-lg border"
            />
          )}

          {/* Actions */}
          <div className="flex justify-around text-gray-600 text-sm pt-2 border-t">
            <Button className="flex items-center space-x-1 hover:text-blue-500">
              <ThumbsUp size={16} /> <span>Like</span>
            </Button>
            <Button className="flex items-center space-x-1 hover:text-blue-500">
              <MessageSquare size={16} /> <span>Comment</span>
            </Button>
            <Button className="flex items-center space-x-1 hover:text-blue-500">
              <Share2 size={16} /> <span>Share</span>
            </Button>
            <Link href="/book-session" >
            <Button className="flex items-center space-x-1 hover:text-blue-500">
              <Send size={16} /> <span>Book Session</span>
            </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostBody;
