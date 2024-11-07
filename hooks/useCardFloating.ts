import { useState, useEffect } from "react";
import { ForceNode } from "@/lib/landing/types";

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
  const [nodes, setNodes] = useState<ForceNode[]>([]);

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

    const nodes: ForceNode[] = positions.map((pos, i) => ({
      index: i,
      x: width / 2 + pos.x,
      y: height / 2 + pos.y,
      vx: 0,
      vy: 0,
    }));

    setNodes(nodes);
  }, [count, width, height]);

  return nodes;
}
