import React, { useEffect, useRef } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import postLoading from './Lottie/Sandy Loading.json';

const PostLoader = () => {


  return (
    <div>
      <Lottie
        animationData={postLoading}
        loop={true} 
        autoplay={true} 
      />
    </div>
  );
};

export default PostLoader;
