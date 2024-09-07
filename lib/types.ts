export type UserTag = "frontend dev" | "backend dev" | "solidity dev" | "ui/ux dev";

export interface UserType {
  evm_address: string;
  name: string;
  verified?: boolean;
  talent_score?: number;
  profile_pictures: string[];
  tags: UserTag[];
  bio: string;
  github_link?: string;
  twitter_link?: string;
  farcaster_link?: string;
  other_link?: string;
  created_at?: string;
  updated_at?: string;
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

export interface ProofData {
  proof: string;
  merkle_root: string;
  nullifier_hash: string;
  verification_level: string;
}
