'use client';
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { RoomAPI } from '../../services/api'

interface Review {
    _id: string;
    rating: number;
    category?: string;
    message: string;
    timestamp: string;
    currentUser: {
        _id: string;
        name: string;
        imageUrl?: string;
    };
}

const ProfileReviews = () => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAllReviews = async () => {
            try {
                const response = await RoomAPI.getAllReviews();
                setReviews(response.data);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAllReviews();
    }, []);


    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }


    return (
        <div className="min-h-screen  py-4">
            <div className="max-w-4xl mx-auto px-4 space-y-4">
                {reviews.length === 0 && (
                    <p className="text-center text-gray-500">No reviews yet.</p>
                )}

                {reviews.map((review) => (
                    <div
                        key={review._id}
                        className="flex gap-4 p-4 rounded-xl shadow-md bg-white hover:shadow-lg transition-shadow duration-200"
                    >
                        {/* Reviewer Avatar */}
                        <div className="relative w-14 h-14 flex-shrink-0">
                            <Image
                                src={review.currentUser.imageUrl || '/default-avatar.png'}
                                alt={review.currentUser.name}
                                fill
                                className="rounded-full object-cover"
                                sizes="56px"
                            />
                        </div>

                        <div className="flex-1 flex flex-col">
                            {/* Name and Date */}
                            <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-800">
                                    {review.currentUser.name}
                                </h4>
                                <span className="text-sm text-gray-500">
                                    {new Date(review.timestamp).toLocaleDateString(undefined, {
                                        month: 'short',
                                        day: 'numeric',
                                        year: 'numeric',
                                    })}
                                </span>
                            </div>

                            {/* Star Rating */}
                            <div className="flex mt-1">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <FaStar
                                        key={i}
                                        size={18}
                                        className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                                    />
                                ))}
                            </div>

                            {/* Review Message */}
                            <p className="mt-2 text-gray-700">{review.message}</p>

                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ProfileReviews;
