'use client';

import React, { useEffect, useState } from "react";
import { Clock, Calendar, BookOpen, ExternalLink, Users, User, ArrowRight, MessageSquare, Briefcase, Video } from "lucide-react";
import { SessionAPI } from "../../services/api";
import type { SessionStatusType } from '../constants/sessionStatus'
import Image from "next/image";

const ProfileAcceptSession = ({ status }: { status: SessionStatusType }) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSessions = async () => {
      if (!status) return;

      try {
        const res = await SessionAPI.getMyPendingSessions({ status });
        setSessions(res.data);
      } catch (error) {
        console.error("Failed to fetch sessions", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSessions();
  }, [status]);

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

  if (!sessions.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Calendar className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Accepted Sessions</h3>
        <p className="text-gray-500 text-sm">You don't have any {status} sessions at the moment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-6 max-w-5xl mx-auto">
      {sessions.map((session) => (
        <div
          key={session._id}
          className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1.5 text-xs font-medium rounded-md ${session.sessionType === 'group'
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-800 text-white'
                  }`}>
                  {session.sessionType === 'group' ? (
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      Group Session
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" />
                      1-on-1 Session
                    </span>
                  )}
                </span>
                <div className="h-5 w-px bg-gray-300"></div>
                <span className="px-3 py-1 text-xs font-semibold rounded-md bg-green-100 text-green-700 capitalize">
                  {status}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-600">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {new Date(session.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <span className="text-gray-300">|</span>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {session.time}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-6">
            {/* Session participants */}
            <div className="mb-6">
              <div className="flex items-center justify-between bg-gray-50 rounded-lg p-5 border border-gray-200">
                {/* Requester */}
                <div className="flex items-center gap-4">
                  <Image
                    src={session.requester.imageUrl}
                    alt={session.requester.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                  />
                  <div>
                    <p className="text-xs text-gray-500 font-medium mb-0.5 uppercase tracking-wide">Requester</p>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {session.requester.name}
                    </h3>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center px-4">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                </div>

                {/* Receiver */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-gray-500 font-medium mb-0.5 uppercase tracking-wide">Receiver</p>
                    <h3 className="font-semibold text-gray-900 capitalize">
                      {session.receiver.name}
                    </h3>
                  </div>
                  <Image
                    src={session.receiver.imageUrl}
                    alt={session.receiver.name}
                    width={56}
                    height={56}
                    className="w-14 h-14 rounded-full object-cover border-2 border-gray-200"
                  />
                </div>
              </div>
            </div>

            {/* Google Meet Link - Featured prominently */}
            {session.googleMeetLink && (
              <div className="mb-6">
                <a
                  href={session.googleMeetLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-4 px-6 rounded-lg transition-colors"
                >
                  <Video className="w-5 h-5" />
                  Join Meet
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}

            {/* Skill exchange info */}
            {session.post && (
              <div className="bg-white rounded-lg p-5 mb-6 border border-gray-200">
                <div className="flex items-center gap-2 mb-4">
                  <BookOpen className="w-5 h-5 text-gray-700" />
                  <h4 className="font-semibold text-gray-900">Skill Exchange</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Wants to Learn</p>
                    <p className="font-semibold text-gray-900">{session.post.wantToLearn}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Can Teach</p>
                    <p className="font-semibold text-gray-900">{session.post.wantToTeach}</p>
                  </div>
                </div>

                {session.post.specificTopic && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <p className="text-xs text-gray-500 font-medium mb-2 uppercase tracking-wide">Topic Details</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{session.post.specificTopic}</p>
                  </div>
                )}

                {session.post.postImageUrl && (
                  <div className="mt-4">
                    <Image
                      src={session.post.postImageUrl}
                      width={600}
                      height={192}
                      alt="Post"
                      className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Session details */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Duration</span>
                </div>
                <p className="text-xl font-semibold text-gray-900">
                  {session.durationTime}
                  <span className="text-sm font-normal text-gray-500 ml-1">mins</span>
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Created</span>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  {new Date(session.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </p>
              </div>

              <div className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-500" />
                  <span className="text-xs text-gray-500 font-medium uppercase tracking-wide">Status</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 capitalize">
                  {session.isCompleted ? 'Completed' : 'Active'}
                </p>
              </div>
            </div>

            {/* Student notes */}
            {session.studentNotes && (
              <div className="mb-5">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-gray-700" />
                  <h4 className="text-sm font-semibold text-gray-900 uppercase tracking-wide">Notes</h4>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {session.studentNotes}
                  </p>
                </div>
              </div>
            )}

            {/* Post link */}
            {session.post?.postUrl && (
              <div className="pt-4 border-t border-gray-200">
                <a
                  href={session.post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Profile/Project
                </a>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProfileAcceptSession;