'use client'; // if using app directory
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { FaStar } from 'react-icons/fa';
import { RoomAPI } from '@/services/api';

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
        <div className="max-w-3xl mx-auto px-4 py-6">
            {reviews.length === 0 && <p className="text-center text-gray-500">No reviews yet.</p>}

            {reviews.map((review) => (
                <div
                    key={review._id}
                    className="flex gap-4 mb-6 border-b pb-4 last:border-b-0 last:pb-0"
                >
                    <div className="relative w-12 h-12 flex-shrink-0">
                        <Image
                            src={review.currentUser.imageUrl || '/default-avatar.png'}
                            alt={review.currentUser.name}
                            fill
                            className="rounded-full object-cover"
                            sizes="48px"
                        />
                    </div>

                    <div className="flex-1">
                        {/* Reviewer name and date */}
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

                        <div className="flex mt-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <FaStar
                                    key={i}
                                    size={16}
                                    className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                                />
                            ))}
                        </div>

                        <p className="mt-2 text-gray-700">{review.message}</p>


                    </div>
                </div>
            ))}
        </div>
    );
};

export default ProfileReviews;
