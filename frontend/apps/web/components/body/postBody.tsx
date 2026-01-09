"use client";

import React, { useEffect, useState } from "react";
import { ThumbsUp, MessageSquare, Share2, Send, Bookmark } from "lucide-react";
import Image from "next/image";
import { Button } from "@repo/ui/button";
import Link from "next/link";
import { authAPI, userDataAPI } from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";

const PostBody = () => {
  const { user } = useAuth();
  const [postsData, setPostsData] = useState<any[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await userDataAPI.getAllPosts();
        setPostsData(res.data || []);
        console.log("Posts:", res.data);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  const handleShare = async (postId: string) => {
    const shareUrl = `${window.location.origin}/post/${postId}`;

    if (navigator.share) {
      await navigator.share({
        title: "Check out this post",
        url: shareUrl,
      });
    } else {
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied to clipboard");
    }
  };


  const followUser = async (id: string) => {
    try {
      const res = await userDataAPI.userFollow(id);
      console.log("Follow response:", res.data);
      // setIsConnected(true);
      toast.success("User followed successfully!");
    } catch (err) {
      console.error("Follow error:", err);
      toast.error("Failed to follow user");
    }
  };
  return (
    <div className="text-black mt-20 w-[600px] h-[89vh] overflow-y-scroll space-y-6 px-3 hide-scrollbar">
      {/* Create Post Box */}
      <div className="bg-white rounded-2xl shadow-md border p-4 hover:shadow-lg transition">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-300">
            {user?.imageUrl ? (
              <Image
                src={user.imageUrl}
                alt={user.name}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-white">
                {user?.name?.[0].toUpperCase() || "U"}
              </span>
            )}
          </div>
          <Link href="/create-post">
            <div className="flex-1 border w-[490px] rounded-full px-4 py-2 focus:outline-none hover:bg-gray-50 cursor-pointer text-gray-600">
              Offer to teach & learn...
            </div>
          </Link>
        </div>
      </div>

      {/* Feed Posts */}
      {postsData?.map((post) => (
        <div
          key={post._id}
          className="bg-white rounded-2xl shadow-md border p-4 space-y-4 hover:shadow-lg transition"
        >
          {/* User Info */}
          <div className="flex items-center justify-between">
            <Link href={`/user/${post.user}`}>
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full overflow-hidden mt-[-4]">
                  {post?.userPostDetails?.imageUrl ? (
                    <Image
                      src={post.userPostDetails.imageUrl}
                      alt={post.userPostDetails.name}
                      width={42}
                      height={42}
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {post?.userPostDetails?.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {post?.userPostDetails?.collegeName || "User"}
                  </p>
                  <div className="flex gap-2" >
                    <p className="text-xs text-gray-500 italic">
                      @{post?.userPostDetails?.domain || "@GenAI"}
                    </p>
                    <span className="text-xs m text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>


              </div>
            </Link>
            {/* <button
              className="font-semibold text-sm px-3 py-1 rounded"
              onClick={() => followUser(post.user)}
            > */}
            {/* {isConnected ? "Connected" : "+ Connect"} */}
            {/* + Connect */}
            {/* </button> */}
          </div>

          {/* Teach & Learn Skills */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Teaches</p>
              <p className="text-lg font-bold text-green-600">
                {post?.wantToTeach || "Nothing"}
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-center">
              <p className="text-xs text-gray-500">Wants to Learn</p>
              <p className="text-lg font-bold text-blue-600">
                {post?.wantToLearn || "Nothing"}
              </p>
            </div>
          </div>

          {/* Specific Topic */}
          <div className="flex flex-wrap gap-3 mt-2">
            {/* Specific Topic */}
            {post?.specificTopic && (
              <div className="flex-1 min-w-[120px] px-3 py-2 border-l-4 border-blue-400 bg-blue-50 text-sm text-gray-700 rounded">
                <span className="font-semibold">Topic:</span> {post.specificTopic}
              </div>
            )}

            {/* Post URL */}
            {post?.postUrl && (
              <div className="flex-1 min-w-[120px] px-3 py-2 border-l-4 border-blue-400 bg-blue-50 text-sm text-gray-700 rounded">
                <Link
                  href={post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 min-w-[140px] px-4 py-2  text-blue-700 text-sm font-semibold  text-center"
                >
                  View Resource / Link
                </Link>
              </div>
            )}


          </div>


          {/* Trending Skills */}
          <div className="flex flex-wrap gap-2">
            {(post?.trendingSkills && post.trendingSkills.length > 0
              ? post.trendingSkills
              : ['React', 'Node.js', 'MongoDB', 'TypeScript', 'GraphQL']
            ).map((tag: string, i: number) => (
              <span
                key={i}
                className="bg-gray-100 text-blue-600 text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-blue-100"
              >
                {tag}
              </span>
            ))}
          </div>


          {/* Post Image */}
          {post?.postImageUrl && (
            <Image
              src={post.postImageUrl}
              alt="post image"
              width={600}
              height={300}
              className="rounded-xl border object-cover"
            />
          )}

          {/* Actions */}
          <div className="flex justify-around text-gray-600 text-sm pt-2 border-t border-gray-200">
            {/* Like */}
            <Button
              variant="ghost"
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <ThumbsUp size={16} />
              <span>Like</span>
            </Button>

            {/* Save */}
            <Button
              variant="ghost"
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <Bookmark size={16} />
              <span>Save</span>
            </Button>

            {/* Share */}
            <Button
              variant="ghost"
              onClick={() => handleShare(post._id)}
              className="flex items-center gap-1 hover:text-blue-600"
            >
              <Share2 size={16} />
              <span>Share</span>
            </Button>

            {/* Book Session */}
            <Link href={`/book-session/${post._id}`}>
              <Button
                variant="ghost"
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <Send size={16} />
                <span>Book Session</span>
              </Button>
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PostBody;
