
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
      className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-b from-[#E8E1FF] via-[#F4F0FF] to-white"
      onClick={handleClick}
      style={{ paddingTop: 'env(safe-area-inset-top)' }}
    >
      <div className="text-center max-w-md w-full px-8">
        <h1 className="sr-only">keeya - Record and Preserve the Voices You Love Forever with AI Voice Memories</h1>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full flex flex-col items-center"
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="mb-12 bg-white p-8 rounded-full shadow-lg inline-flex items-center justify-center"
          >
            <Mic className="h-16 w-16 text-[#8B5CF6]" />
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="font-sans text-4xl font-semibold mb-4 text-[#6842C2]"
          >
            keeya
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="h-6 mb-12"
          >
            <Typewriter 
              text={[
                "Record memories that last a lifetime.",
                "Preserve the voices you love.",
                "Share stories across generations."
              ]} 
              loop={true}
              delay={2000}
              cursor="|"
              className="font-sans text-lg text-[#8B5CF6] whitespace-nowrap overflow-hidden text-ellipsis"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="font-mono text-sm text-gray-500/80"
          >
            Tap anywhere to continue
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Landing;

