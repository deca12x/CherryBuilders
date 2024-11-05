import { UserTag } from "../supabase/types";

export interface LandingProfile {
  index: number;
  name: string;
  image: string;
  tags: UserTag[];
}
