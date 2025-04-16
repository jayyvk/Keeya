import React from "react";
import { RecordingStatus } from "@/types";
interface RecordingTimerProps {
  status: RecordingStatus;
  time: number;
}
const RecordingTimer: React.FC<RecordingTimerProps> = ({
  status,
  time
}) => {
  // Format seconds to MM:SS
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Get status text based on recording status
  const getStatusText = (): string => {
    switch (status) {
      case "recording":
        return "Recording...";
      case "paused":
        return "Paused";
      case "reviewing":
        return "Review Recording";
      default:
        return "Ready to Record";
    }
  };

  // Get status color based on recording status
  const getStatusColor = (): string => {
    switch (status) {
      case "recording":
        return "text-red-500";
      case "paused":
        return "text-yellow-500";
      case "reviewing":
        return "text-blue-500";
      default:
        return "text-gray-500";
    }
  };
  return <div className="text-center mb-4">
      {status !== "inactive" && <div className="text-2xl font-mono mb-1">{formatTime(time)}</div>}
      
    </div>;
};
export default RecordingTimer;