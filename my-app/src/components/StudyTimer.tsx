import { useEffect, useState } from "react";

let timerInterval: NodeJS.Timeout | null = null; // Declare as a global variable

const StudyTimer = ({ userId }: { userId: string }) => {
  const [time, setTime] = useState<number>(() => {
    return Number(localStorage.getItem("studyTime")) || 0; // Initialize study time from localStorage
  });
  const [isRunning, setIsRunning] = useState<boolean>(() => {
    return localStorage.getItem("isRunning") === "true";
  });
  const [lastStudyTime, setLastStudyTime] = useState<number>(() => {
    return Number(localStorage.getItem("lastStudyTime")) || 0; // Initialize last study time from localStorage
  });
  const [totalStudyTime, setTotalStudyTime] = useState<number>(() => {
    return JSON.parse(localStorage.getItem("totalStudyTime") || "0") || 0; // Initialize total study time from localStorage
  });

  useEffect(() => {
    // Load total study time from localStorage when component mounts
    const storedTotalTime = JSON.parse(localStorage.getItem("totalStudyTime") || "0") || 0;
    setTotalStudyTime(storedTotalTime);
  }, []);

  useEffect(() => {
    // Start the timer if isRunning
    if (isRunning && !timerInterval) {
      timerInterval = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          localStorage.setItem("studyTime", newTime.toString()); // Save updated time
          return newTime;
        });
      }, 1000);
    }

    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null; // Reset the timer reference
      }
    };
  }, [isRunning]);

  useEffect(() => {
    localStorage.setItem("isRunning", isRunning.toString());
  }, [isRunning]);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  const handleStart = () => {
    setIsRunning(true);
  };

  const handleStop = async () => {
    setIsRunning(false);
    setLastStudyTime(time); // Update lastStudyTime when stopped

    // Calculate total study time
    const updatedTotalTime = totalStudyTime + time;

    // Save times to localStorage
    localStorage.setItem("lastStudyTime", time.toString());
    localStorage.setItem("totalStudyTime", JSON.stringify(updatedTotalTime)); // Update total time in localStorage

    // Save study time to the backend
    try {
      const response = await fetch("/api/study-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, studyTime: time }),
      });

      if (response.ok) {
        console.log("Study time saved successfully");
      } else {
        console.error("Failed to save study time");
      }
    } catch (error) {
      console.error("Error:", error);
    }

    setTime(0); // Reset timer after saving
    localStorage.removeItem("studyTime"); // Clear timer from localStorage
    localStorage.removeItem("isRunning"); // Clear running state from localStorage

    // Update the displayed total study time
    setTotalStudyTime(updatedTotalTime);
  };

  return (
    <div className="flex flex-col items-center space-y-2">
      <p className="text-xl font-semibold mb-4 text-blue-900">{formatTime(time)}</p>
      <div className="flex flex-col items-center space-y-2">
        <button 
          onClick={handleStart} 
          disabled={isRunning} 
          className="bg-blue-500 text-white w-40 h-10 rounded hover:bg-blue-700"
        >
          Start Learning
        </button>
        <button 
          onClick={handleStop} 
          disabled={!isRunning} 
          className="bg-red-500 text-white w-40 h-10 rounded hover:bg-red-500"
        >
          Stop Learning
        </button>
      </div>
      
      {lastStudyTime > 0 && (
        <p className="mt-4 text-gray-700">
          Last Studied: {formatTime(lastStudyTime)}
        </p>
      )}

      <p className="mt-4 text-blue-900 font-bold">
        Total Study: {formatTime(totalStudyTime)}
      </p>
    </div>
  );
};

export default StudyTimer;
