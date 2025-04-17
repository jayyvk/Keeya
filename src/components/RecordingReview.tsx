import React, { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, Save, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface RecordingReviewProps {
  recordingBlob: Blob;
  duration: number;
  onSave: (title: string, tags: string[]) => void;
  onDiscard: () => void;
  className?: string;
}

const RecordingReview: React.FC<RecordingReviewProps> = ({
  recordingBlob,
  duration,
  onSave,
  onDiscard,
  className
}) => {
  const [title, setTitle] = useState<string>("");
  const [currentTag, setCurrentTag] = useState<string>("");
  const [tags, setTags] = useState<string[]>([]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrl = useRef<string>("");
  
  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  useEffect(() => {
    audioUrl.current = URL.createObjectURL(recordingBlob);
    return () => {
      URL.revokeObjectURL(audioUrl.current);
    };
  }, [recordingBlob]);

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags(prev => [...prev, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleAudioEnd = () => {
    setIsPlaying(false);
  };

  useEffect(() => {
    const now = new Date();
    setTitle(`Recording ${now.toLocaleDateString()}`);
  }, []);

  const suggestedTags = ["Family", "Story", "Memory", "Personal", "Important"];

  return (
    <div className={`bg-white p-6 rounded-lg shadow-lg w-full max-w-md animate-scale-in ${className || ''}`}>
      <h2 className="text-2xl font-semibold text-voicevault-tertiary mb-4">Save Your Recording</h2>
      
      <div className="mb-6">
        <audio 
          ref={audioRef}
          src={audioUrl.current}
          onEnded={handleAudioEnd}
          className="hidden"
        />
        <div className="flex items-center justify-between p-3 bg-voicevault-softgray rounded-lg">
          <span className="text-sm text-gray-600">{formatDuration(duration)}</span>
          <button
            onClick={togglePlayback}
            className="rounded-full p-2 bg-voicevault-primary text-white hover:bg-voicevault-secondary transition-colors"
          >
            {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          </button>
        </div>
      </div>
      
      <div className="mb-4">
        <Label htmlFor="title" className="block mb-2 text-sm font-medium">
          Title
        </Label>
        <Input
          id="title"
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Name your recording"
          className="w-full"
        />
      </div>
      
      <div className="mb-6">
        <Label htmlFor="tags" className="block mb-2 text-sm font-medium">
          Tags
        </Label>
        <div className="flex gap-2 mb-2">
          <Input
            id="tags"
            value={currentTag}
            onChange={e => setCurrentTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            placeholder="Add tags and press Enter"
            className="flex-1"
          />
          <Button onClick={addTag} variant="outline" type="button">
            Add
          </Button>
        </div>
        
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <Badge 
                key={tag} 
                variant="outline"
                className="bg-voicevault-softpurple text-voicevault-tertiary flex items-center gap-1"
              >
                {tag}
                <button onClick={() => removeTag(tag)} className="ml-1">
                  <X size={12} />
                </button>
              </Badge>
            ))}
          </div>
        )}
        
        <div className="mt-2">
          <p className="text-xs text-gray-500 mb-1">Suggested:</p>
          <div className="flex flex-wrap gap-1.5">
            {suggestedTags.map(tag => (
              <Badge 
                key={tag}
                variant="outline"
                className="bg-transparent hover:bg-voicevault-softpurple cursor-pointer"
                onClick={() => {
                  if (!tags.includes(tag)) {
                    setTags(prev => [...prev, tag]);
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
      
      <div className="flex justify-between gap-4">
        <Button 
          variant="outline" 
          onClick={onDiscard}
          className="flex-1 border-red-300 text-red-500 hover:bg-red-50"
        >
          Discard
        </Button>
        <Button 
          onClick={() => onSave(title, tags)}
          className="flex-1 bg-voicevault-primary hover:bg-voicevault-secondary text-white"
          disabled={!title.trim()}
        >
          <Save size={16} className="mr-2" />
          Save
        </Button>
      </div>
    </div>
  );
};

export default RecordingReview;
