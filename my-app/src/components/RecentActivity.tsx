import { useState, useEffect } from "react";

export interface Activity {
  _id: string;
  type: "journal" | "quiz" | "confession";
  title: string;
  description?: string;
  timestamp: string;
  userId: string;
}

export default function RecentActivity() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/recent-activities");
        if (!response.ok) throw new Error("Failed to fetch activities");
        const data = await response.json();
        setActivities(data);
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
    const interval = setInterval(fetchActivities, 5 * 60 * 1000); // Refresh every 5 minutes
    return () => clearInterval(interval);
  }, []);

  if (loading) return <p>Loading...</p>;

  // Sort the activities based on the timestamp (date and time)
  const sortedActivities = [...activities].sort((a, b) => {
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(); // Sort by date and time (descending)
  });

  return (
    <div>
      {activities.length === 0 ? (
        <p>No recent activity found.</p>
      ) : (
        <ul>
          {sortedActivities.map((activity) => (
            <li key={activity._id}>
              <strong>{activity.type.toUpperCase()}:</strong>
              <span style={{ fontSize: '12px' }}>{activity.title}</span> <br />
              <small>{new Date(activity.timestamp).toLocaleString()}</small><br />
              <hr />
              <br />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
