// app/room/page.tsx (or components/room/RoomLayout.tsx)
'use client'
import React from 'react';
import LeftVideoBody from '../video/leftVideoBody'
import RightChatBody from '../video/rightChatBody'

// Room Layout Component
const RoomLayout = ({ roomId }: { roomId: string }) => {
  return (
    <div className="flex rounded-lg h-full w-full bg-gradient-to-br from-slate-800 to-slate-900">
      {/* Video Section - Centered with max width */}
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-full max-w-[960px]">
          <LeftVideoBody roomId={roomId} />
        </div>
      </div>
    </div>
  );
};

export default RoomLayout;