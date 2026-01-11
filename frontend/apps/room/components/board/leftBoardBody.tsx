'use client'
import React from "react";

const LeftBoardBody = () => {
  return (
    <div className="h-full w-full bg-gray-100 flex items-center justify-center">
      <iframe
        src="https://excalidraw.com"
        className="h-[90vh] w-[90vw] border border-gray-300 rounded-lg shadow-lg"
        title="Excalidraw Whiteboard"
      />
    </div>
  );
};

export default LeftBoardBody;
