"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string;
}

export default function MatchModal({ isOpen, onClose, chatId }: MatchModalProps) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  const handleAnimationComplete = () => {
    if (!isOpen) {
      setIsVisible(false);
    }
  };

  const handleRedirect = () => {
    router.push(`/chat/${chatId}`);
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onAnimationComplete={handleAnimationComplete}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleOverlayClick}
    >
      <motion.div
        initial={{ scale: 0.8, y: 50 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.8, y: 50 }}
        transition={{ type: "spring", damping: 15, stiffness: 300 }}
        className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <div className="absolute inset-0 bg-yellow-100 opacity-50" />
        <div className="relative z-10">
          <Sparkles className="text-yellow-500 mx-auto mb-4" size={48} />
          <h2 className="text-3xl font-bold mb-4 text-gray-800">It's a Match!</h2>
          <p className="text-xl mb-6 text-gray-600">Congratulations! You've found a great connection.</p>
          <button
            onClick={handleRedirect}
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50"
          >
            Start Chatting
          </button>
          <button onClick={onClose} className="absolute -top-2 right-2 text-gray-500 hover:text-gray-700 text-3xl font-bold">
            &times;
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
