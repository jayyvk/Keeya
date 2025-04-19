
import React from "react";
import { useNavigate } from "react-router-dom";
import { Mic } from "lucide-react";
import { motion } from "framer-motion";
import { Typewriter } from "@/components/ui/typewriter";

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate("/auth");
  };

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-voicevault-softpurple to-white"
      onClick={handleClick}
    >
      <h1 className="sr-only">keeya - Record and Preserve the Voices You Love Forever with AI Voice Memories</h1>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center w-full"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mb-8 bg-white p-6 rounded-full shadow-lg inline-block"
        >
          <Mic className="h-16 w-16 text-voicevault-primary" />
        </motion.div>
        
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="font-sans text-heading-lg font-semibold mb-2 text-voicevault-tertiary text-center"
        >
          keeya
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="font-sans text-body text-voicevault-secondary mb-8 text-center h-6"
        >
          <Typewriter 
            text={["Preserve the voices you love, forever.", "Record memories that last a lifetime.", "Capture voices that matter to you."]} 
            loop={true} 
            delay={2000}
            cursor="|"
            className="font-sans text-body text-voicevault-secondary"
          />
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="font-mono text-sm text-gray-500 text-center"
        >
          Tap anywhere to continue
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Landing;
