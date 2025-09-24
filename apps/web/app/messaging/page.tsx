import React from "react";
import LeftSideMessage from '../../components/message/leftSide'

const Message = () => {
  return (
    <div className="flex gap-6 bg-white mt-20 max-w-6xl mx-auto">
      {/* Sidebar */}
      <LeftSideMessage />

      {/* Default Right Side (when no user is selected) */}
      <div className="flex-1 border rounded-lg shadow-sm p-6 flex items-center justify-center text-gray-500">
        <p>Select a user to start chatting</p>
      </div>
    </div>
  );
};

export default Message;
