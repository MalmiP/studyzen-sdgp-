// src/app/api/confessions.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

interface ConfessionData {
  text: string;
  isAnonymous: boolean;
  author: string | null;
}

interface ReplyData {
  text: string;
  isAnonymous: boolean;
  author: string | null;
}

// A safer way to get userId that works with SSR
const getUserId = (): string => {
  if (typeof window !== 'undefined') {
    const storedId = localStorage.getItem('userId');
    if (storedId) return storedId;
    
    // Generate a more stable ID
    const newId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    localStorage.setItem('userId', newId);
    return newId;
  }
  
  // Return a placeholder during SSR
  return 'ssr-placeholder-id';
};

export const confessionApi = {
  getAllConfessions: async (): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}/confessions`);
      return response.data;
    } catch (error) {
      console.error('Error fetching confessions:', error);
      throw error;
    }
  },
  
  createConfession: async (confessionData: ConfessionData): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/confessions`, {
        ...confessionData,
        userId: getUserId()
      });
      return response.data;
    } catch (error) {
      console.error('Error creating confession:', error);
      throw error;
    }
  },
  
  likeConfession: async (confessionId: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/confessions/${confessionId}/like`, {
        userId: getUserId()
      });
      return response.data;
    } catch (error) {
      console.error('Error liking confession:', error);
      throw error;
    }
  },
  
  dislikeConfession: async (confessionId: string): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/confessions/${confessionId}/dislike`, {
        userId: getUserId()
      });
      return response.data;
    } catch (error) {
      console.error('Error disliking confession:', error);
      throw error;
    }
  },
  
  addReply: async (confessionId: string, replyData: ReplyData): Promise<any> => {
    try {
      const response = await axios.post(`${API_URL}/confessions/${confessionId}/replies`, {
        ...replyData,
        userId: getUserId()
      });
      return response.data;
    } catch (error) {
      console.error('Error adding reply:', error);
      throw error;
    }
  },
  
  getReplies: async (confessionId: string): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}/confessions/${confessionId}/replies`);
      return response.data;
    } catch (error) {
      console.error('Error fetching replies:', error);
      throw error;
    }
  },
  
  getFlaggedConfessions: async (): Promise<any[]> => {
    try {
      const response = await axios.get(`${API_URL}/confessions/flagged`);
      console.log("Flagged confessions API response:", response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching flagged confessions:', error);
      throw error;
    }
  }
};

// Types for Confession and Reply
export interface Confession {
  _id: string;
  text: string;
  likes: number;
  dislikes: number;
  timestamp: string;
  isAnonymous: boolean;
  author: string | null;
  userId: string;
  likedBy: string[];
  dislikedBy: string[];
  replies: Reply[];
}

export interface Reply {
  _id: string;
  text: string;
  timestamp: string;
  isAnonymous: boolean;
  author: string | null;
  userId: string;
}

export interface FlaggedConfession {
  _id: string;
  text: string;
  userId: string;
  reason: string;
  categories: Record<string, boolean>;
  reviewed: boolean;
  timestamp: string;
}

export const fetchFlaggedConfessions = async () => {
  const response = await fetch('/api/confessions/flagged');
  return response.json();
};

export const approveConfession = async (id: string) => {
  const response = await fetch(`/api/confessions/approve/${id}`, { method: 'POST' });
  return response.json();
};