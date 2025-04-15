
import React from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface VoiceSourceSearchProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
}

const VoiceSourceSearch: React.FC<VoiceSourceSearchProps> = ({ searchQuery, onSearchChange }) => {
  return (
    <div className="relative mb-4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
      <Input
        type="text"
        placeholder="Search voice sources..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="pl-10"
      />
    </div>
  );
};

export default VoiceSourceSearch;
