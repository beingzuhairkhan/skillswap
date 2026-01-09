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
    const socket = io('http://localhost:4000', {
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

    initMedia();
    registerSocketEvents();

    return () => {
      cleanup();
    };
  }, [roomId]);

  const cleanup = useCallback(() => {
    socketRef.current?.disconnect();
    peerRef.current?.close();
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
  }, []);

  /* -------------------- MEDIA -------------------- */
  const initMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720 },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
      });

      localStreamRef.current = stream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing media devices:', error);
    }
  };

  /* -------------------- PEER -------------------- */
  const createPeer = useCallback(() => {
    if (peerRef.current) {
      console.log('Peer already exists');
      return peerRef.current;
    }

    console.log('Creating peer connection');
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('Sending ICE candidate');
        socketRef.current?.emit('signal', {
          roomId,
          signal: { candidate: event.candidate },
        });
      }
    };

    peer.ontrack = (event) => {
      console.log('Received remote track:', event.track.kind, 'stream:', event.streams[0]);
      if (remoteVideoRef.current && event.streams[0]) {
        console.log('Setting remote video srcObject');
        remoteVideoRef.current.srcObject = event.streams[0];
        remoteVideoRef.current.play().catch(err => {
          console.error('Error playing remote video:', err);
        });
        setParticipantCount(2);
      }
    };

    peer.onconnectionstatechange = () => {
      console.log('Connection state:', peer.connectionState);
      if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
        setParticipantCount(1);
      }
    };

    peer.onnegotiationneeded = async () => {
      console.log('Negotiation needed, signalingState:', peer.signalingState);
      if (peer.signalingState !== 'stable') {
        console.log('Not stable, skipping negotiation');
        return;
      }

      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        console.log('Offer created and sent');
        socketRef.current?.emit('signal', {
          roomId,
          signal: { sdp: offer },
        });
      } catch (error) {
        console.error('Negotiation error:', error);
      }
    };

    // CRITICAL: Add tracks AFTER setting up event handlers
    const currentStream = localStreamRef.current;
    if (currentStream) {
      currentStream.getTracks().forEach((track) => {
        console.log('Adding track to peer:', track.kind);
        peer.addTrack(track, currentStream);
      });
    }

    peerRef.current = peer;
    return peer;
  }, [roomId]);

  /* -------------------- SOCKET EVENTS -------------------- */
  const registerSocketEvents = useCallback(() => {
    socketRef.current?.on('room-full', ({ message }) => {
      alert(message);
      window.location.href = '/';
    });

    socketRef.current?.on('joined-room', ({ isInitiator, userCount }) => {
      console.log('Joined room. Initiator:', isInitiator, 'Users:', userCount);
      isInitiatorRef.current = isInitiator;
      setParticipantCount(userCount || 1);
    });

    socketRef.current?.on('user-joined', ({ userCount }) => {
      console.log('User joined. Total users:', userCount, 'Am I initiator?', isInitiatorRef.current);
      setParticipantCount(userCount || 2);

      // Always create peer when someone joins - let negotiation handle rest
      createPeer();
    });

    socketRef.current?.on('signal', async ({ signal }) => {
      console.log('Received signal:', signal.sdp ? `${signal.sdp.type}` : 'ICE candidate');

      // Create peer if needed BEFORE handling SDP
      if (!peerRef.current) {
        console.log('Creating peer for incoming signal');
        createPeer();
      }

      const peer = peerRef.current;
      if (!peer) return;

      try {
        if (signal.sdp) {
          const desc = new RTCSessionDescription(signal.sdp);

          if (desc.type === 'offer') {
            console.log('Setting remote offer');
            await peer.setRemoteDescription(desc);

            console.log('Creating answer');
            const answer = await peer.createAnswer();
            await peer.setLocalDescription(answer);

            console.log('Sending answer');
            socketRef.current?.emit('signal', {
              roomId,
              signal: { sdp: answer },
            });
          } else if (desc.type === 'answer') {
            console.log('Setting remote answer, current state:', peer.signalingState);
            if (peer.signalingState === 'have-local-offer') {
              await peer.setRemoteDescription(desc);
              console.log('Answer set successfully');
            } else {
              console.log('Ignoring answer, wrong state:', peer.signalingState);
            }
          }
        }

        if (signal.candidate) {
          if (peer.remoteDescription) {
            await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
            console.log('ICE candidate added');
          } else {
            console.log('Waiting for remote description before adding ICE');
          }
        }
      } catch (error) {
        console.error('Signal handling error:', error);
      }
    });

    socketRef.current?.on('user-left', ({ userCount }) => {
      console.log('User left. Remaining users:', userCount);
      setParticipantCount(userCount || 1);

      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }

      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    socketRef.current?.on('screen-share-started', () => {
      console.log('Remote user started screen sharing');
      setRemoteScreenSharing(true);
    });

    socketRef.current?.on('screen-share-stopped', () => {
      console.log('Remote user stopped screen sharing');
      setRemoteScreenSharing(false);
    });
  }, [createPeer, roomId]);

  /* -------------------- CONTROLS -------------------- */
  const toggleMic = useCallback(() => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
    }
  }, []);

  const toggleCamera = useCallback(() => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
    }
  }, []);

  const shareScreen = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    try {
      // const screenStream = await navigator.mediaDevices.getDisplayMedia({
      //   video: {
      //     frameRate: 30,
      //     width: { ideal: 1920 },
      //     height: { ideal: 1080 },
      //     cursor: "always",
      //   },
      //   audio: false,
      // });
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          frameRate: 30,
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          cursor: "always",
        } as any,
        audio: false,
      });

      screenStreamRef.current = screenStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      // Replace video track in peer connection
      if (peerRef.current?.connectionState === 'connected') {
        const senders = peerRef.current.getSenders();
        const videoSender = senders.find(s => s.track?.kind === 'video');
        if (videoSender) {
          await videoSender.replaceTrack(screenStream.getVideoTracks()[0] || null);
        }
      }

      setIsScreenSharing(true);
      socketRef.current?.emit('screen-share-started', { roomId });

     const videoTrack = screenStream.getVideoTracks()[0];

if (videoTrack) {
  videoTrack.onended = stopScreenShare;
}

    } catch (error) {
      console.error('Screen share error:', error);
    }
  };

  const stopScreenShare = useCallback(async () => {
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    if (peerRef.current?.connectionState === 'connected' && localStreamRef.current) {
      const senders = peerRef.current.getSenders();
      const videoSender = senders.find(s => s.track?.kind === 'video');
      if (videoSender) {
        await videoSender.replaceTrack(localStreamRef.current.getVideoTracks()[0] || null);
      }
    }

    setIsScreenSharing(false);
    socketRef.current?.emit('screen-share-stopped', { roomId });
  }, [roomId]);

  const endCall = useCallback(() => {
    cleanup();
    window.location.href = '/';
  }, [cleanup]);

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
            <div className="flex items-center gap-2 bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <Users className="w-4 h-4 text-blue-400" />
              <span className="text-white text-sm font-medium">
                {participantCount} Participant{participantCount > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-300 text-sm font-mono bg-slate-800/80 backdrop-blur-sm px-4 py-2 rounded-full">
              Room: {roomId.slice(0, 8)}...
            </span>
          </div>
        </div>
      </div>

      {/* Main Video Area */}
      <div className="flex-1 relative flex items-center justify-center p-4 pt-20">
        {/* Remote Video */}
        <div className="w-full h-full max-w-[1400px] rounded-2xl overflow-hidden shadow-2xl bg-slate-900 relative">
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

          {remoteScreenSharing && (
            <div className="absolute top-4 left-4 bg-blue-600/90 backdrop-blur-sm text-white text-sm px-3 py-2 rounded-lg flex items-center gap-2 shadow-lg">
              <MdOutlineScreenShare className="w-4 h-4" />
              <span>Screen sharing</span>
            </div>
          )}
        </div>

        {/* Local Video PiP */}
        <div className="absolute bottom-20 right-6 w-72 h-44 rounded-2xl overflow-hidden bg-slate-900/90 shadow-2xl border-2 border-slate-700/50 group hover:scale-105 transition-all duration-200 hover:border-blue-500">
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
      <div className="absolute bottom-0 left-0 right-0 z-20 p-6 pb-8 bg-gradient-to-t from-black/80 to-transparent">
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
