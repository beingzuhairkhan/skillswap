import React, { useEffect, useRef } from 'react';
import Lottie, { LottieRefCurrentProps } from 'lottie-react';
import postLoading from './Lottie/Sandy Loading.json';

const PostLoader = () => {
  const lottieRef = useRef<LottieRefCurrentProps>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (lottieRef.current) {
        lottieRef.current.stop();
        lottieRef.current.play();
      }
    }, 7000); 

    return () => clearInterval(interval); 
  }, []);

  return (
    <div>
      <Lottie
        lottieRef={lottieRef} 
        animationData={postLoading}
        loop={false} 
        autoplay={true} 
      />
    </div>
  );
};

export default PostLoader;
