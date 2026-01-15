'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { MdOutlineMicNone, MdOutlineMicOff, MdOutlineScreenShare, MdCallEnd } from "react-icons/md";
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import { Users, Maximize2 } from "lucide-react";

const LeftVideoBody = ({ roomId }: { roomId: string }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);

  const isInitiatorRef = useRef(false);
  const screenStreamRef = useRef<MediaStream | null>(null);

  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [remoteScreenSharing, setRemoteScreenSharing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [participantCount, setParticipantCount] = useState(1);

  /* -------------------- INIT -------------------- */
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!, {
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
      socket.emit('join-room', roomId);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    initLocalMedia();
    registerSocketEvents();

    return () => cleanup();
  }, [roomId]);

  const cleanup = useCallback(() => {
    socketRef.current?.disconnect();
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  /* -------------------- LOCAL MEDIA -------------------- */
  const initLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });

      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true; // prevent echo
        await localVideoRef.current.play();
      }
    } catch (err) {
      console.error('Error accessing camera/mic', err);
    }
  };

  /* -------------------- PEER -------------------- */
  /* -------------------- CREATE PEER -------------------- */
  const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);

  const createPeer = useCallback(() => {
    // Prevent creating multiple peers
    if (peerRef.current) return peerRef.current;

    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    // ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('signal', { roomId, signal: { candidate: event.candidate } });
      }
    };

    // Remote stream
    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (!remoteVideoRef.current || !remoteStream) return;

      // Avoid resetting the same stream
      if (remoteVideoRef.current.srcObject === remoteStream) return;

      remoteVideoRef.current.srcObject = remoteStream;

      remoteVideoRef.current.onloadedmetadata = () => {
        remoteVideoRef.current
          ?.play()
          .catch(() => { }); // ⛔ ignore AbortError safely
      };
    };


    // Connection state
    peer.onconnectionstatechange = () => {
      if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
        setParticipantCount(1);
      }
    };

    // Add local tracks immediately
    const localStream = localStreamRef.current;
    if (localStream) {
      localStream.getTracks().forEach(track => peer.addTrack(track, localStream));
    }

    peerRef.current = peer;

    // Force negotiation immediately to ensure both sides send an offer
    // setTimeout(async () => {
    //   try {
    //     const offer = await peer.createOffer();
    //     await peer.setLocalDescription(offer);
    //     socketRef.current?.emit('signal', { roomId, signal: { sdp: offer } });
    //   } catch (err) {
    //     console.error('Offer creation failed:', err);
    //   }
    // }, 0);

    return peer;
  }, [roomId]);

  /* -------------------- SOCKET EVENTS -------------------- */
  const registerSocketEvents = useCallback(() => {
    if (!socketRef.current) return;

    socketRef.current.on('room-full', ({ message }) => {
      alert(message);
      window.location.href = '/';
    });

    // Always create peer on join
    socketRef.current.on('joined-room', ({ userCount }) => {
      setParticipantCount(userCount ?? 1);
      createPeer();
    });

    socketRef.current.on('user-joined', ({ userCount }) => {
      setParticipantCount(userCount ?? 2);
      createPeer();
    });

    socketRef.current.on('signal', async ({ signal }) => {
      const peer = peerRef.current || createPeer();

      try {
        if (signal.sdp) {
          const desc = new RTCSessionDescription(signal.sdp);
          if (
            (desc.type === 'offer' && peer.signalingState === 'stable') ||
            (desc.type === 'answer' && peer.signalingState === 'have-local-offer')
          ) {
            await peer.setRemoteDescription(desc);
          } else {
            return; // ⛔ ignore invalid/duplicate SDP
          }

          // Flush any queued ICE candidates
          for (const candidate of iceCandidateQueueRef.current) {
            await peer.addIceCandidate(new RTCIceCandidate(candidate));
          }
          iceCandidateQueueRef.current = [];

          if (desc.type === 'offer') {
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);
            socketRef.current?.emit('signal', { roomId, signal: { sdp: answer } });
          }
        }

        if (signal.candidate) {
          if (peer.remoteDescription) {
            await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } else {
            iceCandidateQueueRef.current.push(signal.candidate);
          }
        }
      } catch (err) {
        console.error('Signal handling error:', err);
      }
    });

    socketRef.current.on('user-left', ({ userCount }) => {
      setParticipantCount(userCount ?? 1);
      peerRef.current?.close();
      peerRef.current = null;
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    });

    socketRef.current.on('screen-share-started', () => setRemoteScreenSharing(true));
    socketRef.current.on('screen-share-stopped', () => setRemoteScreenSharing(false));
  }, [createPeer, roomId]);


  /* -------------------- CONTROLS -------------------- */
  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  };

  const shareScreen = async () => {
    if (isScreenSharing) return stopScreenShare();

    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = screenStream;
      if (localVideoRef.current) localVideoRef.current.srcObject = screenStream;

      const videoTrack = screenStream.getVideoTracks()[0];
      if (!videoTrack) {
        return;
      }
      const sender = peerRef.current?.getSenders().find(s => s.track?.kind === 'video');
      if (sender && videoTrack) await sender.replaceTrack(videoTrack);

      videoTrack.onended = stopScreenShare;
      setIsScreenSharing(true);
      socketRef.current?.emit('screen-share-started', { roomId });
    } catch (err) {
      console.error('Screen share error:', err);
    }
  };

  const stopScreenShare = () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(t => t.stop());
      screenStreamRef.current = null;
    }
    if (localVideoRef.current && localStreamRef.current) localVideoRef.current.srcObject = localStreamRef.current;

    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    const sender = peerRef.current?.getSenders().find(s => s.track?.kind === 'video');
    if (sender && videoTrack) sender.replaceTrack(videoTrack);

    setIsScreenSharing(false);
    socketRef.current?.emit('screen-share-stopped', { roomId });
  };

  const endCall = () => {
    cleanup();
    window.location.href = '/';
  };

  /* -------------------- UI -------------------- */
  return (
    <div className="w-full h-[90vh] flex flex-col relative rounded-xl overflow-hidden shadow-2xl">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 p-4 bg-gradient-to-b from-black/50 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-white text-sm font-medium">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>

          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative flex items-center justify-center ">
        {/* Remote Video */}
        <div className="w-full h-full max-w-none rounded-2xl overflow-hidden shadow-2xl  relative">
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className={`w-full h-full ${remoteScreenSharing || isScreenSharing
              ? 'object-contain bg-black'  // Fit entire screen/tab without cropping
              : 'object-cover'             // Fill frame for camera
              }`}
          />

          {participantCount === 1 && (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-900/90 to-slate-800/90">
              <div className="text-center">
                <Users className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                <p className="text-slate-300 text-xl font-medium">Waiting for others to join...</p>
                <p className="text-slate-500 text-sm mt-2">Share room code: <span className="font-mono bg-slate-700 px-2 py-1 rounded text-xs">{roomId}</span></p>
              </div>
            </div>
          )}

          {/* {remoteScreenSharing && (
            <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg">
              <MdOutlineScreenShare className="w-4 h-4" />
              <span>Screen sharing</span>
            </div>
          )} */}
        </div>

        {/* Local Video PiP */}
        <div className="absolute bottom-5 right-4 w-52 h-34 rounded-2xl overflow-hidden bg-slate-900/90 shadow-2xl border-2 border-slate-700/50 group hover:scale-105 transition-all duration-200 hover:border-blue-500">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`w-full h-full ${isScreenSharing ? 'object-contain bg-black' : 'object-cover'}`}
          />

          {!cameraOn && !isScreenSharing && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80">
              <BsCameraVideoOff className="text-slate-400 text-3xl" />
            </div>
          )}

          {isScreenSharing && (
            <div className="absolute top-2 left-2 bg-blue-600/90 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-lg flex items-center gap-1 shadow-md">
              <MdOutlineScreenShare className="w-3 h-3" />
              <span>Sharing</span>
            </div>
          )}

          <button
            className="absolute top-2 right-2 bg-slate-900/80 hover:bg-slate-800 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-md hover:shadow-lg"
            title="Maximize"
            onClick={() => { /* Add maximize logic */ }}
          >
            <Maximize2 className="w-4 h-4 text-white" />
          </button>

          <div className="absolute bottom-2 left-2 text-white text-xs font-medium bg-slate-900/90 px-2 py-1 rounded-lg backdrop-blur-sm">
            You
          </div>
        </div>
      </div>

      {/* Controls */}
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
            onClick={shareScreen}
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
