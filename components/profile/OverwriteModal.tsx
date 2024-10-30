"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ToggleRight, X, InfoIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OverwriteModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentHandleFetchFromAirstack: () => void;
}

export default function OverwriteModal({ isOpen, onClose, parentHandleFetchFromAirstack }: OverwriteModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden"; // Prevent scrolling
    } else {
      document.body.style.overflow = "auto"; // Re-enable scrolling
    }
  }, [isOpen]);

  const handleAnimationComplete = () => {
    if (!isOpen) {
      setIsVisible(false);
    }
  };

  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      handleModalCloseDeny();
    }
  };

  const handleModalCloseDeny = async () => {
    onClose();
  };

  const handleModalCloseAccept = async () => {
    parentHandleFetchFromAirstack();
    onClose();
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
        className="bg-card rounded-xl shadow-xl p-8 max-w-md w-full mx-4 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-card rounded-xl" />
        <div className="relative z-10">
          <div className="flex gap-3 justify-center items-center mb-3">
            <InfoIcon className="text-primary sm:h-8 sm:w-8 h-5 w-5" />
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">Fetch Profile</h2>
          </div>
          <p className="text-lg sm:text-xl mb-5 text-primary-foreground">
            If a Farcaster profile is connected to your address, your profile information will be overwritten
          </p>
          <div className="flex justify-center gap-4">
            <Button onClick={handleModalCloseDeny} variant="outline" size={"lg"} className="w-1/2">
              Cancel
            </Button>
            <Button onClick={handleModalCloseAccept} variant="destructive" size={"lg"} className="w-1/2">
              Fetch Profile!
            </Button>
          </div>
          <Button
            onClick={handleModalCloseDeny}
            variant="ghost"
            size="icon"
            className="absolute top-0 right-0 text-primary-foreground hover:text-primary hover:bg-primary/10"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
