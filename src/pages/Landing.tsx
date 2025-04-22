import React from "react";
import { Mic } from "lucide-react";
import { motion } from "framer-motion";
import { Typewriter } from "@/components/ui/typewriter";
import { useNavigate } from "react-router-dom";
const Landing: React.FC = () => {
  const navigate = useNavigate();
  const handleTap = () => {
    navigate("/dashboard");
  };
  return <div className="bg-white flex flex-col items-center justify-center p-6 min-h-screen cursor-pointer fixed inset-0 overflow-hidden" onClick={handleTap}>
      <h1 className="sr-only">keeya - Save the voices you love with AI Voice Memories</h1>
      <motion.div initial={{
      opacity: 0,
      scale: 0.8
    }} animate={{
      opacity: 1,
      scale: 1
    }} transition={{
      duration: 0.5
    }} className="my-[24px] py-0text-center w-full flex flex-col items-center justify-center my-0 py-[24px]">
        <motion.div whileHover={{
        scale: 1.05
      }} whileTap={{
        scale: 0.95
      }} className="mb-8 bg-[#F8F8FC] p-6 rounded-full shadow-button inline-block">
          <Mic className="h-16 w-16 text-voicevault-primary" />
        </motion.div>
        <motion.h2 initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.2,
        duration: 0.5
      }} className="font-sans text-heading-lg font-bold mb-2 text-[#1A1A1A] text-center w-full">
          keeya
        </motion.h2>
        <motion.p initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        delay: 0.4,
        duration: 0.5
      }} className="font-sans text-body text-[#333333] mb-8 text-center h-6">
          <Typewriter text={["Save the voices you love, forever.", "Record memories that last a lifetime.", "Capture voices that matter to you."]} loop={true} delay={2000} cursor="|" className="font-sans text-body text-[#333333]" />
        </motion.p>
        <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} transition={{
        delay: 0.6,
        duration: 0.5
      }} className="font-mono text-xs text-gray-500 text-center">
          Tap anywhere to continue
        </motion.div>
      </motion.div>
    </div>;
};
export default Landing;