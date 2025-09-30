import React from "react";
import { Bell } from "lucide-react";

const notificationsData = [
  { id: 1, title: "New message from Abdul Hameed", time: "2h ago", unread: true },
  { id: 2, title: "Sufiyan Khan started following you", time: "5h ago", unread: true },
  { id: 3, title: "New course available: React.js Basics", time: "1d ago", unread: false },
  { id: 4, title: "Zuhair Khan liked your post", time: "2d ago", unread: false },
  { id: 5, title: "System maintenance scheduled", time: "3d ago", unread: true }
];

const Notifications = () => {
  return (
    <div className="mx-auto max-w-4xl mt-20 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Notifications</h2>
        <button className="text-blue-600 text-sm font-medium hover:underline">
          Mark all as read
        </button>
      </div>

      {/* Notification List */}
      <div className="bg-white rounded-lg shadow border border-gray-200 divide-y divide-gray-200 overflow-y-auto max-h-[70vh]">
        {notificationsData.length === 0 ? (
          <p className="text-center text-gray-400 p-4">No notifications</p>
        ) : (
          notificationsData.map((notification) => (
            <div
              key={notification.id}
              className={`flex items-start p-4 transition cursor-pointer hover:bg-gray-50 ${
                notification.unread ? "border-l-4 border-blue-500" : ""
              }`}
            >
              {/* Icon */}
              <div className="flex-shrink-0 w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-4">
                <Bell size={20} />
              </div>

              {/* Notification Text */}
              <div className="flex-1">
                <p className={`text-sm ${notification.unread ? "font-medium text-gray-900" : "text-gray-800"}`}>
                  {notification.title}
                </p>
                <span className="text-xs text-gray-500">{notification.time}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
