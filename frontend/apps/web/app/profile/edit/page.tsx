"use client";
import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import Image from "next/image";
import ProfileImage from "../../../public/book-seesion.png";
import { userDataAPI } from "../../../services/api";
import toast from "react-hot-toast";
import { useAuth } from "../../../contexts/AuthContext";
import { Plus } from "lucide-react";

interface ProfileFormData {
    name: string;
    collegeName: string;
    bio: string;
    skillsToTeach: { value: string }[];
    skillsToLearn: { value: string }[];
    imageUrl?: string;
    domain?: string
}

const EditProfile = () => {
    const { user } = useAuth();
    //   console.log("user", user)
    const [preview, setPreview] = useState<string>();
    const [imageFile, setImageFile] = useState<File | null>(null);
    const {
        register,
        handleSubmit,
        control,
        reset,
        setValue,
        formState: { isSubmitting },
    } = useForm<ProfileFormData>({
        defaultValues: {
            name: "",
            collegeName: "",
            bio: "",
            domain: "",
            skillsToTeach: [{ value: "" }],
            skillsToLearn: [{ value: "" }],
        },
    });

    const {
        fields: teachFields,
        append: addTeach,
        remove: removeTeach,
    } = useFieldArray({
        control,
        name: "skillsToTeach",
    });

    const {
        fields: learnFields,
        append: addLearn,
        remove: removeLearn,
    } = useFieldArray({
        control,
        name: "skillsToLearn",
    });

    // Load old user data from useAuth
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const res = await userDataAPI.getProfile();
                const user = res.data;

                reset({
                    name: user.name || "",
                    collegeName: user.collegeName || "",
                    bio: user.bio || "",
                    domain: user.domain || "",
                    skillsToTeach: user.skillsToTeach?.map((s: string) => ({ value: s })) || [
                        { value: "" },
                    ],
                    skillsToLearn: user.skillsToLearn?.map((s: string) => ({ value: s })) || [
                        { value: "" },
                    ],
                    imageUrl: user.imageUrl || "",
                });

                if (user.imageUrl) setPreview(user.imageUrl);
            } catch (error) {
                console.error("Failed to fetch profile", error);
                toast.error("Failed to load profile!");
            }
        };

        fetchUserProfile();
    }, [reset]);

    // Handle Image Upload Preview
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const url = URL.createObjectURL(file);
            setPreview(url);           // show preview
            setImageFile(file);        // store file for backend
        }
    };

    const onSubmit = async (data: ProfileFormData) => {
        try {
            const formData = new FormData();

            // Append image if selected
            if (imageFile) {
                formData.append("image", imageFile);
            }

            // Append other fields
            formData.append("collegeName", data.collegeName);
            formData.append("bio", data.bio);
            formData.append("skillsToTeach", JSON.stringify(data.skillsToTeach.map(s => s.value)));
            formData.append("skillsToLearn", JSON.stringify(data.skillsToLearn.map(s => s.value)));
            formData.append("domain", data.domain || "");
            await userDataAPI.updateProfile(formData); 
            toast.success("Profile updated successfully!");
        } catch (error) {
            console.error(error);
            toast.error("Failed to update profile!");
        }
    };


    return (
        <div className="mt-20 flex flex-col items-center mx-auto max-w-3xl px-4 space-y-6">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="w-full  rounded-2xl p-6 space-y-6 "
            >
                {/* Profile Image */}
                <div className="flex flex-col items-center space-y-3 relative">
                    <div className="relative">
                        <Image
                            src={preview || ProfileImage}
                            alt="Profile"
                            width={120}
                            height={120}
                            className="rounded-full object-cover border shadow-sm"
                        />

                        {/* Plus icon for changing image */}
                        <label
                            htmlFor="imageUpload"
                            className="absolute bottom-0 right-0 bg-gray-200 text-white rounded-full p-1 cursor-pointer hover:bg-gray-300 transition"
                        >
                            <Plus size={16} color="black" />
                        </label>

                        <input
                            id="imageUpload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>
                </div>

                {/* Name */}
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-1">
                            Full Name
                        </label>
                        <input
                            value={user?.name || ""}
                            readOnly
                            className="w-full border rounded-lg p-2 bg-gray-100 text-gray-700 cursor-not-allowed"
                        />
                    </div>

                    <div className="flex-1">
                        <label className="block text-gray-700 font-medium mb-1">
                            Domain
                        </label>
                        <input
                            {...register("domain")}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-black focus:outline-none"
                            placeholder="GenAI / Blockchain"
                        />
                    </div>
                </div>


                {/* College / Company */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        College / Company Name
                    </label>
                    <input
                        //    value={user?.collegeName || ""}
                        {...register("collegeName")}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-black focus:outline-none"
                        placeholder="e.g. IIT Bombay / Google"
                    />
                </div>

                {/* Bio */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">Bio</label>
                    <textarea
                        {...register("bio")}
                        rows={3}
                        className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-black focus:outline-none"
                        placeholder="Tell something about yourself..."
                    />
                </div>

                {/* Skills to Teach */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        Skills to Teach
                    </label>
                    <div className="space-y-2">
                        {teachFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <input
                                    {...register(`skillsToTeach.${index}.value` as const)}
                                    className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-black focus:outline-none"
                                    placeholder="e.g. React, Node.js"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeTeach(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addTeach({ value: "" })}
                            className="text-black hover:underline text-sm"
                        >
                            + Add another
                        </button>
                    </div>
                </div>

                {/* Skills to Learn */}
                <div>
                    <label className="block text-gray-700 font-medium mb-1">
                        Skills to Learn
                    </label>
                    <div className="space-y-2">
                        {learnFields.map((field, index) => (
                            <div key={field.id} className="flex gap-2">
                                <input
                                    {...register(`skillsToLearn.${index}.value` as const)}
                                    className="flex-1 border rounded-lg p-2 focus:ring-2 focus:ring-black focus:outline-none"
                                    placeholder="e.g. GoLang, AI, System Design"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeLearn(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={() => addLearn({ value: "" })}
                            className="text-black hover:underline text-sm"
                        >
                            + Add another
                        </button>
                    </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition disabled:opacity-50"
                    >
                        {isSubmitting ? "Updating..." : "Update Profile"}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditProfile;
