"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ToggleRight, X } from "lucide-react";
import { UserTag } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import { FiltersProp } from "@/lib/types";
import { setUserFilters } from "@/lib/supabase/utils";

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentFilters: FiltersProp;
  setParentFilters: (filters: FiltersProp) => void;
  jwt: string | null;
}

export default function FiltersModal({ isOpen, onClose, parentFilters, setParentFilters, jwt }: FiltersModalProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [filters, setFilters] = useState<FiltersProp>(parentFilters);

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

  const handleModalClose = async () => {
    onClose();
    if (JSON.stringify(filters) !== JSON.stringify(parentFilters)) {
      const activeTags = Object.keys(filters.tags).filter((key) => filters.tags[key as UserTag]);
      const activeEvents = Object.keys(filters.events).filter((key) => filters.events[key].selected);

      // Update user filters in the database
      const { success, error } = await setUserFilters(activeTags, activeEvents, jwt);
      if (!success && error) {
        console.error("Error setting user filters: ", error);
        return;
      }

      setParentFilters(filters);
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
        className="bg-card rounded-xl shadow-xl p-8 max-w-md w-full mx-4 text-center relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 bg-card rounded-xl" />
        <div className="relative z-10">
          <div className="flex gap-3 justify-center items-center mb-3">
            <ToggleRight className="text-primary sm:h-12 sm:w-12 h-8 w-8" />
            <h2 className="text-2xl sm:text-3xl font-bold text-primary">Filters</h2>
          </div>
          <p className="text-lg sm:text-xl mb-5 text-primary-foreground">Select and apply the filters you prefer</p>
          <p className="text-md mb-3 text-primary-foreground text-left">Tags</p>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.keys(filters.tags).map((tag) => (
              <Button
                key={tag}
                onClick={() =>
                  setFilters((prev) => ({ ...prev, tags: { ...prev.tags, [tag as UserTag]: !prev.tags[tag as UserTag] } }))
                }
                variant={filters.tags[tag as UserTag] ? "default" : "outline"}
                className="w-full text-wrap leading-4 p-5"
              >
                {tag}
              </Button>
            ))}
          </div>
          <p className="text-md mt-7 mb-3 text-primary-foreground text-left">Events</p>
          <div className="grid grid-cols-2 gap-2.5">
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
                className="w-full text-wrap leading-4 p-5"
              >
                {filters.events[event].name}
              </Button>
            ))}
          </div>
          <Button
            onClick={handleModalClose}
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
