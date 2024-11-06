import { useEffect, useState } from "react";
import { forceSimulation, forceManyBody, forceCollide } from "d3-force";
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
    const nodes: ForceNode[] = Array.from({ length: count }, (_, i) => ({
      index: i,
      x: Math.random() * width,
      y: Math.random() * height,
    }));

    const isMobile = width < 640;

    const simulation = forceSimulation(nodes)
      .alphaDecay(0) // Prevent cooling
      .alphaMin(0) // Never stop
      .force("charge", forceManyBody().strength(isMobile ? -30 : -50))
      .force(
        "collision",
        forceCollide()
          .radius(isMobile ? 40 : 60)
          .strength(1)
          .iterations(4)
      );

    simulation.on("tick", () => {
      // Constrain nodes to screen bounds
      simulation.nodes().forEach((node: ForceNode) => {
        node.x = Math.max(0, Math.min(width, node.x));
        node.y = Math.max(0, Math.min(height, node.y));
      });
      setNodes([...simulation.nodes()]);
    });

    return () => {
      simulation.stop();
    };
  }, [count, width, height]);

  return nodes;
}
