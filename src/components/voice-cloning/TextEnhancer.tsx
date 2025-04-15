
import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Wand2, 
  Loader2, 
  MessagesSquare, 
  Heart, 
  Cake, 
  BookOpen,
  Gift 
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TextEnhancerProps {
  inputText: string;
  enhancedText: string;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onEnhance: () => void;
  isEnhancing: boolean;
}

const TextEnhancer: React.FC<TextEnhancerProps> = ({
  inputText,
  enhancedText,
  onTextChange,
  onEnhance,
  isEnhancing
}) => {
  const [activeTab, setActiveTab] = useState("input");
  
  const examples = [
    { icon: <Heart size={12} />, text: "I love you and I'll always be with you" },
    { icon: <Cake size={12} />, text: "Happy birthday! I wish I could be there to celebrate with you" },
    { icon: <BookOpen size={12} />, text: "Let me tell you a bedtime story about a brave little rabbit" },
    { icon: <Gift size={12} />, text: "Congratulations on your graduation! I'm so proud of you" },
    { icon: <MessagesSquare size={12} />, text: "I just wanted to check in and see how you're doing" }
  ];
  
  const handleExampleClick = (example: string) => {
    // Create a synthetic event to simulate onChange
    const event = {
      target: { value: example },
      preventDefault: () => {},
    } as React.ChangeEvent<HTMLTextAreaElement>;
    
    onTextChange(event);
  };
  
  // Switch to enhanced tab when enhancement is complete
  React.useEffect(() => {
    if (enhancedText && !isEnhancing) {
      setActiveTab("enhanced");
    }
  }, [enhancedText, isEnhancing]);
  
  return (
    <div>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="input">Original</TabsTrigger>
          <TabsTrigger value="enhanced" disabled={!enhancedText && !isEnhancing}>
            Enhanced
            {isEnhancing && <Loader2 className="ml-2 h-3 w-3 animate-spin" />}
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="input" className="space-y-4">
          <Textarea
            placeholder="Enter what you'd like this voice to say..."
            className="min-h-[120px] shadow-inner bg-voicevault-softgray/20 border-voicevault-softpurple/50 focus:border-voicevault-primary"
            value={inputText}
            onChange={onTextChange}
          />
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs text-gray-500 mt-1 mr-1">Examples:</span>
            {examples.map((example, index) => (
              <Badge
                key={index}
                variant="outline"
                className="cursor-pointer bg-voicevault-softgray/30 hover:bg-voicevault-softgray/50 text-voicevault-tertiary"
                onClick={() => handleExampleClick(example.text)}
              >
                {example.icon}
                <span className="ml-1">{example.text.substring(0, 15)}...</span>
              </Badge>
            ))}
          </div>
          
          <div className="flex justify-end">
            <Button 
              onClick={onEnhance} 
              disabled={!inputText.trim() || isEnhancing}
              className="bg-voicevault-softpeach text-voicevault-tertiary hover:bg-voicevault-softpeach/80"
            >
              {isEnhancing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Enhance with AI
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="enhanced" className="space-y-4">
          <Textarea
            className="min-h-[120px] shadow-inner bg-voicevault-softgray/10 border-voicevault-primary/30 text-voicevault-tertiary"
            value={enhancedText}
            readOnly
          />
          
          <div className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setActiveTab("input")}
              className="text-voicevault-tertiary"
            >
              Edit Original
            </Button>
            
            <p className="text-xs text-gray-500 flex items-center">
              <Wand2 className="mr-1 h-3 w-3" />
              Enhanced with AI
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TextEnhancer;
