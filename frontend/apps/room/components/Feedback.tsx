'use client';

import { useState } from 'react';

interface FeedbackModalProps {
  roomId: string;
  currentUserId: string; // The person submitting feedback
  otherUserId: string;   // The participant being reviewed
  onSubmit: (data: any) => Promise<void>;
  onSkip: () => void;
}

export default function FeedbackModal({
  roomId,
  currentUserId,
  otherUserId,
  onSubmit,
  onSkip,
}: FeedbackModalProps) {
  const [formData, setFormData] = useState({
    rating: 0,
    category: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);

  // Teaching/knowledge focused categories
  const categories = [
    { value: 'clarity', label: 'Clarity of Explanation' },
    { value: 'engagement', label: 'Engagement & Interaction' },
    { value: 'knowledge', label: 'Knowledge & Accuracy' },
    { value: 'overall', label: 'Overall Experience' },
  ];

  const handleSubmit = async () => {
    if (!formData.rating || !formData.category) return;

    setLoading(true);

    const feedbackData = {
      roomId,
      speakerId: otherUserId,    
      reviewerId: currentUserId,  
      rating: formData.rating,
      category: formData.category,
      message: formData.message,
      timestamp: new Date().toISOString(),
    };

    try {
      await onSubmit(feedbackData);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="w-full max-w-lg bg-white rounded-lg shadow-lg border border-gray-200 p-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              Rate Your Partner's Teaching
            </h2>
            <p className="text-gray-500 text-xs">
              Help us improve their teaching quality
            </p>
          </div>
          <button
            onClick={onSkip}
            className="text-gray-500 hover:text-gray-800 text-xs font-bold"
          >
            X
          </button>
        </div>

        <div className="space-y-5">
          {/* Rating */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
              Rating
            </label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, rating: star })
                  }
                  className={`flex-1 h-10 rounded border text-xs font-medium transition ${
                    formData.rating >= star
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-100 text-gray-600 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {star}
                </button>
              ))}
            </div>
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
              Category
            </label>
            <div className="grid grid-cols-2 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, category: cat.value })
                  }
                  className={`h-10 rounded border px-3 text-left text-xs font-medium transition ${
                    formData.category === cat.value
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'bg-gray-100 text-gray-700 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-2 uppercase tracking-wider">
              Suggestions / Comments
            </label>
            <textarea
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
              rows={3}
              placeholder="Share your thoughts..."
              className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-gray-900 focus:border-gray-900 transition resize-none text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={onSkip}
              className="flex-1 h-10 rounded bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-700 text-xs font-medium transition"
            >
              Skip
            </button>
            <button
              onClick={handleSubmit}
              disabled={
                !formData.rating || !formData.category || loading
              }
              className="flex-1 h-10 rounded bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed text-white text-xs font-medium transition"
            >
              {loading ? 'Submitting…' : 'Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
