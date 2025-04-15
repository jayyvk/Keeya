import React, { useState, useRef, useCallback } from "react";
import { Recording } from "@/types";
import VoiceMemoryCard from "./VoiceMemoryCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface AudioVaultProps {
  recordings: Recording[];
}

const AudioVault: React.FC<AudioVaultProps> = ({ recordings }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const vaultRef = useRef<HTMLDivElement>(null);

  // Get all unique tags from recordings
  const allTags = useCallback(() => {
    const tagsSet = new Set<string>();
    recordings.forEach(recording => {
      recording.tags.forEach(tag => tagsSet.add(tag));
    });
    return Array.from(tagsSet);
  }, [recordings]);

  // Filter recordings based on search query and selected tags
  const filteredRecordings = recordings.filter(recording => {
    const matchesSearch = searchQuery === "" || 
      recording.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTags = selectedTags.length === 0 || 
      selectedTags.every(tag => recording.tags.includes(tag));
    
    return matchesSearch && matchesTags;
  });

  // Toggle tag selection
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(prev => prev.filter(t => t !== tag));
    } else {
      setSelectedTags(prev => [...prev, tag]);
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setSelectedTags([]);
  };

  // Toggle vault open/close
  const toggleVault = () => {
    setIsOpen(prev => !prev);
  };

  return (
    <div 
      ref={vaultRef}
      className={`fixed bottom-0 left-0 right-0 bg-white rounded-t-large shadow-lg transition-transform duration-300 transform ${
        isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-60px)]'
      } max-h-[80vh] overflow-hidden z-10`}
    >
      {/* Vault Header / Pull Tab */}
      <div 
        className="px-4 py-3 bg-gradient-to-r from-voicevault-primary to-voicevault-secondary cursor-pointer flex items-center justify-between"
        onClick={toggleVault}
      >
        <h2 className="text-white font-medium">Your Voice Memories</h2>
        <ChevronUp 
          className={`text-white transition-transform ${isOpen ? 'rotate-180' : 'rotate-0'}`}
        />
      </div>
      
      {/* Search and Filters */}
      <div className="p-4 border-b">
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search recordings..."
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-2.5"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        
        {/* Tags Filter */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {allTags().map(tag => (
            <Badge
              key={tag}
              variant={selectedTags.includes(tag) ? "default" : "outline"}
              className={`cursor-pointer ${
                selectedTags.includes(tag) 
                  ? "bg-voicevault-primary text-white"
                  : "bg-transparent hover:bg-voicevault-softpurple"
              }`}
              onClick={() => toggleTag(tag)}
            >
              {tag}
            </Badge>
          ))}
        </div>
        
        {/* Clear Filters */}
        {(searchQuery || selectedTags.length > 0) && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={clearFilters}
            className="text-xs text-gray-500"
          >
            Clear filters
          </Button>
        )}
      </div>
      
      {/* Recordings List */}
      <div 
        className="overflow-y-auto p-4 space-y-4 scrollbar-hide" 
        style={{ 
          maxHeight: "calc(80vh - 150px)",
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {filteredRecordings.length > 0 ? (
          filteredRecordings.map(recording => (
            <VoiceMemoryCard key={recording.id} recording={recording} />
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">
            {recordings.length > 0 
              ? "No recordings match your search"
              : "Your vault is empty. Start recording to add memories!"}
          </div>
        )}
      </div>
    </div>
  );
};

export default AudioVault;
