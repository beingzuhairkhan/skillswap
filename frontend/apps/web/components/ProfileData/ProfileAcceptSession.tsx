'use client';

import React, { useEffect, useState } from "react";
import { Clock, Calendar, BookOpen, ExternalLink, Users, User, ArrowRight, MessageSquare, Briefcase, Video } from "lucide-react";
import { SessionAPI } from "../../services/api";
import type { SessionStatusType } from '../constants/sessionStatus'
import Image from "next/image";
import CopyMeetLinkButton from "./CopyMeetLinkButton";

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
        <div className="w-10 h-10 border-4 border-gray-900 border-t-transparent rounded-full animate-spin" />
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 max-w-5xl mx-auto mb-2">
      {sessions.map((session) => (
        <div
          key={session._id}
          className="bg-white border border-gray-200 rounded-md shadow-sm hover:shadow-md transition-shadow"
        >
          {/* Header */}
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 text-[10px] font-medium rounded-md ${
                  session.sessionType === 'group'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-800 text-white'
                }`}>
                  {session.sessionType === 'group' ? (
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      Group
                    </span>
                  ) : (
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      1-on-1
                    </span>
                  )}
                </span>
                <div className="h-4 w-px bg-gray-300"></div>
                <span className="px-2 py-0.5 text-[10px] font-semibold rounded-md bg-green-100 text-green-700 capitalize">
                  {status}
                </span>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(session.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </div>
                <span>|</span>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {session.time}
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="p-4">
            {/* Session participants */}
            <div className="mb-4">
              <div className="flex items-center justify-between bg-gray-50 rounded-md p-3 border border-gray-200">
                {/* Requester */}
                <div className="flex items-center gap-3">
                  <Image
                    src={session.requester.imageUrl}
                    alt={session.requester.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                  <div>
                    <p className="text-[10px] text-gray-500 font-medium uppercase">Requester</p>
                    <h3 className="text-sm font-semibold capitalize">{session.requester.name}</h3>
                  </div>
                </div>

                {/* Arrow */}
                <div className="flex items-center px-2">
                  <ArrowRight className="w-4 h-4 text-gray-400" />
                </div>

                {/* Receiver */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-[10px] text-gray-500 font-medium uppercase">Receiver</p>
                    <h3 className="text-sm font-semibold capitalize">{session.receiver.name}</h3>
                  </div>
                  <Image
                    src={session.receiver.imageUrl}
                    alt={session.receiver.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full object-cover border"
                  />
                </div>
              </div>
            </div>

            <CopyMeetLinkButton googleMeetLink={session.googleMeetLink} />


            {/* Skill exchange info */}
            {session.post && (
              <div className="bg-white rounded-md p-3 mb-4 border border-gray-200">
                <div className="flex items-center gap-1 mb-2">
                  <BookOpen className="w-4 h-4 text-gray-700" />
                  <h4 className="text-sm font-semibold text-gray-900">Skill Exchange</h4>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-2">
                  <div className="bg-gray-50 rounded p-2 border">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Wants to Learn</p>
                    <p className="text-xs font-semibold">{session.post.wantToLearn}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2 border">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Can Teach</p>
                    <p className="text-xs font-semibold">{session.post.wantToTeach}</p>
                  </div>
                </div>

                {session.post.specificTopic && (
                  <div className="bg-gray-50 rounded p-2 border mb-2">
                    <p className="text-[10px] text-gray-500 uppercase mb-1">Topic Details</p>
                    <p className="text-xs text-gray-700 leading-relaxed">{session.post.specificTopic}</p>
                  </div>
                )}

                {session.post.postImageUrl && (
                  <div className="mt-2">
                    <Image
                      src={session.post.postImageUrl}
                      width={600}
                      height={120}
                      alt="Post"
                      className="w-full h-32 object-cover rounded-md border"
                    />
                  </div>
                )}
              </div>
            )}

            {/* Session details */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="border rounded p-2 text-center">
                <p className="text-[10px] text-gray-500">Duration</p>
                <p className="text-sm font-semibold">{session.durationTime}m</p>
              </div>
              <div className="border rounded p-2 text-center">
                <p className="text-[10px] text-gray-500">Created</p>
                <p className="text-xs font-semibold">
                  {new Date(session.createdAt).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="border rounded p-2 text-center">
                <p className="text-[10px] text-gray-500">Status</p>
                <p className="text-xs font-semibold">{session.isCompleted ? 'Completed' : 'Active'}</p>
              </div>
            </div>

            {/* Student notes */}
            {session.studentNotes && (
              <div className="mb-3">
                <div className="flex items-center gap-1 mb-1">
                  <MessageSquare className="w-4 h-4 text-gray-700" />
                  <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">Notes</h4>
                </div>
                <div className="bg-gray-50 border border-gray-200 rounded p-2">
                  <p className="text-xs text-gray-700 leading-relaxed">{session.studentNotes}</p>
                </div>
              </div>
            )}

            {/* Post link */}
            {session.post?.postUrl && (
              <div className="pt-2 border-t border-gray-200">
                <a
                  href={session.post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
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