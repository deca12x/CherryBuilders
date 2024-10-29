"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { Button } from "../ui/button";

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: string[];
}

export default function ProfilePictureModal({ images, isOpen, onClose }: ProfilePictureModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const [direction, setDirection] = useState(0);

  const safeImages = images.length === 0 ? ["/images/default_propic.jpeg"] : images;

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

  const navigate = (newDirection: number) => {
    setDirection(newDirection);
    setImageIndex((prev) => {
      if ((prev === 0 && newDirection < 0) || (prev === safeImages.length - 1 && newDirection > 0)) {
        return prev;
      }
      return prev + newDirection;
    });
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
        className="bg-card rounded-xl shadow-xl p-3 max-w-md w-full mx-4 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full aspect-square overflow-hidden">
          <AnimatePresence initial={false} custom={direction}>
            <motion.img
              key={imageIndex}
              src={safeImages[imageIndex]}
              alt={imageIndex.toString()}
              className="absolute top-0 left-0 w-full h-full object-cover rounded-xl"
              custom={direction}
              variants={{
                enter: (direction: number) => ({
                  x: direction > 0 ? "100%" : "-100%",
                  opacity: 0,
                }),
                center: {
                  zIndex: 1,
                  x: 0,
                  opacity: 1,
                },
                exit: (direction: number) => ({
                  zIndex: 0,
                  x: direction < 0 ? "100%" : "-100%",
                  opacity: 0,
                }),
              }}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 },
              }}
            />
          </AnimatePresence>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="absolute z-40 left-0 top-0 bottom-0 w-1/2 flex items-center justify-start p-4 text-primary-foreground opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Previous image"
        >
          <ChevronLeft size={40} />
        </button>
        <button
          onClick={() => navigate(1)}
          className="absolute z-40 right-0 top-0 bottom-0 w-1/2 flex items-center justify-end p-4 text-primary-foreground opacity-0 hover:opacity-100 transition-opacity"
          aria-label="Next image"
        >
          <ChevronRight size={40} />
        </button>

        {/* Close button */}
        <Button
          onClick={onClose}
          variant="ghost"
          size="icon"
          className="absolute z-40 top-3 right-3 text-primary-foreground bg-secondary/40 hover:bg-secondary/80 rounded-xl"
        >
          <X className="h-4 w-4" />
        </Button>
      </motion.div>
    </motion.div>
  );
}
