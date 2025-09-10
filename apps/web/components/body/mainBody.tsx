import React from "react";
import LeftBody from "./leftBody";
import PostBody from "./postBody";
import RightBody from "./rightBody";

const MainBody = () => {
  return (
    <div className="flex max-w-7xl  mx-auto justify-around ">
      <div>
        <LeftBody />
      </div>
      <div>
        <PostBody />
      </div>
      <div>
        <RightBody />
      </div>
    </div>
  );
};

export default MainBody;
