import { useState, useEffect, useRef } from "react";
import { ForceNode } from "@/lib/landing/types";
import { LANDING_PROFILES } from "@/lib/landing/data";

const MAX_VISIBLE = 8;
const DISPLAY_INTERVAL = 1000;

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
  const [visibleMiniProfiles, setVisibleMiniProfiles] = useState<ForceNode[]>(
    []
  );
  const [currentPosition, setCurrentPosition] = useState(0);
  const [shuffledProfiles] = useState(() =>
    [...LANDING_PROFILES].sort(() => Math.random() - 0.5)
  );

  const selectedProfilesRef = useRef<number[]>([]);

  useEffect(() => {
    const positions = [
      { x: -320, y: -180 },
      { x: 0, y: -280 },
      { x: 320, y: -180 },
      { x: -400, y: 0 },
      { x: 400, y: 0 },
      { x: -320, y: 180 },
      { x: 0, y: 280 },
      { x: 320, y: 180 },
    ];

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

      // Update visible profiles
      setVisibleMiniProfiles((prev) => {
        const positionIndex = prev.length % positions.length;
        const nextNode = {
          index: nextProfileId,
          x: width / 2 + positions[positionIndex].x,
          y: height / 2 + positions[positionIndex].y,
          vx: 0,
          vy: 0,
        };

        if (prev.length >= MAX_VISIBLE) {
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
