
import React from 'react';
import { Calendar, Tag } from 'lucide-react';
import { Badge } from "@/components/ui/badge";

interface CardInfoProps {
  createdAt: Date;
  tags?: string[];
}

const CardInfo = ({ createdAt, tags }: CardInfoProps) => {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm text-gray-600">
        <div className="flex items-center">
          <Calendar size={14} className="mr-1" />
          <span>{createdAt.toLocaleDateString()}</span>
        </div>
      </div>
      
      <div className="mt-2 flex items-center text-xs text-gray-500">
        <Tag size={12} className="mr-1" />
        <span>{tags?.length > 0 ? 'Tags:' : 'No tags'}</span>
      </div>
      
      {tags?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {tags.map(tag => (
            <Badge 
              key={tag} 
              variant="outline"
              className="text-xs bg-voicevault-softgray text-voicevault-secondary"
            >
              {tag}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default CardInfo;
