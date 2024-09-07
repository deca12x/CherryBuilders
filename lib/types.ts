export type user_tag = "frontend dev" | "backend dev" | "solidity dev" | "ui/ux dev";

export interface UserType {
  address: string;
  name: string;
  verified: boolean;
  talent_score: number;
  profile_pictures: string[];
  tags: user_tag[];
  bio: string;
  github_link: string;
  twitter_link: string;
  farcaster_link: string;
  other_link: string;
}

export interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  created_at: string;
  chat_id: string;
  type?: string;
  requestId?: string;
  paid?: boolean;
}

export interface User {
  address: string;
  name: string;
}

export type ChatParentProps = {
  userAddress: string;
  chatId: string;
};
