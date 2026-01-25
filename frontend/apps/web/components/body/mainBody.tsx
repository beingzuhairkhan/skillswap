'use client'
import React, { useState } from "react";
import LeftBody from "./leftBody";
import PostBody from "./postBody";
import RightBody from "./rightBody";
import { useSearch } from "../../app/SearchContext";

const MainBody = () => {
   const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
   const { search } = useSearch();
  //  console.log("search" , search)
  return (
    <div className="flex max-w-7xl  mx-auto justify-around ">
      <div>
        <LeftBody />
      </div>
      <div>
        <PostBody selectedSkill={selectedSkill}  search={search} />
      </div>
      <div>
        <RightBody onSkillClick={setSelectedSkill} />
      </div>
    </div>
  );
};

export default MainBody;
