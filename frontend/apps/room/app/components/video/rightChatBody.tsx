import React from "react";

const RightChatBody = () => {
  return (
    <div className="flex flex-col h-full w-full bg-white ">
      {/* Timer at the top */}
      <div className="p-4 flex justify-center gap-6">
        <div className="text-center bg-gray-100 rounded-lg p-2">
          <p className="text-2xl font-bold">00</p>
          <p className="text-xs text-gray-500 uppercase">Hours</p>
        </div>
        <div className="text-center bg-gray-100 rounded-lg p-2">
          <p className="text-2xl font-bold">15</p>
          <p className="text-xs text-gray-500 uppercase">Minutes</p>
        </div>
        <div className="text-center bg-gray-100 rounded-lg p-2">
          <p className="text-2xl font-bold">32</p>
          <p className="text-xs text-gray-500 uppercase">Seconds</p>
        </div>
      </div>
       <div className="p-4  border-gray-200">
        <button className="w-full py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition">
          Leave Session
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Left message */}
        <div className="flex items-start space-x-2">
          <img
            src="https://i.pravatar.cc/40?img=1"
            alt="User"
            className="w-8 h-8 rounded-full"
          />
          <div className="max-w-[75%] bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
            Hey, are you ready to start?
          </div>
        </div>

        {/* Right message */}
        <div className="flex items-start justify-end space-x-2">
          <div className="max-w-[75%] bg-blue-500 text-white px-3 py-2 rounded-lg">
            Yep, let’s do this!
          </div>
          <img
            src="https://i.pravatar.cc/40?img=2"
            alt="Me"
            className="w-8 h-8 rounded-full"
          />
        </div>

        {/* Another left message */}
        <div className="flex items-start space-x-2">
          <img
            src="https://i.pravatar.cc/40?img=3"
            alt="User"
            className="w-8 h-8 rounded-full"
          />
          <div className="max-w-[75%] bg-gray-100 text-gray-800 px-3 py-2 rounded-lg">
            I’ve got a tricky problem with recursion. Can you help?
          </div>
        </div>

        {/* Another right message */}
        <div className="flex items-start justify-end space-x-2">
          <div className="max-w-[75%] bg-blue-500 text-white px-3 py-2 rounded-lg">
            Sure, let’s take a look. Share your code.
          </div>
          <img
            src="https://i.pravatar.cc/40?img=4"
            alt="Me"
            className="w-8 h-8 rounded-full"
          />
        </div>
      </div>


      {/* Input area */}
      <div className="p-3  border-gray-200 flex items-center gap-2">
        <img
          src="https://i.pravatar.cc/40?img=3"
          alt="Me"
          className="w-8 h-8 rounded-full"
        />
        <input
          type="text"
          placeholder="Type a message..."
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition">
          Send
        </button>
      </div>

      {/* Leave Session Button */}
     
    </div>
  );
};

export default RightChatBody;
