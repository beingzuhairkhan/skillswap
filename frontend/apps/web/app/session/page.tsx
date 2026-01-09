"use client";
import React, { useState } from "react";
import { Button } from "@repo/ui/button";
import UpComingSessions from "./../../components/sessionDatas/upComingSessions";
import AcceptSessions from "./../../components/sessionDatas/acceptSessions";
import RejectSessions from "./../../components/sessionDatas/rejectSessions";

const Sessions = () => {
  const [selected, setSelected] = useState("accept");
  const options = ["request", "accept", "reject"];

  return (
    <div className="flex mt-20 max-w-6xl mx-auto h-[150px]">
      {/* Left Content Area */}
      <div className="flex-1 bg-white rounded-lg   mr-4">
        {selected === "request" && <UpComingSessions />}
        {selected === "accept" && <AcceptSessions />}
        {selected === "reject" && <RejectSessions />}
      </div>

      {/* Right Vertical Buttons */}
        
      <div className="relative flex flex-col bg-gray-100 rounded-lg p-2 w-[120px] items-center">
        {/* Sliding Highlight */}
        <div
          className="absolute left-2 w-[100px] h-[36px] bg-black rounded-md transition-all duration-300"
          style={{
            transform: `translateY(${options.indexOf(selected) * 50}px)`,
          }}
        />

        {options.map((opt) => (
          <Button
            key={opt}
            onClick={() => setSelected(opt)}
           
            className={`relative z-10 w-[100px] h-[56px] capitalize font-medium transition-colors duration-300 ${
              selected === opt ? "text-white" : "text-black"
            }`}
          
          >
            {opt}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default Sessions;
