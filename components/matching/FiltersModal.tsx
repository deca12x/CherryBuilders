"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ToggleRight, Check } from "lucide-react";
import type { UserTag } from "@/lib/supabase/types";
import { Button } from "@/components/ui/button";
import type { FiltersProp } from "@/lib/types";
import { Button2 } from "@/components/ui/button2";
import { ALL_EVENTS } from "@/lib/supabase/eventData";

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

  // Carousel state for active events
  const [activeRotation, setActiveRotation] = useState(0);
  const [activeIsDragging, setActiveIsDragging] = useState(false);
  const [activeDragStart, setActiveDragStart] = useState({ x: 0, rotation: 0 });
  const activeCarouselRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    }
  }, [isOpen]);

  // Continuous clockwise rotation for active events when not dragging
  useEffect(() => {
    if (activeIsDragging) return;

    const interval = setInterval(() => {
      setActiveRotation((prev) => prev + 0.3); // Slow clockwise rotation
    }, 50);

    return () => clearInterval(interval);
  }, [activeIsDragging]);

  // Active events mouse/touch drag handlers
  const handleActiveMouseDown = (e: React.MouseEvent) => {
    setActiveIsDragging(true);
    setActiveDragStart({
      x: e.clientX,
      rotation: activeRotation,
    });
  };

  const handleActiveMouseMove = (e: React.MouseEvent) => {
    if (!activeIsDragging) return;

    const deltaX = e.clientX - activeDragStart.x;
    const rotationDelta = deltaX * -0.5;
    setActiveRotation(activeDragStart.rotation + rotationDelta);
  };

  const handleActiveMouseUp = () => {
    setActiveIsDragging(false);
  };

  const handleActiveTouchStart = (e: React.TouchEvent) => {
    setActiveIsDragging(true);
    setActiveDragStart({
      x: e.touches[0].clientX,
      rotation: activeRotation,
    });
  };

  const handleActiveTouchMove = (e: React.TouchEvent) => {
    if (!activeIsDragging) return;

    const deltaX = e.touches[0].clientX - activeDragStart.x;
    const rotationDelta = deltaX * -0.5;
    setActiveRotation(activeDragStart.rotation + rotationDelta);
  };

  const handleActiveTouchEnd = () => {
    setActiveIsDragging(false);
  };

  // Global mouse up handlers
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setActiveIsDragging(false);
    };

    if (activeIsDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mouseleave", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mouseleave", handleGlobalMouseUp);
    };
  }, [activeIsDragging]);

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

  const getEventStyle = (
    index: number,
    totalEvents: number,
    rotation: number
  ) => {
    const angleStep = 360 / totalEvents;
    const angle = index * angleStep + rotation;
    const radianAngle = (angle * Math.PI) / 180;

    // Elliptical orbit parameters (viewed from side) - made wider
    const radiusX = 100; // Increased from 80
    const radiusY = 35; // Increased from 30

    const x = Math.cos(radianAngle) * radiusX;
    const y = Math.sin(radianAngle) * radiusY;

    // Z-depth calculation for 3D effect
    const z = Math.sin(radianAngle) * 60; // Depth component

    // Scale based on Z position (foreground = bigger, background = smaller)
    const baseScale = 0.6;
    const scaleRange = 0.5;
    const scale = baseScale + scaleRange * ((z + 60) / 120);

    // Opacity based on Z position
    const opacity = 0.5 + 0.5 * ((z + 60) / 120);

    // Z-index for proper layering
    const zIndex = Math.round(z + 60);

    // Blur effect for depth
    const blur = Math.max(0, (30 - z) / 12);

    // Determine if event is in closest portion of foreground (clickable)
    const isClickable = z > 30;

    return {
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
      zIndex,
      filter: `blur(${blur}px) brightness(${0.7 + 0.3 * ((z + 60) / 120)})`,
      transition: "none",
      pointerEvents: (isClickable
        ? "auto"
        : "none") as React.CSSProperties["pointerEvents"],
      isClickable,
    };
  };

  if (!isVisible) return null;

  // Separate events by active status
  const activeEvents = Object.entries(filters.events).filter(([eventSlug]) => {
    const eventData = ALL_EVENTS.find((e) => e.slug === eventSlug);
    return eventData?.active === true;
  });

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
        className="bg-card rounded-xl shadow-xl p-6 max-w-lg w-full mx-4 text-center relative overflow-hidden max-h-[90vh] overflow-y-auto"
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

          {/* Active Events Section */}
          <p className="text-md mt-7 mb-3 text-red-foreground text-left">
            Active Events
          </p>
          <div
            ref={activeCarouselRef}
            className="relative w-full h-44 flex items-center justify-center perspective-1000 mx-auto mb-6"
            onMouseDown={handleActiveMouseDown}
            onMouseMove={handleActiveMouseMove}
            onMouseUp={handleActiveMouseUp}
            onTouchStart={handleActiveTouchStart}
            onTouchMove={handleActiveTouchMove}
            onTouchEnd={handleActiveTouchEnd}
            style={{
              userSelect: "none",
              cursor: activeIsDragging ? "grabbing" : "grab",
            }}
          >
            {/* Orbital path visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-20 border border-green/30 rounded-full transform rotate-12 opacity-40"></div>
            </div>

            {/* Center indicator */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-gradient-radial from-green/50 to-transparent rounded-full blur-sm animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-green/70 rounded-full blur-xs"></div>

            {activeEvents.map(([event, eventData], index) => {
              const style = getEventStyle(
                index,
                activeEvents.length,
                activeRotation
              );
              const isInForeground = style.isClickable;

              return (
                <div
                  key={event}
                  className="absolute"
                  style={{
                    transform: style.transform,
                    opacity: style.opacity,
                    zIndex: style.zIndex,
                    filter: style.filter,
                    transition: style.transition,
                    pointerEvents: style.pointerEvents,
                  }}
                >
                  <Button2
                    onClick={(e) => {
                      if (!style.isClickable || activeIsDragging) {
                        e.preventDefault();
                        return;
                      }
                      e.stopPropagation();
                      setFilters((prev) => ({
                        ...prev,
                        events: {
                          ...prev.events,
                          [event]: {
                            title: prev.events[event].title,
                            selected: !prev.events[event].selected,
                          },
                        },
                      }));
                    }}
                    variant={eventData.selected ? "default" : "outline"}
                    className="text-wrap leading-4 p-2 h-auto min-h-[2rem] w-28 transition-all duration-300 group-hover:scale-110 shadow-lg hover:shadow-xl"
                    style={{
                      pointerEvents: style.pointerEvents,
                    }}
                  >
                    <span className="text-xs font-medium text-center block">
                      {eventData.title}
                    </span>
                  </Button2>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        .blur-xs {
          filter: blur(2px);
        }
      `}</style>
    </motion.div>
  );
}
