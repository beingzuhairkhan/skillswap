import React from 'react'
import Lottie from "lottie-react";
import postLoading from './Lottie/Sandy Loading.json'

const PostLoader = () => {
  return (
    <div>
        <Lottie animationData={postLoading} loop={true} autoplay={true}  />
    </div>
  )
}

export default PostLoader