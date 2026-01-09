import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ExternalLink, Calendar } from "lucide-react";
import { userDataAPI } from "../../services/api";

interface ProfilePost {
  _id: string;
  wantToLearn: string;
  wantToTeach: string;
  specificTopic: string;
  postImageUrl?: string;
  postUrl?: string;
  createdAt: string;
}

const ProfilePosts = () => {
  const [posts, setPosts] = useState<ProfilePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await userDataAPI.myPosts();
        setPosts(res.data);
      } catch (error) {
        console.error("Failed to fetch posts", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="relative">
          <div className="w-12 h-12 border-3 border-gray-200 rounded-full"></div>
          <div className="w-12 h-12 border-3 border-gray-900 border-t-transparent rounded-full animate-spin absolute top-0"></div>
        </div>
      </div>
    );
  }

  if (!posts.length) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-500 text-base">You haven't posted anything yet</p>
        <p className="text-sm text-gray-400 mt-2">Your learning & teaching posts will appear here</p>
      </div>
    );
  }

  return (
    <div className="mt-6 max-w-4xl mx-auto">
      <div className="space-y-5">
        {posts.map((post) => (
          <div
            key={post._id}
            className="rounded-lg transition-shadow"
          >
            <div className="flex gap-5 p-5">
              {/* Image */}
              {post.postImageUrl && (
                <div className="w-48 h-48 relative flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={post.postImageUrl}
                    alt="Post"
                    fill
                    className="object-cover"
                  />
                </div>
              )}

              {/* Content */}
              <div className="flex-1 flex flex-col justify-between min-w-0">
                {/* Skills */}
                <div>
                  <div className="flex gap-3 mb-4">
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium mb-1">Teaching</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{post.wantToTeach}</p>
                    </div>
                    <div className="flex-1 bg-gray-50 rounded-lg p-3 border border-gray-200">
                      <p className="text-xs text-gray-500 font-medium mb-1">Learning</p>
                      <p className="text-sm font-semibold text-gray-900 truncate">{post.wantToLearn}</p>
                    </div>
                  </div>

                  {/* Topic */}
                  <div className="mb-4">
                    <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                      {post.specificTopic}
                    </p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.createdAt).toLocaleDateString('en-US', { 
                      month: 'short', 
                      day: 'numeric',
                      year: 'numeric'
                    })}
                  </div>

                  {post.postUrl && (
                    <a
                      href={post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                    >
                      View Post
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfilePosts;