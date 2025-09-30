"use client";

import React from "react";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@repo/ui/button";
import Link from "next/link";

const PostBody = () => {
  const posts = [
    {
      id: 1,
      user: "Anindita Prakash",
      role: "Full Stack Developer @ Jacobs",
      time: "2d",
      teach: "Node.js",
      learn: "Python",
      tags: ["#Backend", "#JavaScript", "#Coding"],
      image:
        "https://images.unsplash.com/photo-1518770660439-4636190af475?ixlib=rb-4.0.3&q=80&w=1080&auto=format&fit=crop", // 👩‍💻 laptop coding
    },
    {
      id: 2,
      user: "Priya Sharma",
      role: "Frontend Developer @ AECOM",
      time: "3d",
      teach: "React",
      learn: "Blockchain",
      tags: ["#WebDev", "#SmartContracts", "#Frontend"],
      image:
        "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&q=80&w=1080&auto=format&fit=crop", // 🔗 blockchain visual
    },
    {
      id: 3,
      user: "Rahul Mehta",
      role: "AI Enthusiast",
      time: "1d",
      teach: "Python",
      learn: "GoLang",
      tags: ["#AI", "#MachineLearning", "#Backend"],
      image:
        "https://images.unsplash.com/photo-1677442136019-21780ecad995?ixlib=rb-4.0.3&q=80&w=1080&auto=format&fit=crop", // 🤖 AI background
    },
  ];

  return (
    <div className="text-black mt-20 w-[600px] h-[89vh] overflow-y-scroll space-y-6 px-3 hide-scrollbar">
      {/* Create Post Box */}
      <div className="bg-white rounded-2xl shadow-md border p-4 hover:shadow-lg transition">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <Link href="/create-post">
            <div className="flex-1 border w-[490px] rounded-full px-4 py-2 focus:outline-none hover:bg-gray-50 cursor-pointer text-gray-600">
              Offer to teach & learn...
            </div>
          </Link>
        </div>
      </div>

      {/* Feed Posts */}
      {posts.map((post) => (
        <div
          key={post.id}
          className="bg-white rounded-2xl shadow-md border p-4 space-y-4 hover:shadow-lg transition"
        >
          {/* User Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
              <div>
                <h3 className="font-semibold text-gray-900">{post.user}</h3>
                <p className="text-xs text-gray-500">{post.role}</p>
                <span className="text-xs text-gray-400">{post.time} · 🌍</span>
              </div>
            </div>
            <button className="text-blue-600 font-semibold text-sm">
              + Connect
            </button>
          </div>

          {/* Teach & Learn Skills */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Teaches</p>
              <p className="text-lg font-bold text-green-600">{post.teach}</p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Wants to Learn</p>
              <p className="text-lg font-bold text-blue-600">{post.learn}</p>
            </div>
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-gray-100 text-blue-600 text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-blue-100"
              >
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
              className="rounded-xl border object-cover"
            />
          )}

          {/* Actions */}
          <div className="flex justify-around text-gray-600 text-sm pt-2 border-t">
            <Button
              variant="ghost"
              className="flex items-center space-x-1 hover:text-blue-500"
            >
              <ThumbsUp size={16} /> <span>Like</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center space-x-1 hover:text-blue-500"
            >
              <MessageSquare size={16} /> <span>Comment</span>
            </Button>
            <Button
              variant="ghost"
              className="flex items-center space-x-1 hover:text-blue-500"
            >
              <Share2 size={16} /> <span>Share</span>
            </Button>
            <Link href={`/book-session/${post.id}`}>
              <Button
                variant="ghost"
                className="flex items-center space-x-1 hover:text-blue-500"
              >
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
