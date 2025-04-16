import React from "react";
import { Mic, MicOff, Pause, Play, StopCircle } from "lucide-react";
import { RecordingStatus } from "@/types";
interface RecordButtonProps {
  status: RecordingStatus;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
}
const RecordButton: React.FC<RecordButtonProps> = ({
  status,
  onStart,
  onStop,
  onPause,
  onResume
}) => {
  // Define button style based on recording status
  const getButtonStyle = () => {
    switch (status) {
      case "recording":
        return "bg-red-500 hover:bg-red-600 animate-pulse-recording";
      case "paused":
        return "bg-yellow-500 hover:bg-yellow-600";
      case "reviewing":
        return "bg-blue-500 hover:bg-blue-600";
      default:
        return "bg-voicevault-primary hover:bg-voicevault-secondary";
    }
  };

  // Define button icon based on recording status
  const getButtonIcon = () => {
    switch (status) {
      case "recording":
        return <Pause className="h-10 w-10 text-white" />;
      case "paused":
        return <Play className="h-10 w-10 text-white" />;
      case "reviewing":
        return <StopCircle className="h-10 w-10 text-white" />;
      default:
        return <Mic className="h-10 w-10 text-white" />;
    }
  };

  // Define button action based on recording status
  const handleClick = () => {
    switch (status) {
      case "recording":
        onPause();
        break;
      case "paused":
        onResume();
        break;
      case "reviewing":
        onStop();
        break;
      default:
        onStart();
        break;
    }
  };

  // Alternative controls for recording state
  const renderAlternativeControls = () => {
    if (status === "recording" || status === "paused") {
      return <button onClick={onStop} className="rounded-full p-4 bg-gray-200 hover:bg-gray-300 transition-colors" aria-label="Stop recording">
          <StopCircle className="h-8 w-8 text-red-500" />
        </button>;
    }
    return null;
  };
  return <div className="flex items-center justify-center gap-6 my-0">
      <button onClick={handleClick} className={`rounded-full p-6 transition-all shadow-lg ${getButtonStyle()}`} aria-label={`${status === "inactive" ? "Start" : status} recording`}>
        {getButtonIcon()}
      </button>
      {renderAlternativeControls()}
    </div>;
};
export default RecordButton;