"use client";
import { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, BookOpen, Flame} from 'lucide-react';
import axios from 'axios';
import StudyTimer from '@/components/StudyTimer';
import StudyTimeChart from "@/components/StudyTimeChart";
import  RecentActivity  from '@/components/RecentActivity';

const userId = "user123";

interface DashboardStats {
  streak: {
    days: number;
    message: string;
  };
}

interface Activity {
  _id: string;
  type: string;
  title: string;
}

interface ProgressData {
  labels: string[];
  data: number[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [activities, setActivities] = useState([]);
  const [quizCount, setQuizCount] = useState(null);
  const [error, setError] = useState<string | null>(null);
  

    const fetchDashboardData = async () => {
      try {
        const [statsRes, activitiesRes, progressRes] = await Promise.all([
          axios.get('http://localhost:3001/api/dashboard/stats'),
          axios.get('http://localhost:3001/api/dashboard/activities'),
          axios.get('http://localhost:3001/api/dashboard/progress')
        ]);
        setStats(statsRes.data);
        setActivities(activitiesRes.data);
        setProgress(progressRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

  
  const fetchAllQuizzesCount = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/quizzes/count-quizzes');
      const data = await response.json();
      setQuizCount(data);
    } catch (error) {
      console.error('Error fetching Quizzes count:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
    fetchAllQuizzesCount()
  }, []);


  if (!stats) return <div className="min-h-screen bg-blue-50 font-mono flex items-center justify-center text-blue-800">Loading...</div>;

  const chartData = progress?.labels.map((label, index) => ({
    name: label,
    hours: progress.data[index],
  }));

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };
  
  return (
    <div className="min-h-screen bg-blue-50 font-mono">
    <div className="max-w-4xl mx-auto relative z-10 p-8 space-y-8">
      <h1 className="text-4xl font-bold text-blue-900">Welcome to StudyZen!</h1>

      <div className="grid grid-cols-1 md:grid-cols-1 gap-3 items-start">
        <Card className="p-6 border-blue-200">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-800">Study Timer</h3>
          </div>
          <br />
          <div className="flex justify-center">
            <StudyTimer userId={userId} />
          </div>
          <br />
        </Card>

        <div className="mt-6">
        <StudyTimeChart userId={userId} />
        </div>

        <Card className="p-6 border-blue-200">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-5 w-5 text-blue-600" />
            <h3 className="text-sm font-medium text-blue-800">Quizzes Completed</h3>
          </div>

          <div>
            {error && <p>{error}</p>}
            {quizCount !== null ? (
              <p>Quizzes This Week: {quizCount}</p>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="col-span-2 p-6 border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Weekly Progress</h2>
          <div className="h-[300px]">
            {chartData && (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="name" tick={{ fill: '#3b82f6' }} />
                  <YAxis tick={{ fill: '#3b82f6' }} />
                  <Tooltip contentStyle={{ backgroundColor: '#eff6ff', borderColor: '#93c5fd', fontFamily: 'monospace' }} />
                  <Line
                    type="monotone"
                    dataKey="hours"
                    stroke="#2563eb"
                    strokeWidth={2}
                    dot={{ fill: '#1e40af', stroke: '#2563eb', strokeWidth: 2, r: 4 }}
                    activeDot={{ fill: '#1e40af', stroke: '#2563eb', strokeWidth: 2, r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </Card>

        <Card className="p-6 border-blue-200">
          <h2 className="text-xl font-semibold mb-4 text-blue-900">Recent Activity</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4"></div>
          <div>
            <RecentActivity />
          </div>
        </Card>
      </div>
    </div>
  </div>
);
}