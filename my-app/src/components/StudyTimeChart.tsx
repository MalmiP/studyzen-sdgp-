import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSpring, animated } from 'react-spring'; // For animations

interface StudyTimeChartProps {
  userId: string;
}

const StudyTimeChart = () => {
  const [studyData, setStudyData] = useState<any[]>([]);
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0); // To keep track of total study time in seconds
  const [motivationMessage, setMotivationMessage] = useState<string>(''); // To store motivation message

  useEffect(() => {
    // Fetch study session data from the API
    const fetchStudyData = async () => {
      const res = await fetch('/api/study-sessions?userId=user123'); // replace 'user123' with dynamic user ID if needed
      const data = await res.json();

      // Calculate the total study time
      const totalTime = data.reduce((total: number, session: any) => total + session.totalStudyTime, 0);
      setTotalStudyTime(totalTime); // Update total study time
      setStudyData(data); // Set the fetched data for the chart
    };

    fetchStudyData();
  }, []);

  // Define animation for the line chart
  const lineAnimation = useSpring({
    from: { strokeDashoffset: 500 }, // Initial hidden state
    to: { strokeDashoffset: 0 },    // End state fully visible
    config: { tension: 120, friction: 40 }, // Animation speed & smoothness
  });

  // Function to handle adding a new study session
  const addStudySession = async () => {
    const newSession = {
      date: new Date().toISOString(),
      totalStudyTime: 3600, // Simulate adding 1 hour of study time (in seconds)
    };

    // Update the study data and total time
    setStudyData((prevData) => [newSession, ...prevData]);
    setTotalStudyTime((prevTime) => prevTime + newSession.totalStudyTime); // Add new session time to the total

    // Determine motivation message based on total study time
    let message = '';
    const totalHours = totalStudyTime / 3600;

    if (totalHours < 5) {
      message = 'Keep going! You’re doing great!';
    } else if (totalHours < 10) {
      message = 'Awesome work! Keep it up!';
    } else {
      message = 'Incredible! You’re on fire!';
    }
    setMotivationMessage(message); // Set the motivation message

    // Optionally, send the new session to the server
    await fetch('/api/add-study-session', {
      method: 'POST',
      body: JSON.stringify(newSession),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  
};

export default StudyTimeChart;


