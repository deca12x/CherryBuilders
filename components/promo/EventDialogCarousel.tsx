"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";
import { getActiveEvents } from "@/lib/supabase/eventData";

interface EventData {
  slug: string;
  title: string;
  url: string;
  image: string;
  alt: string;
}

interface EventDialogCarouselProps {
  onDontShowAgain: () => void;
}

// Get active events from eventData
const events: EventData[] = getActiveEvents().map((event) => ({
  slug: event.slug,
  title: event.title,
  url: event.url,
  image: event.image,
  alt: event.alt,
}));

export default function EventDialogCarousel({
  onDontShowAgain,
}: EventDialogCarouselProps) {
  const [open, setOpen] = useState(true);
  const [checked, setChecked] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, rotation: 0 });
  const carouselRef = useRef<HTMLDivElement>(null);

  const handleClose = () => {
    if (checked) onDontShowAgain();
    setOpen(false);
  };

  // Continuous clockwise rotation when not dragging
  useEffect(() => {
    if (isDragging) return;

    const interval = setInterval(() => {
      setRotation((prev) => prev + 0.3); // Slow clockwise rotation
    }, 50);

    return () => clearInterval(interval);
  }, [isDragging]);

  // Mouse/touch drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX,
      rotation: rotation,
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.x;
    const rotationDelta = deltaX * -0.5; // Flipped direction (negative)
    setRotation(dragStart.rotation + rotationDelta);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.touches[0].clientX,
      rotation: rotation,
    });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;

    const deltaX = e.touches[0].clientX - dragStart.x;
    const rotationDelta = deltaX * -0.5; // Flipped direction (negative)
    setRotation(dragStart.rotation + rotationDelta);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // Global mouse up handler to catch mouse up outside the carousel
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("mouseleave", handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("mouseleave", handleGlobalMouseUp);
    };
  }, [isDragging]);

  const getEventStyle = (index: number) => {
    const angle = index * 72 + rotation; // 72 degrees between each event
    const radianAngle = (angle * Math.PI) / 180;

    // Elliptical orbit parameters (viewed from side)
    const radiusX = 140; // Horizontal radius
    const radiusY = 60; // Vertical radius (compressed for side view)

    const x = Math.cos(radianAngle) * radiusX;
    const y = Math.sin(radianAngle) * radiusY;

    // Z-depth calculation for 3D effect
    const z = Math.sin(radianAngle) * 100; // Depth component

    // Scale based on Z position (foreground = bigger, background = smaller)
    const baseScale = 0.7;
    const scaleRange = 0.8;
    const scale = baseScale + scaleRange * ((z + 100) / 200);

    // Opacity based on Z position
    const opacity = 0.75 + 0.25 * ((z + 100) / 200);

    // Z-index for proper layering
    const zIndex = Math.round(z + 100);

    // Blur effect for depth
    const blur = Math.max(0, (50 - z) / 20);

    // Determine if event is in closest 15% of foreground (clickable)
    // z ranges from -100 to 100, so closest 15% is z > 70
    const isClickable = z > 80;

    return {
      transform: `translate(${x}px, ${y}px) scale(${scale})`,
      opacity,
      zIndex,
      filter: `blur(${blur}px) brightness(${0.7 + 0.3 * ((z + 100) / 200)})`,
      transition: "none",
      pointerEvents: (isClickable
        ? "auto"
        : "none") as React.CSSProperties["pointerEvents"],
      isClickable,
    };
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="max-w-[calc(100%-1rem)] sm:max-w-2xl overflow-hidden p-4 sm:p-6"
        style={{
          backgroundImage: 'url("/images/eventDialog.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <DialogHeader className="relative pb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-600/30 opacity-10 blur-lg" />
          <DialogTitle className="relative text-center text-xl sm:text-2xl font-bold bg-gradient-to-r text-black bg-clip-text py-2">
            Coming up on cherry.builders
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex flex-col items-center space-y-6 sm:space-y-8 py-4 sm:py-6">
          {/* 3D Orbital Carousel Container */}
          <div
            ref={carouselRef}
            className="relative w-full max-w-[500px] h-80 flex items-center justify-center perspective-1000 mx-auto"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              userSelect: "none",
              cursor: isDragging ? "grabbing" : "grab",
            }}
          >
            {/* Orbital path visualization */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-72 h-32 border border-white/20 rounded-full transform rotate-12 opacity-30"></div>
            </div>

            {/* Center star/sun effect */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-radial from-yellow-400/40 to-transparent rounded-full blur-sm animate-pulse"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-yellow-300/60 rounded-full blur-xs"></div>

            {events.map((event, index) => {
              const style = getEventStyle(index);
              const isInForeground = style.isClickable; // This is already checking for z > 80

              return (
                <div
                  key={event.slug}
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
                  <Link
                    href={event.url}
                    target="_blank"
                    className="block group"
                    onClick={(e) => {
                      if (!style.isClickable || isDragging) {
                        e.preventDefault();
                        return;
                      }
                      e.stopPropagation();
                      handleClose();
                    }}
                  >
                    <div className="relative overflow-hidden rounded-xl shadow-2xl group-hover:shadow-3xl transition-all duration-300 transform group-hover:scale-110">
                      <img
                        src={event.image}
                        alt={event.alt}
                        className="w-44 h-28 object-cover transition-transform duration-500 group-hover:scale-105"
                        draggable={false}
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      ></div>
                      <div
                        className={`absolute bottom-0 left-0 right-0 p-2 transition-transform duration-300 ${isInForeground ? "translate-y-0" : "translate-y-full group-hover:translate-y-0"}`}
                      >
                        <p
                          className="text-white text-sm font-bold text-center drop-shadow-lg text-shadow-lg"
                          style={{
                            textShadow:
                              "2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)",
                          }}
                        >
                          {event.title}
                        </p>
                      </div>
                      {/* Orbital glow effect */}
                      <div
                        className={`absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400/20 to-purple-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
                      ></div>
                    </div>
                  </Link>
                </div>
              );
            })}
          </div>

          {/* Footer section */}
          <div className="flex flex-col sm:flex-row items-center justify-center w-full px-2 sm:px-4 gap-4 max-w-lg mx-auto">
            <Button
              asChild
              className="bg-gradient-to-r from-[#18181C] to-[#9F1239] hover:from-[#27272A] hover:to-[#047857] transition-all duration-300 shadow-lg hover:shadow-[#E11D48]/25 rounded-xl w-full sm:flex-1"
            >
              <Link
                href="https://x.com/CherryBuilders"
                target="_blank"
                className="flex items-center justify-center py-2"
                onClick={handleClose}
              >
                <span className="text-sm sm:text-base">Find out more on X</span>
              </Link>
            </Button>

            <div className="flex items-center space-x-2 gap-1 bg-background/20 backdrop-blur-sm p-3 rounded-xl w-full sm:flex-1 justify-center">
              <Checkbox
                id="dontShow"
                checked={checked}
                onCheckedChange={() => setChecked(!checked)}
              />
              <label
                htmlFor="dontShow"
                className="text-xs sm:text-sm text-black cursor-pointer hover:text-white transition-colors"
              >
                Don't show again
              </label>
            </div>
          </div>
        </div>
      </DialogContent>

      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        .shadow-3xl {
          box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.5);
        }
        .blur-xs {
          filter: blur(2px);
        }
      `}</style>
    </Dialog>
  );
}
