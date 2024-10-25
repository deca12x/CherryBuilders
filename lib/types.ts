import { UserTag } from "./supabase/types";

export interface User {
  address: string;
  name: string;
}

export type ChatParentProps = {
  userAddress: string;
  chatId: string;
  authToken: string | null;
};

export interface FiltersProp {
  tags: Partial<Record<UserTag, boolean>>;
  events: {
    [key: string]: {
      name: string;
      selected: boolean;
    };
  };
}
