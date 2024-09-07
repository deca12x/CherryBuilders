"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { AlertCircle } from "lucide-react";

interface EndOfProfilesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfilesEndedModal({ isOpen, onClose }: EndOfProfilesModalProps) {
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
        className="bg-gray-100 rounded-lg shadow-xl p-8 max-w-md w-full mx-4 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-gray-200 opacity-50" />
        <div className="relative z-10">
          <AlertCircle className="text-gray-600 mx-auto mb-4" size={48} />
          <h2 className="text-3xl font-bold mb-4 text-gray-800">No More Profiles</h2>
          <p className="text-xl mb-6 text-gray-600">
            You've viewed all available profiles. Check back later for new matches!
          </p>
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-full transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-50"
          >
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
