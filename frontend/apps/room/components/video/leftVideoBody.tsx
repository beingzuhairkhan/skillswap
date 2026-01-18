'use client';

import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import {
  MdOutlineMicNone,
  MdOutlineMicOff,
  MdOutlineScreenShare,
  MdCallEnd,
} from 'react-icons/md';
import { BsCameraVideo, BsCameraVideoOff } from 'react-icons/bs';
import { Users } from 'lucide-react';

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:4000';

const LeftVideoBody = ({ ROOM_ID }: { ROOM_ID: string }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const socketRef = useRef<Socket | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  // THIS now means REAL peer connected
  const [isConnected, setIsConnected] = useState(false);

  /* ---------------- INIT ---------------- */

  useEffect(() => {
    const socket = io(SOCKET_URL);
    socketRef.current = socket;

    async function init() {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      const peer = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
      });

      peerRef.current = peer;

      stream.getTracks().forEach(track =>
        peer.addTrack(track, stream)
      );

      /* -------- REMOTE TRACK -------- */

      peer.ontrack = e => {
        setIsConnected(true);

        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = e.streams[0] ?? null;
        }
      };

      /* -------- ICE -------- */

      peer.onicecandidate = e => {
        if (e.candidate) {
          socket.emit('ice-candidate', {
            roomId: ROOM_ID,
            candidate: e.candidate,
          });
        }
      };

      /* -------- REAL CONNECTION STATE -------- */

      peer.onconnectionstatechange = () => {
        const state = peer.connectionState;

        if (state === 'connected') {
          setIsConnected(true);
        }

        if (
          state === 'disconnected' ||
          state === 'failed' ||
          state === 'closed'
        ) {
          setIsConnected(false);
        }
      };

      /* -------- SOCKET EVENTS -------- */

      socket.emit('join-room', ROOM_ID);

      socket.on('user-joined', async () => {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);

        socket.emit('offer', {
          roomId: ROOM_ID,
          offer,
        });
      });

      socket.on('offer', async offer => {
        await peer.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);

        socket.emit('answer', {
          roomId: ROOM_ID,
          answer,
        });
      });

      socket.on('answer', async answer => {
        await peer.setRemoteDescription(
          new RTCSessionDescription(answer)
        );
      });

      socket.on('ice-candidate', async candidate => {
        if (!candidate) return;

        try {
          await peer.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (err) {
          console.log('ICE error:', err);
        }
      });

      socket.on('disconnect', () => {
        setIsConnected(false);
      });
    }

    init();

    return () => {
      peerRef.current?.close();
      socket.disconnect();
    };
  }, [ROOM_ID]);

  /* ---------------- CONTROLS ---------------- */

  const toggleMic = () => {
    localStreamRef.current?.getAudioTracks().forEach(track => {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    });
  };

  const toggleCamera = () => {
    localStreamRef.current?.getVideoTracks().forEach(track => {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    });
  };

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    const screenStream =
      await navigator.mediaDevices.getDisplayMedia({
        video: true,
      });

    screenStreamRef.current = screenStream;
    setIsScreenSharing(true);

    const sender = peerRef.current
      ?.getSenders()
      .find(s => s.track?.kind === 'video');

    sender?.replaceTrack(
      screenStream.getVideoTracks()[0] ?? null
    );

    screenStream.getVideoTracks()[0]?.addEventListener('ended', stopScreenShare);

  };

  const stopScreenShare = () => {
    const sender = peerRef.current
      ?.getSenders()
      .find(s => s.track?.kind === 'video');

    sender?.replaceTrack(
      localStreamRef.current?.getVideoTracks()[0]!
    );

    screenStreamRef.current
      ?.getTracks()
      .forEach(t => t.stop());

    setIsScreenSharing(false);
  };

  const endCall = () => {
    peerRef.current?.close();
    socketRef.current?.disconnect();
    window.location.reload();
  };

  const showContain = isScreenSharing;

  /* ---------------- UI (UNCHANGED) ---------------- */

  return (
    <div className="w-full h-[89vh] relative bg-black rounded-2xl overflow-hidden">
      {/* STATUS */}
      <div className="absolute top-4 left-4 z-10 bg-black/70 px-4 py-2 rounded-full text-white text-sm flex items-center gap-2">
        <div
          className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
        />

        {isConnected ? 'Connected' : 'Connecting'}
      </div>

      {/* REMOTE VIDEO */}
      <div className="w-full h-full max-w-none rounded-2xl overflow-hidden shadow-2xl  relative">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className={`w-full h-full ${showContain
            ? 'object-contain bg-black'
            : 'object-cover'
            }`}
        />


        {!isConnected && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-center">
            <div>
              <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-300 text-lg">
                Waiting for another participant
              </p>
              <p className="text-gray-500 text-sm mt-2">
                Room ID:{' '}
                <span className="font-mono">
                  {ROOM_ID}
                </span>
              </p>
            </div>
          </div>
        )}
      </div>

      {/* LOCAL PiP */}
      <div className="absolute bottom-5 right-4 w-52 h-34 rounded-2xl overflow-hidden bg-slate-900/90 shadow-2xl border-2 border-slate-700/50 group hover:scale-105 transition-all duration-200 hover:border-blue-500">
        <video
          ref={localVideoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />

        {!cameraOn && (
          <div className="absolute inset-0 flex items-center justify-center bg-black">
            <BsCameraVideoOff className="text-gray-400 text-3xl" />
          </div>
        )}
      </div>

      {/* CONTROLS */}
      <div className="absolute bottom-0 left-0 right-0 z-20 p-2 pb-4 bg-gradient-to-t from-black/80 to-transparent">
        <div className="flex justify-center items-center gap-4">
          <button
            onClick={toggleMic}
            className={`p-4 rounded-2xl transition-all duration-200 shadow-2xl backdrop-blur-sm ${micOn
              ? 'bg-slate-700/80 hover:bg-slate-600/80 border-2 border-slate-600/50 hover:border-slate-500/70'
              : 'bg-red-600/90 hover:bg-red-700/90 border-2 border-red-500/70 hover:border-red-400/80'
              } hover:scale-105 active:scale-95`}
            title={micOn ? 'Mute mic' : 'Unmute mic'}
          >
            {micOn ? (
              <MdOutlineMicNone className="text-white text-2xl" />
            ) : (
              <MdOutlineMicOff className="text-white text-2xl" />
            )}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-4 rounded-2xl transition-all duration-200 shadow-2xl backdrop-blur-sm ${cameraOn
              ? 'bg-slate-700/80 hover:bg-slate-600/80 border-2 border-slate-600/50 hover:border-slate-500/70'
              : 'bg-red-600/90 hover:bg-red-700/90 border-2 border-red-500/70 hover:border-red-400/80'
              } hover:scale-105 active:scale-95`}
            title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraOn ? (
              <BsCameraVideo className="text-white text-2xl" />
            ) : (
              <BsCameraVideoOff className="text-white text-2xl" />
            )}
          </button>

          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-2xl transition-all duration-200 shadow-2xl backdrop-blur-sm ${isScreenSharing
              ? 'bg-blue-600/90 hover:bg-blue-700/90 border-2 border-blue-500/70 hover:border-blue-400/80'
              : 'bg-slate-700/80 hover:bg-slate-600/80 border-2 border-slate-600/50 hover:border-slate-500/70'
              } hover:scale-105 active:scale-95`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <MdOutlineScreenShare className="text-white text-2xl" />
          </button>

          <button
            onClick={endCall}
            className="p-4 rounded-2xl bg-red-600/90 hover:bg-red-700/90 transition-all duration-200 shadow-2xl border-2 border-red-500/70 hover:border-red-400/80 hover:scale-105 active:scale-95 backdrop-blur-sm"
            title="End call"
          >
            <MdCallEnd className="text-white text-2xl" />
          </button>
        </div>

      </div>
    </div>
  );
};

export default LeftVideoBody;