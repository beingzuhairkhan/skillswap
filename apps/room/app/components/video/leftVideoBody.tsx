'use client'
import React, { useEffect, useRef, useState } from 'react';

const LeftVideoBody = () => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [peerConnection, setPeerConnection] = useState<RTCPeerConnection | null>(null);

  useEffect(() => {
    const startLocalStream = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        const pc = new RTCPeerConnection({
          iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
        });

        stream.getTracks().forEach((track) => pc.addTrack(track, stream));

        pc.ontrack = (event) => {
          console.log('Remote track received:', event.streams[0]);
        };

        setPeerConnection(pc);
      } catch (err) {
        console.error('Error accessing media devices.', err);
      }
    };

    startLocalStream();
  }, []);

  return (
   <div className="w-[1050px] mt-2 h-[630px] fixed bg-white overflow-auto hide-scrollbar">
  <video
    ref={localVideoRef}
    autoPlay
    muted
    playsInline
    className="w-full h-full object-contain rounded-lg bg-gray-900 max-w-full"
  />
</div>
  );
};

export default LeftVideoBody;
