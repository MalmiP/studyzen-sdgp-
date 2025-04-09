import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useSpring, animated } from 'react-spring'; // For animations

interface StudyTimeChartProps {
  userId: string;
}

const StudyTimeChart = ({ userId }: StudyTimeChartProps) => {
  const [studyData, setStudyData] = useState<any[]>([]);
  const [totalStudyTime, setTotalStudyTime] = useState<number>(0); // To keep track of total study time in seconds
  const [motivationMessage, setMotivationMessage] = useState<string>(''); // To store motivation message

  useEffect(() => {
    // Fetch study session data from the API
    const fetchStudyData = async () => {
      const res = await fetch(`/api/study-sessions?userId=${userId}`); // Use dynamic userId
      const data = await res.json();

      // Calculate the total study time
      const totalTime = data.reduce((total: number, session: any) => total + session.totalStudyTime, 0);
      setTotalStudyTime(totalTime); // Update total study time
      setStudyData(data); // Set the fetched data for the chart
    };

    fetchStudyData();
  }, [userId]);

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

  // Chart data formatting
  const chartData = studyData.map((session) => ({
    name: session.date,
    hours: session.totalStudyTime / 3600, // Convert seconds to hours
  }));

  return (
    <div>
      <h3>Total Study Time: {totalStudyTime / 3600} hours</h3>
      <p>{motivationMessage}</p>
      <button onClick={addStudySession}>Add 1 Hour Study Session</button>

      <div style={{ width: '100%', height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
            <XAxis dataKey="name" tick={{ fill: '#3b82f6' }} />
            <YAxis tick={{ fill: '#3b82f6' }} />
            <Tooltip contentStyle={{ backgroundColor: '#eff6ff', borderColor: '#93c5fd', fontFamily: 'monospace' }} />
            {/* Apply animation to only strokeDashoffset */}
            <Line
              dataKey="hours"
              stroke="#2563eb"
              strokeWidth={2}
              dot={{ fill: '#1e40af', stroke: '#2563eb', strokeWidth: 2, r: 4 }}
              activeDot={{ fill: '#1e40af', stroke: '#2563eb', strokeWidth: 2, r: 6 }}
              strokeDasharray="5 5" // Optional: Add dashed stroke for better animation effect
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StudyTimeChart;
