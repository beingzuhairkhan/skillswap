'use client'
import React from 'react';
import LeftVideoBody from './leftVideoBody'

// Room Layout Component
const RoomLayout = ({ roomId }: { roomId: string }) => {
  return (
    <div className="flex rounded-lg h-full w-full bg-gradient-to-br from-slate-800 to-slate-900">
      <div className="flex-1 flex items-center justify-center">
        <div className="w-full h-full max-w-none">
          <LeftVideoBody roomId={roomId} />
        </div>
      </div>
    </div>

  );
};

export default RoomLayout;