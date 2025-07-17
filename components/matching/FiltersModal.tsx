"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ToggleRight, Check } from "lucide-react";
import type { UserTag } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import type { FiltersProp } from "@/lib/types";
import { Button2 } from "@/components/ui/button2";

interface FiltersModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentFilters: FiltersProp;
  setParentFilters: (filters: FiltersProp) => void;
  jwt: string | null;
}

export default function FiltersModal({
  isOpen,
  onClose,
  parentFilters,
  setParentFilters,
  jwt,
}: FiltersModalProps) {
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

  const handleModalClose = () => {
    onClose();
    if (JSON.stringify(filters) !== JSON.stringify(parentFilters)) {
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
          <div className="flex gap-3 justify-center items-center mb-3 relative">
            <ToggleRight className="text-red sm:h-12 sm:w-12 h-8 w-8" />
            <h2 className="text-2xl sm:text-3xl font-bold text-red">Filters</h2>
            <Button
              onClick={handleModalClose}
              variant="ghost"
              className="absolute -right-2 bg-green/10 hover:bg-green/10 text-green rounded-xl"
            >
              <Check className="h-5 w-5" strokeWidth={3} />
              <span className="sr-only">Close</span>
            </Button>
          </div>
          <p className="text-lg sm:text-xl mb-5 text-red-foreground">
            Select and apply the filters you prefer
          </p>
          <p className="text-md mb-3 text-red-foreground text-left">Skills</p>
          <div className="grid grid-cols-2 gap-2.5">
            {Object.keys(filters.tags).map((tag) => (
              <Button
                key={tag}
                onClick={() =>
                  setFilters((prev) => ({
                    ...prev,
                    tags: {
                      ...prev.tags,
                      [tag as UserTag]: !prev.tags[tag as UserTag],
                    },
                  }))
                }
                variant={filters.tags[tag as UserTag] ? "default" : "outline"}
                className="w-full text-wrap leading-4 p-5"
              >
                {tag}
              </Button>
            ))}
          </div>
          <p className="text-md mt-7 mb-3 text-red-foreground text-left">
            Events
          </p>
          <div
            className="overflow-y-auto h-[calc(4.5 * 2rem + 4 * 0.5rem)]"
            style={{ maxHeight: "calc(4.5 * 2rem + 4 * 0.5rem)" }}
          >
            <div className="flex flex-col gap-2.5 items-start">
              {Object.entries(filters.events)
                .reverse()
                .map(([event, eventData]) => (
                  <Button2
                    key={event}
                    onClick={() =>
                      setFilters((prev) => ({
                        ...prev,
                        events: {
                          ...prev.events,
                          [event]: {
                            title: prev.events[event].title,
                            selected: !prev.events[event].selected,
                          },
                        },
                      }))
                    }
                    variant={
                      filters.events[event].selected ? "default" : "outline"
                    }
                    className="w-full text-wrap leading-4 p-5 h-3"
                  >
                    {filters.events[event].title}
                  </Button2>
                ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
