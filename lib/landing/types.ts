import { UserTag } from "../supabase/types";
import { SimulationNodeDatum } from "d3-force";
export interface MiniProfile {
  index: number;
  name: string;
  image: string;
  tags: UserTag[];
}
export interface Position {
  left: string;
  top: string;
}
export interface SafeZone {
  top: number;
  bottom: number;
  left: number;
  right: number;
}
export interface ForceNode extends SimulationNodeDatum {
  x: number;
  y: number;
  index: number;
}
