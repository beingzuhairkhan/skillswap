import axios from 'axios'
import type { AxiosRequestConfig } from 'axios';
import { error } from 'console';
import { config } from 'process';
const API_BASE_URL = 'http://localhost:4000'


interface AxiosRequestConfigWithRetry extends AxiosRequestConfig {
  _retry?: boolean;
}


export const authAPI = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

authAPI.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
)

export const userDataAPI = {
  getProfile: async () => {
    return authAPI.get('/user/me');
  },
  getUserById: async (id: string) => {
    return authAPI.get(`/user/profile/${id}`);
  },
  updateProfile: async (data: any) => {
    return authAPI.patch('/user/profile', data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },
  createPost: async (data: any) => {
    return authAPI.post('/user/create-post', data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },

  getAllPosts: async () => {
    return authAPI.get('/user/posts')
  },

  getUserProfileDataById: async (userId: string) => {
    return authAPI.get(`/user/profile/${userId}`)
  },

  createCodingProfile: async (data: any) => {
    return authAPI.post('/user/coding-profile', data, {
      headers: { "Content-Type": "multipart/form-data" }
    });
  },

  getCodingProfile: async () => {
    return authAPI.get('/user/coding-profile');
  },

  getLeetcodeProfile: async () => {
    return authAPI.get('/user/coding-leetcode')
  },

  getUserProfileData: async (id:any) => {
    return authAPI.get(`/user/${id}`);
  },
  userFollow:async(id:any)=>{
    return authAPI.post(`/user/${id}/follow`)
  }
};

export const SessionAPI = {
  bookSession: async (data: any) => {
    return authAPI.post('/session/book-session', data)
  },

  getAllBookSession: async () => {
    return authAPI.get('/session/book-session')
  },

  postAcceptSession: async (payload: { requesterId: string; sessionId: string }) => {
    return authAPI.post('/session/accept-session', payload);
  },

   getAllAcceptSession: async () => {
    return authAPI.get('/session/accept-session')
  },

}

export const ChatAPI = {
  // Fetch all chats for sidebar
  getAllChats: () => authAPI.get(`/chat`),

  // Fetch messages for a specific user
  getMessages: (otherUserId: string) =>
    authAPI.get(`/chat/messages?userId=${otherUserId}`),

  // Send message to a specific user
  sendMessage: (receiverId: string, message: string) =>
    authAPI.post(`/chat/send`, { receiverId, message }),
};

export const RoomAPI = {
  getDecodeRoomId: (meetLink: string) => {
    return authAPI.post('/room/decode', { meetLink });
  },
};