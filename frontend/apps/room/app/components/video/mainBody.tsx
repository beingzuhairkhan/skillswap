// app/room/page.tsx (or components/room/RoomLayout.tsx)
'use client'
import React from 'react';
import LeftVideoBody from '../video/leftVideoBody'
import RightChatBody from '../video/rightChatBody'

const RoomLayout = () => {
  return (
    <div className="flex h-screen w-screen ">
      {/* Left: Video / Meet */}
      <div className="flex-1 border-r items-start ">
        <LeftVideoBody />
      </div>

  
    </div>
  );
};

export default RoomLayout;
