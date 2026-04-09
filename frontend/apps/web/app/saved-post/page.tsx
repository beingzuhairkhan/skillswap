"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BookmarkCheck,
  Trash2,
  GraduationCap,
  BookOpen,
  AlertCircle,
  ArrowLeft,
  Sparkles,
  Send,
} from "lucide-react";
import { userDataAPI } from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import { Button } from "../../../../packages/ui/src/button";

interface SavedPost {
  _id: string;
  user: string;
  wantToLearn: string;
  wantToTeach: string;
  specificTopic: string;
  postImageUrl: string;
  postImagePublicId: string;
  postUrl: string;
  postPdf: string;
  trendingSkills: string[];
  likes: string[];
  comments: string[];
  createdAt: string;
  updatedAt: string;
  userPostDetails?: {
    name: string;
    imageUrl?: string;
    collegeName?: string;
    domain?: string;
  };
}

const SavedPostsPage = () => {
  const { user } = useAuth();
  const [savedPosts, setSavedPosts] = useState<SavedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSavedPosts = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await userDataAPI.getSavedPosts();
        setSavedPosts(res.data || []);
      } catch (error: any) {
        console.error("Error fetching saved posts:", error);
        setError(error?.response?.data?.message || "Failed to load saved posts");
        toast.error("Failed to load saved posts");
      } finally {
        setLoading(false);
      }
    };

    fetchSavedPosts();
  }, []);

  const handleUnsave = async (postId: string) => {
    try {
      await userDataAPI.unsavePost(postId);
      setSavedPosts((prev) => prev.filter((post) => post._id !== postId));
      toast.success("Post removed from saved");
    } catch (error: any) {
      console.error("Error unsaving post:", error);
      toast.error(error?.response?.data?.message || "Failed to unsave post");
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-black font-semibold text-lg">Loading your saved posts...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-10 bg-black text-white rounded-2xl">
          <AlertCircle size={72} className="mx-auto mb-6" />
          <h2 className="text-3xl font-bold mb-3">Something went wrong</h2>
          <p className="text-gray-300 mb-8 text-lg">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-8 py-3 bg-white text-black rounded-xl hover:bg-gray-200 transition-colors font-bold text-lg"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {savedPosts.length === 0 ? (
          <div className="text-center py-24">
            <div className="max-w-md mx-auto">
              <div className="w-24 h-24 bg-black rounded-full flex items-center justify-center mx-auto mb-6">
                <BookmarkCheck size={40} className="text-white" />
              </div>

              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No saved posts yet
              </h2>

              <p className="text-gray-500 mb-8">
                Start saving posts to build your learning collection
              </p>

              <Link href="/">
                <button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition">
                  Explore Posts
                </button>
              </Link>
            </div>
          </div>
        ) : (

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedPosts.map((post) => (

              <div
                key={post._id}
                className="bg-white rounded-xl shadow-sm hover:shadow-lg transition duration-300 overflow-hidden flex flex-col group"
              >

                {/* Image */}
                {post?.postImageUrl && (
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={post.postImageUrl}
                      alt="post"
                      fill
                      className="object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex flex-col flex-1">

                  {/* User */}
                  {post?.userPostDetails && (
                    <div className="flex items-center gap-3 mb-4">
                      {post.userPostDetails?.imageUrl ? (
                        <Image
                          src={post.userPostDetails.imageUrl}
                          alt="user"
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center font-semibold">
                          {post.userPostDetails?.name?.[0]?.toUpperCase() || "U"}
                        </div>
                      )}

                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {post.userPostDetails?.name || "Unknown"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {post.userPostDetails?.collegeName || "Student"}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Skills */}
                  <div className="flex gap-4 mb-4">
                    {/* Teaches */}
                    <div className="flex-1 bg-gray-100 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Teaches</p>
                      <p className="font-medium text-gray-900">
                        {post?.wantToTeach || "N/A"}
                      </p>
                    </div>

                    {/* Wants to Learn */}
                    <div className="flex-1 bg-gray-100 p-3 rounded-lg">
                      <p className="text-xs text-gray-500 mb-1">Wants to Learn</p>
                      <p className="font-medium text-gray-900">
                        {post?.wantToLearn || "N/A"}
                      </p>
                    </div>
                  </div>

                  {/* Topic */}
                  {post?.specificTopic && (
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                      {post.specificTopic}
                    </p>
                  )}

                  {/* Button */}
                  <div className="mt-auto flex gap-3">
                    {/* Remove Button */}
                    <button
                      onClick={() => handleUnsave(post._id)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-black hover:text-white transition"
                    >
                      <Trash2 size={16} />
                      Remove
                    </button>

                    {/* Book Session Button */}
                    <Link href={`/book-session/${post._id}`} className="flex-1">
                      <button className="w-full flex items-center justify-center gap-1 px-4 py-2 border border-blue-500 text-blue-500 rounded-lg hover:bg-blue-500 hover:text-white transition">
                        <Send size={16} />
                        Book Session
                      </button>
                    </Link>
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedPostsPage;