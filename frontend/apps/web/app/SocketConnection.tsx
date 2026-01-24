"use client";

import { useEffect } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@/contexts/AuthContext"; 

let socket: Socket;

export const useSocket = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user?._id) return;

    socket = io(process.env.NEXT_PUBLIC_ROOM_URL as string, {
      query: { userId: user._id },
      transports: ["websocket"],
    });

    socket.on("update-user-status", ({ userId, isOnline }) => {
      console.log(`User ${userId} is now ${isOnline ? "online" : "offline"}`);
    });

    return () => {
      socket.disconnect();
      console.log("Socket disconnected for user:", user._id);
    };
  }, [user?._id]);

  return socket;
};
