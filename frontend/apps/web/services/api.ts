import axios from 'axios'
import type { AxiosRequestConfig } from 'axios';
import { error } from 'console';
import { config } from 'process';
import type { SessionStatusType } from '../components/constants/sessionStatus'
const API_BASE_URL =process.env.NEXT_PUBLIC_BACKEND_URL


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

  getUserProfileData: async (id: any) => {
    return authAPI.get(`/user/${id}`);
  },
  userFollow: async (id: any) => {
    return authAPI.post(`/user/${id}/follow`)
  },
  suggestedUser: async () => {
    return authAPI.get('/user/suggestedUser')
  },
  myPosts: async () => {
    return authAPI.get('/user/myPosts')
  }
};

export const SessionAPI = {
  bookSession: async (data: any) => {
    return authAPI.post('/session/book-session', data)
  },

  getAllBookSession: async () => {
    return authAPI.get('/session/pending-session')
  },

  postAcceptSession: async (payload: { requesterId: string; sessionId: string }) => {
    return authAPI.post('/session/accept-session', payload);
  },

  getAllAcceptSession: async () => {
    return authAPI.get('/session/accept-session')
  },

  getAllCompleteSession: async() => {
     return authAPI.get('/session/complete-session')
  },

  getMyPendingSessions: async (params: { status: SessionStatusType }) => {
    console.log("P" , params)
    return authAPI.get("/session/my-request-session", {
      params,
    });
  },

   postCancelSession: async (payload: { requesterId: string; sessionId: string }) => {
    return authAPI.post('/session/cancel-session', payload);
  },

    getAllCancelSession: async () => {
    return authAPI.get('/session/cancel-session')
  },

}

export const ChatAPI = {
  getAllChats: () => authAPI.get(`/chat`),

  getMessages: (otherUserId: string) =>
    authAPI.get(`/chat/messages/${otherUserId}`),

  sendMessage: (receiverId: string, message: string) =>
    authAPI.post(`/chat/send`, { receiverId, message }),
};

export const RoomAPI = {
  getDecodeRoomId: (meetLink: string) => {
    return authAPI.post('/room/decode', { meetLink });
  },
};

export const notificationAPI = {
  getMyNotification: ()=>{
    return authAPI.get('/notifications')
  },

  updateRead:(id:string)=>{
    return authAPI.patch(`/notifications/${id}/read`) ;
  },

  unreadCount:()=>{
    return authAPI.get('/notifications/unread/count')
  }
}