'use client'
import React, { useState } from "react";
import LeftBody from "./leftBody";
import PostBody from "./postBody";
import RightBody from "./rightBody";

const MainBody = () => {
   const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  return (
    <div className="flex max-w-7xl  mx-auto justify-around ">
      <div>
        <LeftBody />
      </div>
      <div>
        <PostBody selectedSkill={selectedSkill} />
      </div>
      <div>
        <RightBody onSkillClick={setSelectedSkill} />
      </div>
    </div>
  );
};

export default MainBody;
