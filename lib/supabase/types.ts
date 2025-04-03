import { ApiKeyMode } from "../api-key/types";

export type UserTag =
  | "Frontend dev"
  | "Backend dev"
  | "Smart contract dev"
  | "Designer"
  | "Talent scout"
  | "Biz dev"
  | "Artist"
  | "Here for the lolz";

export interface UserType {
  evm_address: string;
  name: string;
  talent_score?: number;
  profile_pictures: string[];
  tags: UserTag[];
  bio: string;
  building: string;
  looking_for: string;
  github_link?: string;
  twitter_link?: string;
  farcaster_link?: string;
  other_link?: string;
  created_at?: string;
  updated_at?: string;
  events?: EventType[];
  email?: string;
  emailMarketing?: boolean;
  emailNotifications?: boolean;
}

export interface ChatMessageType {
  id: number;
  sender: string;
  receiver: string;
  message: string;
  created_at: string;
  updated_at?: string;
  chat_id: string;
  type?: string;
  requestId?: string;
  paid?: boolean;
  chain_id?: number;
  //read: boolean;
}

export interface ApiKeyType {
  id: number;
  owner_entity: string;
  mode: ApiKeyMode;
  key: string;
}

export interface ApiRequestType {
  id: number;
  api_key_id: number;
  path: string;
  method: string;
  created_at: string;
  api_key_owner: string;
}

export interface ChatType {
  id: number;
  user_1: string;
  user_2: string;
  created_at: string;
  updated_at: string;
}

export interface EventType {
  slug: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  verification_type: string;
  created_at: string;
  updated_at: string;
}

export interface MatchType {
  id: number;
  user_1: string;
  user_2: string;
  matched: boolean;
  partial_match_date?: string;
  full_match_date?: string;
}

export interface PasscodeType {
  id: number;
  code: string;
  event_slug: string;
  consumed: boolean;
  user_address: string;
  external_identifier: string;
  created_at: string;
  updated_at: string;
}

export interface UsersEventsRelType {
  id: number;
  user_address: string;
  event_slug: string;
}

export interface FiltersType {
  id: number;
  user_address: string;
  tags: UserTag[];
  events: string[];
}
