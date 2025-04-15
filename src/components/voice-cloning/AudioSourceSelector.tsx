import React from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Recording } from "@/types";
import { Plus, Check } from "lucide-react";
import VoiceSourceSearch from "./VoiceSourceSearch";
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
  const filteredRecordings = React.useMemo(() => {
    return recordings.filter(recording => recording.title.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [recordings, searchQuery]);
  return <div className="border rounded-lg bg-white overflow-hidden">
      <div className="p-4 border-b">
        <VoiceSourceSearch searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      </div>

      <ScrollArea className="h-[400px]">
        <div className={`flex ${isMobile ? 'flex-wrap' : ''} gap-3 p-4`}>
          {/* Upload option */}
          <div className={`${isMobile ? 'w-full' : 'min-w-[180px]'} h-[120px] rounded-lg border-2 border-dashed border-voicevault-softpurple bg-voicevault-softgray/30 flex flex-col items-center justify-center cursor-pointer hover:bg-voicevault-softgray/50 transition-colors`} onClick={() => alert("Upload functionality would be implemented here")}>
            <Plus className="h-8 w-8 text-voicevault-primary mb-2" />
            <span className="text-sm text-voicevault-tertiary">Upload Audio</span>
          </div>
          
          {/* Recordings from vault */}
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
                      {Math.floor(recording.duration / 60)}:{(recording.duration % 60).toString().padStart(2, '0')}
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