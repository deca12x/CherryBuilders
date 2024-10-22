"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ToggleRight, X } from "lucide-react";
import { UserTag } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";

interface MatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentFilters: {
    tags: {
      [key in UserTag]: boolean;
    };
    events: {
      [key: string]: {
        name: string;
        selected: boolean;
      };
    };
  };
  setParentFilters: (filters: {
    tags: {
      [key in UserTag]: boolean;
    };
    events: {
      [key: string]: {
        name: string;
        selected: boolean;
      };
    };
  }) => void;
}

export default function FiltersModal({ isOpen, onClose, parentFilters, setParentFilters }: MatchModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [filters, setFilters] = useState<{
    tags: {
      [key in UserTag]: boolean;
    };
    events: {
      [key: string]: {
        name: string;
        selected: boolean;
      };
    };
  }>(parentFilters);

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
      handleModalClose();
    }
  };

  const handleModalClose = () => {
    setParentFilters(filters);
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
            <ToggleRight className="text-primary" size={48} />
            <h2 className="text-3xl font-bold text-primary">Filters</h2>
          </div>
          <p className="text-xl mb-6 text-primary-foreground">Select and apply the filters you prefer</p>
          <div className="grid grid-cols-2 gap-4">
            {Object.keys(filters.tags).map((tag) => (
              <Button
                key={tag}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, tags: { ...prev.tags, [tag as UserTag]: !prev.tags[tag as UserTag] } }))
                }
                variant={filters.tags[tag as UserTag] ? "default" : "outline"}
                className="w-full"
              >
                {tag}
              </Button>
            ))}
            {Object.keys(filters.events).map((event) => (
              <Button
                key={event}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    events: {
                      ...prev.events,
                      [event]: { name: prev.events[event].name, selected: !prev.events[event].selected },
                    },
                  }))
                }
                variant={filters.events[event].selected ? "default" : "outline"}
                className="w-full"
              >
                {filters.events[event].name}
              </Button>
            ))}
          </div>
          <Button
            onClick={handleModalClose}
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 text-primary-foreground hover:text-primary hover:bg-primary/10"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}
