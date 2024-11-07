import { useState, useEffect, useRef } from "react";
import { ForceNode } from "@/lib/landing/types";
import { LANDING_PROFILES } from "@/lib/landing/data";

const MOBILE_BREAKPOINT = 768;
const DESKTOP_MAX_VISIBLE = 8;
const MOBILE_MAX_VISIBLE = 4;
const DISPLAY_INTERVAL = 2000;

const DESKTOP_POSITIONS = [
  { x: 400, y: 0 },
  { x: 0, y: 280 },
  { x: -320, y: -180 },
  { x: 320, y: -180 },
  { x: -320, y: 180 },
  { x: 0, y: -280 },
  { x: 320, y: 180 },
  { x: -400, y: 0 },
];

const MOBILE_POSITIONS = [
  { x: -35, y: 180 },
  { x: -35, y: -300 },
  { x: 35, y: 300 },
  { x: 35, y: -180 },
];
interface UseCardFloatingProps {
  count: number;
  width: number;
  height: number;
}

export default function useCardFloating({
  count,
  width,
  height,
}: UseCardFloatingProps) {
  const isMobile = width < MOBILE_BREAKPOINT;
  const positions = isMobile ? MOBILE_POSITIONS : DESKTOP_POSITIONS;
  const maxVisible = isMobile ? MOBILE_MAX_VISIBLE : DESKTOP_MAX_VISIBLE;

  const [visibleMiniProfiles, setVisibleMiniProfiles] = useState<ForceNode[]>(
    []
  );
  const [shuffledProfiles] = useState(() =>
    [...LANDING_PROFILES].sort(() => Math.random() - 0.5)
  );

  const selectedProfilesRef = useRef<number[]>([]);
  const positionRef = useRef(0);

  useEffect(() => {
    const addNextProfile = () => {
      // Reset selected profiles if we've used them all
      if (selectedProfilesRef.current.length === shuffledProfiles.length) {
        selectedProfilesRef.current = [];
      }

      // Get next profile from shuffled list and add to selected profiles
      const nextProfileId =
        shuffledProfiles[selectedProfilesRef.current.length].index;
      selectedProfilesRef.current = [
        ...selectedProfilesRef.current,
        nextProfileId,
      ];

      positionRef.current = (positionRef.current + 1) % positions.length;

      // Update visible profiles
      setVisibleMiniProfiles((prev) => {
        const nextNode = {
          index: nextProfileId,
          x: width / 2 + positions[positionRef.current].x,
          y: height / 2 + positions[positionRef.current].y,
          vx: 0,
          vy: 0,
        };

        if (prev.length >= maxVisible) {
          return [...prev.slice(1), nextNode];
        } else {
          return [...prev, nextNode];
        }
      });
    };

    const interval = setInterval(addNextProfile, DISPLAY_INTERVAL);
    return () => clearInterval(interval);
  }, [width, height, shuffledProfiles]);

  return visibleMiniProfiles;
}
