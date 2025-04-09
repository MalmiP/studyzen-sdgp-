'use client'
import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsUp, ThumbsDown, UserCircle, UserX, MessageCircle } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { confessionApi } from '../api/confessions'
import { toast } from 'react-hot-toast'
import { io, Socket } from 'socket.io-client'
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface Reply {
  _id: string
  text: string
  timestamp: string
  isAnonymous: boolean
  author: string | null
  userId: string
}

interface Confession {
  _id: string
  text: string
  likes: number
  dislikes: number
  timestamp: string
  isAnonymous: boolean
  author: string | null
  userId: string
  likedBy: string[]
  dislikedBy: string[]
  replies: Reply[]
}

// Helper function for consistent date formatting
const formatDate = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0] + ' ' + 
         date.toISOString().split('T')[1].substring(0, 8);
};

export default function ConfessionsPage() {
  const [confessions, setConfessions] = useState<Confession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [newConfession, setNewConfession] = useState("")
  const [isAnonymous, setIsAnonymous] = useState(true)
  const [replyText, setReplyText] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [showRepliesFor, setShowRepliesFor] = useState<string | null>(null)
  const [isReplyAnonymous, setIsReplyAnonymous] = useState(true)
  const socketRef = useRef<Socket | null>(null)
  const currentUser = "Student123"
  const [charactersRemaining, setCharactersRemaining] = useState(500)
  const [userId, setUserId] = useState("")
  const [isClient, setIsClient] = useState(false)
  const [moderationError, setModerationError] = useState<string | null>(null);
  const [moderationReason, setModerationReason] = useState<string | null>(null);
  const [replyModerationError, setReplyModerationError] = useState<string | null>(null);
  const [replyModerationReason, setReplyModerationReason] = useState<string | null>(null);
  
  // useEffect for set client-side state
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  useEffect(() => {
    if (!isClient) return;
    
    // Get user ID safely
    const storedUserId = localStorage.getItem('userId')
    if (storedUserId) {
      setUserId(storedUserId)
    } else {
      // more stable ID generation method
      const newUserId = 'user_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 5)
      localStorage.setItem('userId', newUserId)
      setUserId(newUserId)
    }
    
    // Connect to socket server
    const socketUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
    const socket = io(socketUrl);
    socketRef.current = socket
    
    // Socket event listeners
    socket.on('connect', () => {
      console.log('Connected to WebSocket server')
    })
    
  
    socket.on('newConfession', (confession: Confession) => {
      setConfessions(prevConfessions => [confession, ...prevConfessions]); // Add new confession to the top
    });
  
    socket.on('confessionUpdated', (updatedConfession: Confession) => {
      setConfessions(prevConfessions => 
        prevConfessions.map(confession => 
          confession._id === updatedConfession._id ? updatedConfession : confession
        )
      );
    });
  
    socket.on('newReply', ({ confessionId, reply }: { confessionId: string, reply: Reply }) => {
      setConfessions(prevConfessions => 
        prevConfessions.map(confession => {
          if (confession._id === confessionId) {
            return {
              ...confession,
              replies: [...confession.replies, reply]
            };
          }
          return confession;
        })
      );
    })
    
    // Load initial confessions
    loadConfessions()
    
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [isClient]);
  
  const loadConfessions = async () => {
    try {
      setIsLoading(true)
      const data = await confessionApi.getAllConfessions()
      console.log("API response:", data);
      setConfessions(data || []);
    } catch (error) {
      toast.error('Failed to load confessions')
      console.error('Error loading confessions:', error)
      setConfessions([]);
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModerationError(null);
    setModerationReason(null);
  
    if (newConfession.trim()) {
      try {
        const newConfessionData = {
          text: newConfession,
          isAnonymous,
          author: isAnonymous ? null : currentUser
        };
        const response = await confessionApi.createConfession(newConfessionData);
  
        // Emit the new confession to WebSocket for others to see
        socketRef.current?.emit('newConfession', response.data); // Emit to update all clients
  
        setNewConfession("");
        setCharactersRemaining(500);
        toast.success('Confession posted successfully!');
      } catch (error: any) {
        if (error.response && error.response.data) {
          setModerationError(error.response.data.message || 'Failed to post confession');
          setModerationReason(error.response.data.reason || null);
          toast.error('Content moderation issue');
        } else {
          toast.error('Failed to post confession');
          console.error('Error posting confession:', error);
        }
      }
    }
  };
  
  
  const handleReplySubmit = async (confessionId: string) => {
    if (!replyText.trim()) return;
  
    setReplyModerationError(null);
    setReplyModerationReason(null);
  
    try {
      const replyData = {
        text: replyText,
        isAnonymous: isReplyAnonymous,
        author: isReplyAnonymous ? null : currentUser,
      };
  
      const response = await confessionApi.addReply(confessionId, replyData);
  
      if (response.status === 200) {
        // Emit the new reply for real-time updates
        socketRef.current?.emit('newReply', { confessionId, reply: response.data });
  
        // Update the local state for the confession
        setConfessions(prevConfessions => prevConfessions.map(confession => 
          confession._id === confessionId
            ? { ...confession, replies: [...confession.replies, response.data] }
            : confession
        ));
  
        setReplyText("");
        toast.success("Reply posted successfully!");
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        const errorMessage = error.response.data.message || "Failed to post reply";
        const errorReason = error.response.data.reason || "Inappropriate content";
  
        toast.error(errorMessage);
        setReplyModerationError(errorMessage);
        setReplyModerationReason(errorReason);
      } else {
        toast.error("Failed to post reply");
        console.error("Error posting reply:", error);
      }
    }
  };
  
  
  
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value
    if (text.length <= 500) {
      setNewConfession(text)
      setCharactersRemaining(500 - text.length)
    }
  }
  
  const handleLike = async (id: string) => {
    try {
      await confessionApi.likeConfession(id)
      socketRef.current?.emit('confessionUpdated', { confessionId: id, type: 'like' }) // Emit updated state for all clients
      // Update the local state of the confession
      setConfessions(prevConfessions => prevConfessions.map(confession => 
        confession._id === id ? { ...confession, likes: confession.likes + 1 } : confession
      ));
    } catch (error) {
      toast.error('Failed to like confession');
      console.error('Error liking confession:', error);
    }
  }
  
  const handleDislike = async (id: string) => {
    try {
      await confessionApi.dislikeConfession(id)
      socketRef.current?.emit('confessionUpdated', { confessionId: id, type: 'dislike' }) // Emit updated state for all clients
      // Update the local state of the confession
      setConfessions(prevConfessions => prevConfessions.map(confession => 
        confession._id === id ? { ...confession, dislikes: confession.dislikes + 1 } : confession
      ));
    } catch (error) {
      toast.error('Failed to dislike confession');
      console.error('Error disliking confession:', error);
    }
  }
  
  const isLikedByUser = (confession: Confession) => {
    return confession.likedBy.includes(userId)
  }
  
  const isDislikedByUser = (confession: Confession) => {
    return confession.dislikedBy.includes(userId)
  }
  
  const toggleReplySection = (confessionId: string) => {
    if (replyingTo === confessionId) {
      setReplyingTo(null)
    } else {
      setReplyingTo(confessionId)
    }
    
    setShowRepliesFor(showRepliesFor === confessionId ? null : confessionId)
  }
  
  // During SSR or loading, show a simple loading message with background effects
  if (!isClient || isLoading) {
    return (
      <div className="min-h-screen font-mono bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
          {/* Background pattern */}
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_500px_at_50%_20%,rgba(172,224,249,0.2),transparent)]"></div>
          <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-300 mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
          <div className="absolute bottom-1/4 left-1/3 w-96 h-96 rounded-full bg-indigo-300 mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>
        <div className="max-w-4xl mx-auto relative z-10 py-8 px-4 flex items-center justify-center min-h-screen">
          <div className="text-blue-900 text-xl font-semibold animate-pulse">Loading confessions...</div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen font-mono bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0 opacity-30">
        {/* Animated Floating Circles */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-300 mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute top-3/4 right-1/3 w-80 h-80 rounded-full bg-indigo-300 mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/3 left-2/3 w-72 h-72 rounded-full bg-purple-300 mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
        
        {/* Radial Gradient */}
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_800px_at_50%_20%,rgba(172,224,249,0.3),transparent)]"></div>
        
        {/* Subtle Grid Pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>
      
      {/* Content */}
      <div className="max-w-4xl mx-auto relative z-10 py-8 px-4">
        <Card className="mb-8 border-blue-200 bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-blue-200/30">
          <CardHeader className="border-b border-blue-100">
            <CardTitle className="text-blue-900 flex items-center">
              <span className="mr-2">📝</span> Public Confessions
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit}>
              <div className="mb-4 relative">
                <Textarea
                  placeholder="Share your thoughts anonymously..."
                  value={newConfession}
                  onChange={handleTextChange}
                  className="min-h-[120px] border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white/90 backdrop-blur-sm transition-all duration-200 focus:shadow-md"
                />
                <div className="absolute bottom-2 right-2 text-sm text-blue-400">
                  {charactersRemaining} characters remaining
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={isAnonymous}
                    onCheckedChange={setIsAnonymous}
                    id="anonymous-mode"
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <label
                    htmlFor="anonymous-mode"
                    className="text-sm font-medium text-blue-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Submit Anonymously
                  </label>
                </div>
                <Button 
                  type="submit" 
                  className="bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                >
                  Submit Confession
                </Button>
              </div>
            </form>
            
            {moderationError && (
              <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Confession Rejected</AlertTitle>
                <AlertDescription>
                  {moderationError}
                  {moderationReason && (
                    <div className="mt-2 text-sm opacity-80">
                      Reason: {moderationReason}
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
        
        <h2 className="text-2xl font-semibold mt-8 mb-4 text-blue-900 pl-2 border-l-4 border-blue-600">Recent Confessions</h2>
        
        <div className="space-y-4">
          {confessions && confessions.length > 0 ? confessions.map((confession, index) => (
            <Card 
              key={confession._id} 
              className={`border-blue-200 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 transform hover:-translate-y-1 ${index % 2 === 0 ? 'bg-gradient-to-r from-white/80 to-blue-50/80' : 'bg-gradient-to-r from-white/80 to-indigo-50/80'}`}
            >
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 mb-2">
                  {confession.isAnonymous ? (
                    <div className="flex items-center gap-1 text-blue-600">
                      <UserX className="h-4 w-4" />
                      <span className="text-sm">Anonymous User</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-blue-800">
                      <UserCircle className="h-4 w-4" />
                      <span className="text-sm">{confession.author}</span>
                    </div>
                  )}
                  <span className="text-sm text-blue-400 ml-auto">
                    {formatDate(confession.timestamp)}
                  </span>
                </div>
                
                <p className="mb-4 text-blue-900 bg-blue-50/50 p-3 rounded-md border-l-2 border-blue-300">{confession.text}</p>
                
                <div className="flex items-center gap-4">
                  <Button
                    variant={isLikedByUser(confession) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleLike(confession._id)}
                    className={`flex items-center gap-2 transition-all duration-200 ${isLikedByUser(confession) ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'text-blue-800 hover:text-blue-900 hover:bg-blue-100'}`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span>{confession.likes}</span>
                  </Button>
                  
                  <Button
                    variant={isDislikedByUser(confession) ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleDislike(confession._id)}
                    className={`flex items-center gap-2 transition-all duration-200 ${isDislikedByUser(confession) ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm' : 'text-blue-800 hover:text-blue-900 hover:bg-blue-100'}`}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    <span>{confession.dislikes}</span>
                  </Button>
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleReplySection(confession._id)}
                    className={`flex items-center gap-2 text-blue-800 hover:text-blue-900 hover:bg-blue-100 transition-all duration-200 ${showRepliesFor === confession._id ? 'bg-blue-100' : ''}`}
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Reply{confession.replies && confession.replies.length > 0 ? ` (${confession.replies.length})` : ""}</span>
                  </Button>
                </div>
                
                {/* Reply Form */}
                {replyingTo === confession._id && (
                  <div className="mt-4 pl-4 border-l-2 border-blue-200 animate-fadeIn">
                    <div className="mb-4">
                    <Textarea
                      placeholder="Add a reply..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[100px] border-blue-200 focus:border-blue-400 focus:ring-blue-300 bg-white/90 backdrop-blur-sm transition-all duration-200 focus:shadow-md"
                    />
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={isReplyAnonymous}
                          onCheckedChange={setIsReplyAnonymous}
                          id={`reply-anonymous-${confession._id}`}
                          className="data-[state=checked]:bg-blue-600"
                        />
                        <label
                          htmlFor={`reply-anonymous-${confession._id}`}
                          className="text-sm font-medium text-blue-800 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Submit Anonymously
                        </label>
                      </div>
                      <Button 
                        onClick={() => handleReplySubmit(confession._id)} 
                        className="bg-blue-700 hover:bg-blue-800 shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-1"
                      >
                        Submit Reply
                      </Button>
                    </div>
                    
                    {replyModerationError && (
                      <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Reply Rejected</AlertTitle>
                        <AlertDescription>
                          {replyModerationError}
                          {replyModerationReason && (
                            <div className="mt-2 text-sm opacity-80">
                              Reason: {replyModerationReason}
                            </div>
                          )}
                        </AlertDescription>
                      </Alert>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Replies List */}
                {showRepliesFor === confession._id && confession.replies && confession.replies.length > 0 && (
                  <div className="mt-4 pl-4 border-l-2 border-blue-200 space-y-3 animate-fadeIn">
                    <h4 className="font-medium text-sm mb-2 text-blue-800">Replies ({confession.replies.length})</h4>
                    {confession.replies.map((reply) => (
                      <div key={reply._id} className="bg-blue-50/70 p-3 rounded-md border border-blue-100 hover:shadow-sm transition-all duration-200 hover:bg-blue-50/90">
                        <div className="flex items-center gap-2 mb-1">
                          {reply.isAnonymous ? (
                            <div className="flex items-center gap-1 text-blue-600">
                              <UserX className="h-4 w-4" />
                              <span className="text-sm">Anonymous User</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 text-blue-800">
                              <UserCircle className="h-4 w-4" />
                              <span className="text-sm">{reply.author}</span>
                            </div>
                          )}
                          <span className="text-sm text-blue-400 ml-auto">
                            {formatDate(reply.timestamp)}
                          </span>
                        </div>
                        <p className="text-sm text-blue-900">{reply.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )) : (
            <div className="text-center p-8 bg-white/80 backdrop-blur-sm rounded-lg shadow border border-blue-100 text-blue-800">
              <div className="mb-4 text-6xl">💭</div>
              <h3 className="text-xl font-medium mb-2">No confessions yet</h3>
              <p>Be the first to share your thoughts!</p>
            </div>
          )}
        </div>
      </div>

    
    </div>
  )
}