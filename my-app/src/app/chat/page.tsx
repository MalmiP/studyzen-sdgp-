'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Cloud, MessageSquare } from 'lucide-react';
import { io, Socket } from 'socket.io-client';

interface Message {
  id: string;
  text: string;
  sender: string;
}

// Helper function to determine the socket URL
const getSocketUrl = () => {
  if (typeof window !== 'undefined') {
    // If developing locally on port 3000, use port 3001 for the backend
    if (window.location.hostname === 'localhost' && window.location.port === '3000') {
      return 'http://localhost:3001';
    }
    // Otherwise, assume same origin
    return window.location.origin;
  }
  return '';
};

export default function Chat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [status, setStatus] = useState<string>('Connecting...');
  const [room, setRoom] = useState<string>('');
  const [strangerTyping, setStrangerTyping] = useState<boolean>(false);
  const socketRef = useRef<Socket | null>(null);
  const socketIdRef = useRef<string>('');
  const messageEndRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const socketUrl = getSocketUrl();
    console.log('Connecting to socket server at:', socketUrl);
    const socket = io(socketUrl);
    socketRef.current = socket;

    socket.on('connect', () => {
      socketIdRef.current = socket.id;
      setStatus('Connected. Click "New Chat" to start.');
      console.log('Connected with id:', socket.id);
    });

    socket.on('waiting', (data) => {
      setStatus(data.message);
    });

    socket.on('chatStarted', (data) => {
      setRoom(data.room);
      setStatus('Chat started! Say hi.');
      setMessages([]);
      console.log('Chat started in room:', data.room);
    });

    socket.on('message', (data) => {
      if (data.sender === socketIdRef.current) return;
      const incomingMessage: Message = {
        id: Date.now().toString(),
        text: data.message,
        sender: data.sender,
      };
      setMessages((prev) => [...prev, incomingMessage]);
    });

    socket.on('typing', (data) => {
      if (data.sender !== socketIdRef.current) {
        setStrangerTyping(true);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setStrangerTyping(false);
        }, 2000);
      }
    });

    socket.on('skipped', (data) => {
      setStatus(data.message || 'User has disconnected. Please start a new chat.');
      setRoom('');
      setMessages([]);
    });

    socket.on('disconnect', () => {
      setStatus('Disconnected.');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const startNewChat = () => {
    console.log('Emitting newChat event');
    if (socketRef.current) {
      socketRef.current.emit('newChat');
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !room) return;
    if (socketRef.current) {
      socketRef.current.emit('sendMessage', { room, message: newMessage });
      const myMessage: Message = {
        id: Date.now().toString(),
        text: newMessage,
        sender: socketIdRef.current,
      };
      setMessages((prev) => [...prev, myMessage]);
      setNewMessage('');
    }
  };

  const handleTyping = (value: string) => {
    setNewMessage(value);
    if (socketRef.current && room) {
      socketRef.current.emit('typing', { room, sender: socketIdRef.current });
    }
  };

  const skipChat = () => {
    if (window.confirm("Are you sure you want to skip this chat?")) {
      if (socketRef.current && room) {
        socketRef.current.emit('skipChat', { room });
        setStatus('You skipped the chat. Please start a new chat.');
        setRoom('');
        setMessages([]);
      }
    }
  };

  return (
    <div className="p-6 bg-blue-50 min-h-screen font-mono relative overflow-hidden">
      <div className="absolute top-10 left-10 text-blue-200 opacity-20 animate-float">
        <Cloud size={64} />
      </div>
      <div className="absolute bottom-10 right-10 text-blue-200 opacity-20 animate-float" style={{ animationDelay: '1s' }}>
        <Cloud size={48} />
      </div>
      <div className="absolute top-1/2 left-1/4 text-blue-200 opacity-20 animate-float" style={{ animationDelay: '1.5s' }}>
        <Cloud size={56} />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-blue-900">Anonymous Chat</h1>
          <div className="flex items-center space-x-4">
            <Button
              onClick={startNewChat}
              className="bg-blue-300 hover:bg-blue-400 text-blue-900 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              New Chat
            </Button>
            <Button
              onClick={skipChat}
              className="bg-red-300 hover:bg-red-400 text-red-900 transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              Skip
            </Button>
          </div>
        </div>
        <p className="mb-2 text-blue-700">{status}</p>
        {strangerTyping && <p className="mb-2 text-blue-500">Stranger is typing...</p>}
        <Card className="bg-white shadow-lg border-blue-200 mb-6">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-2xl text-blue-900 flex items-center">
              <MessageSquare size={24} className="mr-2" /> Chat Room {room && `(${room})`}
            </CardTitle>
          </CardHeader>
          <CardContent className="h-96 overflow-y-auto space-y-4 p-4 flex flex-col">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-md p-3 rounded-lg ${
                  msg.sender === socketIdRef.current ? 'bg-blue-100 self-end' : 'bg-gray-200 self-start'
                }`}
              >
                <p className="text-blue-900">{msg.text}</p>
              </div>
            ))}
            <div ref={messageEndRef} />
          </CardContent>
        </Card>
        <div className="flex space-x-2">
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => handleTyping(e.target.value)}
            placeholder="Type your message..."
            className="flex-grow border-blue-200 focus:border-blue-400 focus:ring-blue-400 transition-all duration-300"
          />
          <Button
            onClick={sendMessage}
            className="bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300 ease-in-out"
          >
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}