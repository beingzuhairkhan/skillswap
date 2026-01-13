"use client";
import React, { useState, ChangeEvent } from "react";
import signupImage from "../../public/create-post.png";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { AiOutlinePaperClip } from "react-icons/ai";
import { IoImageOutline } from "react-icons/io5";
import { FaLink } from "react-icons/fa6";
import { useAuth } from "../../contexts/AuthContext";
import { userDataAPI } from "../../services/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
interface ICreatePost {
  wantLearn: string;
  wantTeach: string;
  specificTopic: string;
  trendingSkills?: string[];
  image?: File;
  pdf?: File;
  link?: string;
}

const trendingSkillsList = [
  "frontend",
  "react",
  "machinelearning",
  "cybersecurity",
  "uiux",
];

const CreatePost = () => {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ICreatePost>();

  const { user } = useAuth()
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [urlLink, setUrlLink] = useState<string>("");
  const router = useRouter();
  const onSubmit = async (data: ICreatePost) => {
    console.log("res", data)
    const response = await userDataAPI.createPost(data);
    console.log("Post created:", response);
    if (response.status == 201) {
      toast.success("Post Created Successfully")
      router.push("/");
    }

    handleCancel();
  };

  const handleCancel = () => {
    reset();
    setPdfFile(null);
    setImageFile(null);
    setUrlLink("");
    setValue("pdf", undefined);
    setValue("image", undefined);
    setValue("link", "");
  };

  const handlePdfChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPdfFile(file);
      setValue("pdf", file);
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageFile(file);
      setValue("image", file);
    }
  };

  const handleAddUrl = () => {
    const link = prompt("Enter URL:");
    if (link) {
      setUrlLink(link);
      setValue("link", link);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-14 p-6">
      <h1 className="text-3xl font-semibold">Create New Post</h1>

      {/* Banner */}
      <div className="relative mt-4">
        <Image
          src={signupImage}
          alt="signup image"
          className="rounded-[10px] w-full h-[200px] object-cover object-center"
        />
        <div className="absolute bottom-4 left-4 text-white">
          <h2 className="text-xl font-semibold">{user?.name} — Learner/Teacher</h2>
          <p className="text-sm">
            Write about what you want to learn or what you can teach…
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl p-6 mt-6 space-y-6"
      >
        {/* I want to learn */}
        <div>
          <label className="block mb-2 text-md font-semibold text-gray-700">
            I want to learn
          </label>
          <input
            type="text"
            {...register("wantLearn", { required: "This field is required" })}
            placeholder="Add skills"
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg text-gray-800
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
             transition"
          />

          {errors.wantLearn && (
            <p className="text-red-500 text-sm mt-1">{errors.wantLearn.message}</p>
          )}
        </div>

        {/* I can teach */}
        <div>
          <label className="block mb-2 text-md font-semibold text-gray-700">
            I can teach
          </label>
          <input
            type="text"
            {...register("wantTeach", { required: "This field is required" })}
            placeholder="Add skills"
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg text-gray-800
             focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
             transition"
          />

          {errors.wantTeach && (
            <p className="text-red-500 text-sm mt-1">{errors.wantTeach.message}</p>
          )}
        </div>

        {/* Specific Topic */}
        <div>
          <label className="block mb-2 text-md font-semibold text-gray-700">
            Specific Topic
          </label>
          <textarea
            {...register("specificTopic", { required: "This field is required" })}
            placeholder="Add specific topic"
            rows={4}
            className="w-full md:w-1/2 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
          />
          {errors.specificTopic && (
            <p className="text-red-500 text-sm mt-1">{errors.specificTopic.message}</p>
          )}
        </div>

        {/* Trending Skills */}
        <div>
          <p className="font-medium mb-2 text-gray-700">Trending Skills</p>
          <div className="flex flex-wrap gap-3">
            {trendingSkillsList.map((skill) => (
              <span
                key={skill}
                className="px-3 py-1 bg-gray-200 rounded-full font-thin text-sm cursor-pointer hover:bg-gray-300 transition"
              >
                #{skill}
              </span>
            ))}
          </div>
        </div>

        {/* Attachments */}
        <div className="flex gap-6 ">
          {/* PDF */}
          <div className="flex flex-col items-center ">
            <label>
              <AiOutlinePaperClip
                size={35}
                className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition cursor-pointer"
              />
              <input
                type="file"
                accept=".pdf"
                onChange={handlePdfChange}
                className="hidden"
              />
            </label>
            <span className="text-xs mt-1 font-medium">PDF</span>
          </div>

          {/* Image */}
          <div className="flex flex-col items-center ">
            <label>
              <IoImageOutline
                size={35}
                className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition cursor-pointer"
              />
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
            <span className="text-xs mt-1 font-medium">Image</span>
          </div>

          {/* URL */}
          <div
            className="flex flex-col items-center cursor-pointer"
            onClick={handleAddUrl}
          >
            <FaLink
              size={35}
              className="bg-gray-200 rounded-full p-2 hover:bg-gray-300 transition"
            />
            <span className="text-xs mt-1 font-medium">URL</span>
          </div>
        </div>

        {/* Show Selected Attachments */}
        <div className="mt-4 space-y-2">
          {pdfFile && (
            <p className="text-sm flex items-center gap-2">
              <AiOutlinePaperClip size={20} className="text-gray-600" />
              <span className="font-medium">{pdfFile.name}</span>
            </p>
          )}
          {imageFile && (
            <div className="flex items-center gap-2">
              <IoImageOutline size={20} className="text-gray-600" />
              <img
                src={URL.createObjectURL(imageFile)}
                alt="preview"
                className="w-40 h-40 object-cover rounded-md"
              />
            </div>
          )}
          {urlLink && (
            <p className="text-sm flex items-center gap-2">
              <FaLink size={20} className="text-gray-600" />
              <a
                href={urlLink}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                {urlLink}
              </a>
            </p>
          )}
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end mt-4">
          <button
            type="submit"
            className="bg-black text-white hover:bg-gray-900 transition rounded-md py-3 px-6 w-full sm:w-auto"
          >
            Post
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="bg-black text-white hover:bg-gray-900 transition rounded-md py-3 px-6 w-full sm:w-auto"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreatePost;
