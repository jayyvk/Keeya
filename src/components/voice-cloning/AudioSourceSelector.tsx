import React, { useRef } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Recording } from "@/types";
import { Plus, Check, Upload } from "lucide-react";
import VoiceSourceSearch from "./VoiceSourceSearch";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { processAndUploadFile, uploadToVault } from "@/utils/audioUpload";

interface AudioSourceSelectorProps {
  recordings: Recording[];
  selectedRecordings: Recording[];
  onSelectRecording: (recording: Recording) => void;
  isMobile?: boolean;
}

const AudioSourceSelector: React.FC<AudioSourceSelectorProps> = ({
  recordings,
  selectedRecordings,
  onSelectRecording,
  isMobile = false
}) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Format seconds to MM:SS without decimal places
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const handleUploadClick = () => {
    toast({
      title: "Coming Soon",
      description: "Audio and video upload will be available soon!",
    });
  };
  
  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Functionality disabled
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const filteredRecordings = React.useMemo(() => {
    return recordings.filter(recording => recording.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [recordings, searchQuery]);

  return <div className="border rounded-lg bg-white overflow-hidden">
      <div className="p-4 border-b">
        <VoiceSourceSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>

      <ScrollArea className="h-[400px]">
        <div className={`flex ${isMobile ? 'flex-wrap' : ''} gap-3 p-4`}>
          <input 
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="audio/*,video/*"
            onChange={handleFileChange}
            disabled
          />
          <div 
            className={`${isMobile ? 'w-full' : 'min-w-[180px]'} h-[120px] rounded-lg border-2 border-dashed border-gray-300 bg-gray-100 flex flex-col items-center justify-center opacity-50 cursor-not-allowed`} 
          >
            <Upload className="h-8 w-8 text-gray-500 mb-2" />
            <span className="text-sm text-gray-500">Upload Audio/Video</span>
            <span className="text-xs text-gray-400 mt-1">(Coming Soon)</span>
          </div>
          
          {filteredRecordings.map(recording => {
          const isSelected = selectedRecordings.some(r => r.id === recording.id);
          return <div key={recording.id} onClick={() => onSelectRecording(recording)} className={`relative ${isMobile ? 'w-full' : 'min-w-[180px]'} h-[120px] rounded-lg overflow-hidden cursor-pointer transition-all ${isSelected ? 'ring-2 ring-voicevault-primary shadow-lg' : 'hover:shadow-md'}`}>
                <div className="cassette-header h-full flex flex-col justify-between p-3">
                  <div className="flex justify-between">
                    <h4 className="font-medium text-sm truncate max-w-[80%] text-voicevault-neutralgray">
                      {recording.title}
                    </h4>
                    {isSelected && <span className="bg-white rounded-full p-1">
                        <Check className="h-3 w-3 text-voicevault-primary" />
                      </span>}
                  </div>
                  <div className="flex justify-between items-end">
                    <span className="text-xs text-voicevault-neutralgray">
                      {formatTime(recording.duration)}
                    </span>
                  </div>
                </div>
              </div>;
        })}
          
          {filteredRecordings.length === 0 && <div className={`${isMobile ? 'w-full' : 'min-w-[180px]'} h-[120px] rounded-lg border border-voicevault-softpurple bg-voicevault-softgray/30 flex flex-col items-center justify-center`}>
              <span className="text-sm text-gray-500 text-center px-4">
                {searchQuery ? "No matching recordings found" : "No recordings in your vault. Record some memories first!"}
              </span>
            </div>}
        </div>
      </ScrollArea>
    </div>;
};

export default AudioSourceSelector;
