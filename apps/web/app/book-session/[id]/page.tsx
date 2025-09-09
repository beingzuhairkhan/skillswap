'use client'
import React from 'react';
import Image from 'next/image';
import BookSessionImage from '../../../public/book-seesion.png';
import { useForm, Controller } from 'react-hook-form';

type FormValues = {
  sessionType: string;
  duration: string;
  date: string;
  time: string;
};

const BookSession = () => {
  const { handleSubmit, control, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      sessionType: '',
      duration: '',
      date: '',
      time: ''
    }
  });

  const onSubmit = async (data: FormValues) => {
    try {
      const response = await fetch('/api/book-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) throw new Error('Failed to book session');

      alert('Session booked successfully!');
    } catch (error) {
      console.error(error);
      alert('Error booking session');
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-20 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900 text-center md:text-left">
        Book a Session with Sohail
      </h1>

      <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-semibold text-gray-900">Sohail Khan</h2>
          <p className="text-gray-600 text-lg mt-1">Node.js, Python</p>
          <p className="text-gray-500 flex justify-center md:justify-start gap-2 text-lg items-center mt-2">
            ⭐ 4.8 (120 reviews)
          </p>
        </div>
        <Image
          src={BookSessionImage}
          alt="Teacher image"
          className="rounded-xl h-[200px] w-[200px] object-cover shadow-md"
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

        {/* Submit Button */}
        <div className="flex justify-end">
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

export default BookSession;
