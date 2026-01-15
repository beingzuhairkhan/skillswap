'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { MdOutlineMicNone, MdOutlineMicOff, MdOutlineScreenShare, MdCallEnd } from "react-icons/md";
import { BsCameraVideo, BsCameraVideoOff } from "react-icons/bs";
import { Users } from "lucide-react";

const LeftVideoBody = ({ roomId }: { roomId: string }) => {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const localStreamRef = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const peerRef = useRef<RTCPeerConnection | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const iceCandidateQueueRef = useRef<RTCIceCandidateInit[]>([]);

  const isInitiatorRef = useRef(false);

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
      console.log('✅ Socket connected');
      setIsConnected(true);
      socket.emit('join-room', roomId);
    });

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    const init = async () => {
      await initLocalMedia();
      registerSocketEvents();
    };
    init();

    return () => {
      cleanup();
    };
  }, [roomId]);

  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up...');
    socketRef.current?.disconnect();
    peerRef.current?.close();
    peerRef.current = null;
    localStreamRef.current?.getTracks().forEach(track => track.stop());
    screenStreamRef.current?.getTracks().forEach(track => track.stop());
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
  }, []);

  /* -------------------- LOCAL MEDIA -------------------- */
  const initLocalMedia = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 1280, height: 720, facingMode: 'user' },
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });

      localStreamRef.current = stream;
      console.log('✅ Local media initialized');

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
        localVideoRef.current.muted = true;
        localVideoRef.current.play().catch(console.error);
      }
    } catch (err) {
      console.error('❌ Error accessing camera/mic:', err);
    }
  };

  /* -------------------- CREATE PEER -------------------- */
  const createPeer = useCallback(() => {
    if (peerRef.current) {
      console.log('ℹ️ Peer already exists');
      return peerRef.current;
    }

    console.log('🔨 Creating new peer connection');
    const peer = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    peerRef.current = peer;

    // ICE candidates
    peer.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('🧊 Sending ICE candidate');
        socketRef.current?.emit('signal', { 
          roomId, 
          signal: { candidate: event.candidate } 
        });
      }
    };

    // Remote stream
    peer.ontrack = (event) => {
      const [remoteStream] = event.streams;
      console.log('📹 Remote stream received');
      
      if (remoteVideoRef.current && remoteStream) {
        if (remoteVideoRef.current.srcObject !== remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream;
          remoteVideoRef.current.play().catch(console.error);
        }
      }
    };

    // Connection state
    peer.onconnectionstatechange = () => {
      console.log('📶 Peer connection state:', peer.connectionState);
      if (peer.connectionState === 'disconnected' || peer.connectionState === 'failed') {
        setParticipantCount(1);
      }
    };

    // Add local tracks
    const localStream = localStreamRef.current;
    if (localStream) {
      localStream.getTracks().forEach(track => {
        console.log(`➕ Adding ${track.kind} track`);
        peer.addTrack(track, localStream);
      });
    }

    // Negotiation
    peer.onnegotiationneeded = async () => {
      console.log('🤝 Negotiation needed');
      try {
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        console.log('📤 Sending offer');
        socketRef.current?.emit('signal', { 
          roomId, 
          signal: { sdp: peer.localDescription } 
        });
      } catch (err) {
        console.error('❌ Negotiation failed:', err);
      }
    };

    return peer;
  }, [roomId]);

  /* -------------------- SOCKET EVENTS -------------------- */
  const registerSocketEvents = useCallback(() => {
    if (!socketRef.current) return;

    const socket = socketRef.current;

    socket.on('room-full', ({ message }) => {
      console.log('🚫 Room full:', message);
      alert(message);
      window.location.href = '/';
    });

    socket.on('joined-room', ({ userCount }) => {
      console.log('🏠 Joined room, userCount:', userCount);
      setParticipantCount(userCount ?? 1);
      isInitiatorRef.current = true;
      createPeer();
    });

    socket.on('user-joined', ({ userCount }) => {
      console.log('👤 New user joined, userCount:', userCount);
      setParticipantCount(userCount ?? 2);
      isInitiatorRef.current = false;
      createPeer();
    });

    socket.on('signal', async ({ signal }) => {
      console.log('📨 Received signal:', signal);
      const peer = peerRef.current || createPeer();

      try {
        if (signal.sdp) {
          const desc = new RTCSessionDescription(signal.sdp);
          console.log('📥 Setting remote description:', desc.type);
          
          if (
            (desc.type === 'offer' && peer.signalingState === 'stable') ||
            (desc.type === 'answer' && peer.signalingState === 'have-local-offer')
          ) {
            await peer.setRemoteDescription(desc);

            // Flush queued ICE candidates
            for (const candidate of iceCandidateQueueRef.current) {
              await peer.addIceCandidate(new RTCIceCandidate(candidate));
            }
            iceCandidateQueueRef.current = [];

            if (desc.type === 'offer') {
              console.log('📤 Creating and sending answer');
              const answer = await peer.createAnswer();
              await peer.setLocalDescription(answer);
              socketRef.current?.emit('signal', { 
                roomId, 
                signal: { sdp: peer.localDescription } 
              });
            }
          }
        }

        if (signal.candidate) {
          if (peer.remoteDescription) {
            console.log('🧊 Adding received ICE candidate');
            await peer.addIceCandidate(new RTCIceCandidate(signal.candidate));
          } else {
            console.log('⏳ Queueing ICE candidate');
            iceCandidateQueueRef.current.push(signal.candidate);
          }
        }
      } catch (err) {
        console.error('❌ Signal handling error:', err);
      }
    });

    socket.on('user-left', ({ userCount }) => {
      console.log('👋 User left, userCount:', userCount);
      setParticipantCount(userCount ?? 1);
      if (peerRef.current) {
        peerRef.current.close();
        peerRef.current = null;
      }
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = null;
      }
    });

    socket.on('screen-share-started', () => {
      console.log('🖥️ Remote screen sharing started');
      setRemoteScreenSharing(true);
    });

    socket.on('screen-share-stopped', () => {
      console.log('🖥️ Remote screen sharing stopped');
      setRemoteScreenSharing(false);
    });
  }, [createPeer, roomId]);

  /* -------------------- CONTROLS -------------------- */
  const toggleMic = () => {
    const track = localStreamRef.current?.getAudioTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setMicOn(track.enabled);
      console.log('🔊 Mic:', track.enabled ? 'ON' : 'OFF');
    }
  };

  const toggleCamera = () => {
    const track = localStreamRef.current?.getVideoTracks()[0];
    if (track) {
      track.enabled = !track.enabled;
      setCameraOn(track.enabled);
      console.log('📹 Camera:', track.enabled ? 'ON' : 'OFF');
    }
  };

  const shareScreen = async () => {
    if (isScreenSharing) {
      stopScreenShare();
      return;
    }

    try {
      console.log('🖥️ Starting screen share');
      const screenStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: true, 
        audio: false 
      });
      
      screenStreamRef.current = screenStream;
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = screenStream;
      }

      const videoTrack = screenStream.getVideoTracks()[0];
        if (videoTrack) {
      if (videoTrack && peerRef.current) {
        const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
        if (sender && videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      }

      videoTrack.onended = stopScreenShare ;
    }
      setIsScreenSharing(true);
      socketRef.current?.emit('screen-share-started', { roomId });
    } catch (err) {
      console.error('❌ Screen share error:', err);
    }
  };

  const stopScreenShare = () => {
    console.log('🖥️ Stopping screen share');
    if (screenStreamRef.current) {
      screenStreamRef.current.getTracks().forEach(track => track.stop());
      screenStreamRef.current = null;
    }

    if (localVideoRef.current && localStreamRef.current) {
      localVideoRef.current.srcObject = localStreamRef.current;
    }

    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (peerRef.current) {
      const sender = peerRef.current.getSenders().find(s => s.track?.kind === 'video');
      if (sender && videoTrack) {
        sender.replaceTrack(videoTrack);
      }
    }

    setIsScreenSharing(false);
    socketRef.current?.emit('screen-share-stopped', { roomId });
  };

  const endCall = () => {
    console.log('📞 Ending call');
    cleanup();
    window.location.href = '/';
  };

  /* -------------------- RENDER -------------------- */
  return (
    <div className="w-full h-full bg-black rounded-lg flex flex-col relative">
      {/* Remote Video */}
      <div className="flex-1 relative bg-gray-900 rounded-t-lg overflow-hidden">
        <video
          ref={remoteVideoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
        {remoteScreenSharing && (
          <div className="absolute top-3 right-3 bg-blue-600/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm font-medium border border-blue-500/50">
            🖥️ Screen Sharing
          </div>
        )}
      </div>

      {/* Local Video & Controls */}
      <div className="h-28 relative bg-gradient-to-t from-black/80 to-transparent rounded-b-lg p-3">
        {/* Local Video Preview */}
        <div className="absolute top-2 left-3 w-20 h-20 rounded-2xl overflow-hidden border-4 border-white/30 shadow-2xl">
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        </div>

        {/* Controls */}
        <div className="absolute bottom-3 right-3 flex space-x-2 bg-black/60 backdrop-blur-md rounded-2xl p-2 border border-white/20">
          <button
            onClick={toggleMic}
            className={`p-3 rounded-xl transition-all shadow-lg ${
              micOn 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={micOn ? 'Mute microphone' : 'Unmute microphone'}
          >
            {micOn ? <MdOutlineMicNone size={20} /> : <MdOutlineMicOff size={20} />}
          </button>

          <button
            onClick={toggleCamera}
            className={`p-3 rounded-xl transition-all shadow-lg ${
              cameraOn 
                ? 'bg-emerald-500 hover:bg-emerald-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={cameraOn ? 'Turn off camera' : 'Turn on camera'}
          >
            {cameraOn ? <BsCameraVideo size={20} /> : <BsCameraVideoOff size={20} />}
          </button>

          <button
            onClick={shareScreen}
            className={`p-3 rounded-xl transition-all shadow-lg ${
              isScreenSharing
                ? 'bg-red-500 hover:bg-red-600 text-white'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            title={isScreenSharing ? 'Stop screen sharing' : 'Share screen'}
          >
            <MdOutlineScreenShare size={20} />
          </button>

          <button
            onClick={endCall}
            className="p-3 rounded-xl bg-red-500 hover:bg-red-600 text-white shadow-lg transition-all"
            title="End call"
          >
            <MdCallEnd size={20} />
          </button>
        </div>

        {/* Status Indicators */}
        <div className="absolute top-3 right-3 flex flex-col space-y-1">
          <div className="flex items-center space-x-1 bg-black/70 px-2 py-1 rounded-lg text-xs">
            <Users size={14} />
            <span>{participantCount}</span>
          </div>
          <div className={`px-2 py-1 rounded-lg text-xs font-medium ${
            isConnected 
              ? 'bg-emerald-500/90 text-white' 
              : 'bg-red-500/90 text-white'
          }`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>

        {/* Screen Share Status */}
        {isScreenSharing && (
          <div className="absolute bottom-3 left-3 bg-yellow-500/90 backdrop-blur-sm text-black px-3 py-1 rounded-full text-sm font-semibold">
            📱 You are screen sharing
          </div>
        )}
      </div>
    </div>
  );
};

export default LeftVideoBody;
