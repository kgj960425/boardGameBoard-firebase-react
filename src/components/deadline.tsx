import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";
import "../components/deadline.css";

export const NopeTimerBar = ({ deadline }: { deadline: Timestamp | null }) => {
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!deadline) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const deadlineMs = deadline.toMillis();
      const remaining = Math.max(deadlineMs - now, 0);
      setTimeLeft(remaining);
    }, 100);

    return () => clearInterval(interval);
  }, [deadline]);

  const seconds = (timeLeft / 1000).toFixed(1);

  if (!deadline || timeLeft <= 0) return null;

  return (
    <div className="nope-timer-box">
      <div className="nope-timer-text">NOPE : {seconds}s</div>
      <div className="nope-timer-bar-wrapper">
        <div
          className="nope-timer-bar-fill"
          style={{ width: `${(timeLeft / 3000) * 100}%` }}
        />
      </div>
    </div>
  );
};
