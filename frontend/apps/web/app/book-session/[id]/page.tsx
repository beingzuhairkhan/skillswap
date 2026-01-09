'use client'
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import BookSessionImage from '../../../public/book-seesion.png'
import { useForm, Controller } from 'react-hook-form';
import { SessionAPI, userDataAPI } from '../../../services/api';
import toast from 'react-hot-toast';
import { useRouter } from "next/navigation";
type FormValues = {
  sessionType: string;
  duration: string;
  date: string;
  time: string;
  studentNotes: string;
};

type PageProps = {
  params: Promise<{ id: string }>; 
};

const BookSession = ({ params }: PageProps) => {
  const today = new Date().toISOString().split('T')[0];
  const [profile, setProfile] = useState<any>(null);
  const [id, setId] = useState<string | null>(null);
const router = useRouter();
  const { register, handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      sessionType: '',
      duration: '',
      date: today,
      time: '',
      studentNotes: ''
    }
  });

  // Unwrap the params Promise
  useEffect(() => {
    const unwrapParams = async () => {
      const resolvedParams = await params; // <-- await the promise
      setId(resolvedParams.id);
    };
    unwrapParams();
  }, [params]);

  // Fetch profile data only after id is set
  useEffect(() => {
    if (!id) return;

    const fetchProfileDataById = async () => {
      try {
        const response = await userDataAPI.getUserProfileDataById(id);
        // console.log('reponse',response.data)
        setProfile(response.data);
      } catch (e) {
        console.error("Error fetching profile:", e);
      }
    };
    fetchProfileDataById();
  }, [id]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (!id) {
        alert('Receiver ID not found!');
        return;
      }

      // merge form data + receiverId
      const payload = {
        ...data,
        receiverId: id, 
      };

      const res = await SessionAPI.bookSession(payload);
      if(res.status === 201){
        toast.success("Book Session Successfully")
           router.push("/session");
      }
      console.log(res);
      // alert('Session booked successfully!');
    } catch (error) {
      // console.error(error);
      toast.error('Failed to booking session');
    }
  };


  return (
    <div className="max-w-4xl mx-auto mt-20 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center md:text-left">
        Book a Session with {profile?.userData?.name || 'Teacher'}
      </h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        {/* Left Div: Teacher Info */}
        <div className="text-center md:text-left space-y-2">
          <h2 className="text-2xl font-semibold text-gray-900">
            {profile?.userData?.name || 'Teacher Name'}
          </h2>
          <div className="flex flex-wrap gap-4 mt-2 mb-4">
            {profile?.wantToTeach && (
              <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-medium">
                Teaches: {profile.wantToTeach}
              </span>
            )}
            {profile?.wantToLearn && (
              <span className="bg-pink-100 text-pink-800 px-3 py-1 rounded-full text-sm font-medium">
                Wants to Learn: {profile.wantToLearn}
              </span>
            )}
          </div>
          {profile?.specificTopic && (
            <span className="bg-green-100 mt-4 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
              Topic: {profile.specificTopic}
            </span>
          )}


          <p className="text-gray-500 flex justify-center md:justify-start gap-2 text-lg items-center mt-1">
            ⭐ {profile?.rating || 0} ({profile?.reviewsCount || 0} reviews)
          </p>
        </div>


        <Image
          src={profile?.userData?.imageUrl || BookSessionImage}
          alt={profile?.userData?.name || 'Teacher Image'}
          width={200}
          height={200}
          className="rounded-xl object-cover shadow-md"
        />
      </div>


      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Row 1: Session Type + Duration */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Session Type</label>
            <Controller
              name="sessionType"
              control={control}
              rules={{ required: 'Please select a session type' }}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select type</option>
                  <option value="1-on-1">1-on-1</option>
                  <option value="group">Group</option>
                  <option value="broadcast">One-side Teaching</option>

                </select>
              )}
            />
            {errors.sessionType && (
              <p className="text-red-500 text-sm mt-1">{errors.sessionType.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">Duration</label>
            <Controller
              name="duration"
              control={control}
              rules={{ required: 'Please select a duration' }}
              render={({ field }) => (
                <select
                  {...field}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="">Select duration</option>
                  <option value="30">30 min</option>
                  <option value="60">60 min</option>
                  <option value="90">90 min</option>
                  <option value="120">120 min</option>
                  <option value="150">150 min</option>
                  <option value="180">180 min</option>

                </select>
              )}
            />
            {errors.duration && (
              <p className="text-red-500 text-sm mt-1">{errors.duration.message}</p>
            )}
          </div>
        </div>

        {/* Row 2: Date + Time */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block mb-2 font-medium text-gray-700">Select Date</label>
            <Controller
              name="date"
              control={control}
              rules={{ required: 'Please select a date' }}
              render={({ field }) => (
                <input
                  type="date"
                  {...field}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              )}
            />
            {errors.date && (
              <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
            )}
          </div>

          <div>
            <label className="block mb-2 font-medium text-gray-700">Select Time</label>
            <Controller
              name="time"
              control={control}
              rules={{ required: 'Please select a time' }}
              render={({ field }) => (
                <input
                  type="time"
                  {...field}
                  className="w-full border border-gray-300 rounded-md p-2"
                />
              )}
            />
            {errors.time && (
              <p className="text-red-500 text-sm mt-1">{errors.time.message}</p>
            )}
          </div>

        </div>
        <div className="mt-6">
          <label
            htmlFor="studentNotes"
            className="block mb-2 font-medium text-gray-700"
          >
            Student Notes
          </label>
          <textarea
            id="studentNotes"
            placeholder="Write your message..."
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={4}
            {...register("studentNotes")} // if using react-hook-form
          />
          {errors.studentNotes && (
            <p className="text-red-500 text-sm mt-1">
              {errors.studentNotes.message}
            </p>
          )}
        </div>


        {/* Submit Button */}
        <div className="flex justify-end pb-10">
          <button
            type="submit"
            className="bg-black text-white px-6 py-3 rounded-xl shadow-md hover:bg-gray-700 transition"
          >
            Request Session
          </button>
        </div>
      </form>
    </div>
  );
};


export default BookSession