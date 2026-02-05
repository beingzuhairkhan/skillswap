"use client";

import React, { useEffect, useState } from "react";
import {
  ThumbsUp,
  MessageSquare,
  Share2,
  Send,
  Bookmark,
  ExternalLink,
  FileText,
  Upload,
  LinkIcon,
  X,
  BookOpen,
} from "lucide-react";
import Image from "next/image";
import { Button } from "../../../../packages/ui/src/button";
import Link from "next/link";
import { SessionAPI, userDataAPI } from "../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../contexts/AuthContext";
import PostLoader from "../Loading/Loader";

interface PostBodyProps {
  selectedSkill: string | null;
  search: string | null;
}

interface Resource {
  _id: string;
  resourceURL?: string;
  resourcePDF?: string;
  userName: { name: string };
  createdAt: string;
}

const PostBody: React.FC<PostBodyProps> = ({ selectedSkill, search }) => {
  const { user } = useAuth();
  const [postsData, setPostsData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [openPostId, setOpenPostId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");

  // Fetch posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const res = await userDataAPI.getAllPosts(search ?? undefined);
        setPostsData(res.data || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, [search]);

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

  const normalize = (str = "") => str.toLowerCase().replace(/\s+/g, "");

  const filteredPosts = selectedSkill
    ? postsData.filter((post) => {
      const searchTerm = normalize(selectedSkill);
      const regex = new RegExp(searchTerm, "i");

      const teach = normalize(post.wantToTeach);
      const learn = normalize(post.wantToLearn);

      const trending = Array.isArray(post.trendingSkills)
        ? post.trendingSkills.map((skill: any) => normalize(skill))
        : [];

      return (
        regex.test(teach) ||
        regex.test(learn) ||
        trending.some((skill: any) => regex.test(skill))
      );
    })
    : postsData;

  const handleUpload = async (postId: string) => {
    if (!file && !url) return alert("Provide a PDF or URL");

    const formData = new FormData();
    if (file) formData.append("resource", file);
    if (url) formData.append("url", url);
    formData.append("postId", postId);

    try {
      await SessionAPI.uploadResource(formData);
      toast.success("Resource uploaded!");
      setFile(null);
      setUrl("");

      // Refresh posts to get updated resources
      const res = await userDataAPI.getAllPosts(search ?? undefined);
      setPostsData(res.data || []);
    } catch (error) {
      console.error(error);
      toast.error("Upload failed");
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
                alt={user.name || "User"}
                width={40}
                height={40}
                className="object-cover w-full h-full"
              />
            ) : (
              <span className="flex items-center justify-center w-full h-full text-white">
                {user?.name?.[0]?.toUpperCase() || "U"}
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
      {loading ? (
        <div className="max-w-[560px] mx-auto">
          <PostLoader />
        </div>
      ) : filteredPosts.length === 0 ? (
        <p className="flex flex-col items-center justify-center text-gray-400 mt-20 text-lg sm:text-xl font-medium">
          <span className="text-gray-500 mb-2">No posts found for</span>
          <span className="text-blue-600 font-bold text-2xl sm:text-3xl">
            #{selectedSkill}
          </span>
        </p>
      ) : (
        filteredPosts.map((post) => (
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
                    <div className="flex gap-2">
                      <p className="text-xs text-gray-500 italic">
                        @{post?.userPostDetails?.domain || "@GenAI"}
                      </p>
                      <span className="text-xs text-gray-400">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
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

            {/* Specific Topic & URL */}
            <div className="flex flex-wrap gap-3 mt-2">
              {post?.specificTopic && (
                <div className="flex-1 min-w-[120px] px-3 py-2 border-l-4 border-blue-400 bg-blue-50 text-sm text-gray-700 rounded">
                  <span className="font-semibold">Topic:</span> {post.specificTopic}
                </div>
              )}
              {post?.postUrl && (
                <div className="flex-1 min-w-[120px] px-3 py-2 border-l-4 border-blue-400 bg-blue-50 text-sm text-gray-700 rounded">
                  <Link
                    href={post.postUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[140px] px-4 py-2 text-blue-700 text-sm font-semibold text-center"
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
                : ["React", "Node.js", "MongoDB", "TypeScript", "GraphQL"]
              ).map((tag: string, i: number) => (
                <span
                  key={i}
                  className="bg-gray-100 text-blue-600 text-xs px-3 py-1 rounded-full cursor-pointer hover:bg-blue-100"
                >
                  #{tag}
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
              {/* Resources Button */}
              <Button
                variant="ghost"
                className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-blue-600 transition-colors"
                onClick={() => setOpenPostId(post._id)}
              >
                <BookOpen size={15} />
                <span>Resources</span>
              </Button>

              <Button variant="ghost" className="flex items-center gap-1 hover:text-blue-600">
                <Bookmark size={16} />
                <span>Save</span>
              </Button>

              <Button
                variant="ghost"
                onClick={() => handleShare(post._id)}
                className="flex items-center gap-1 hover:text-blue-600"
              >
                <Share2 size={16} />
                <span>Share</span>
              </Button>

              <Link href={`/book-session/${post._id}`}>
                <Button variant="ghost" className="flex items-center gap-1 hover:text-blue-600">
                  <Send size={16} />
                  <span>Book Session</span>
                </Button>
              </Link>
            </div>

            {/* Resources Modal */}
            {openPostId === post._id && (
              <div
                className="fixed inset-0 bg-black/30 backdrop-blur-sm flex justify-center items-start pt-20 z-50"
                onClick={() => setOpenPostId(null)}
              >
                <div
                  className="bg-white w-[560px] rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Header */}
                  <div className="flex justify-between items-center px-6 pt-5 pb-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">Resources</h2>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {post.resources.length} resource{post.resources.length !== 1 ? "s" : ""} added
                      </p>
                    </div>
                    <button
                      className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                      onClick={() => setOpenPostId(null)}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {/* Divider */}
                  <div className="mx-6 border-t border-gray-100" />

                  {/* Add Resource */}
                  <div className="p-6 flex items-center gap-2">
                    {/* URL Input */}
                    <div className="relative flex-1">
                      <LinkIcon
                        size={14}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                      />
                      <input
                        type="url"
                        placeholder="Paste resource URL"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-black/10 focus:border-black outline-none"
                      />
                    </div>

                    {/* PDF Upload */}
                    <label className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg cursor-pointer bg-white hover:bg-gray-100 transition text-sm text-gray-600">
                      <Upload size={14} />
                      <span className="hidden sm:inline">{file ? "PDF Selected" : "PDF"}</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={(e) => setFile(e.target.files?.[0] || null)}
                        className="hidden"
                      />
                    </label>

                    {/* Upload Button */}
                    <Button
                      onClick={() => handleUpload(post._id)}
                      className="bg-black hover:bg-gray-800 text-white text-sm px-4 py-2 rounded-lg"
                    >
                      Upload
                    </Button>
                  </div>

                  {/* Divider */}
                  <div className="mx-6 border-t border-gray-100" />

                  {/* Resource List */}
                  <div className="px-6 py-4 max-h-52 overflow-y-auto">
                    {post?.resources?.length === 0 ? (
                      <div className="text-center py-6">
                        <FileText size={28} className="mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-400">No resources yet.</p>
                        <p className="text-xs text-gray-300">
                          Add a URL or PDF above to get started.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 overflow-y-auto  hide-scrollbar">
                        {post?.resources?.map((res: Resource) => (
                          <div
                            key={res._id}
                            className="flex items-center justify-between gap-4 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-all"
                          >
                            {/* Left side - Resource links */}
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              {res.resourceURL && (
                                <Link
                                  href={res.resourceURL}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-1.5 bg-black text-white hover:bg-gray-800 rounded-md transition-colors text-sm font-medium"
                                >
                                  <ExternalLink size={16} />
                                  <span className="truncate">View Link</span>
                                </Link>
                              )}
                              {res.resourcePDF && (
                                <Link
                                  href={res.resourcePDF}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white hover:bg-black rounded-md transition-colors text-sm font-medium"
                                >
                                  <FileText size={16} />
                                  <span className="truncate">View PDF</span>
                                </Link>
                              )}
                            </div>

                            {/* Right side - User info */}
                            <div className="flex-shrink-0 text-right">
                              <p className="text-xs font-medium text-gray-900">
                                {res.userName?.name || "Unknown"}
                              </p>
                              <p className="text-xs text-gray-500 mt-0.5">
                                {new Date(res.createdAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
};

export default PostBody;
