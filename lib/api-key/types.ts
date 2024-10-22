export type ApiKeyMode = "r" | "w" | "rw";
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

export interface ApiKey {
  id: number;
  owner_entity: string;
  mode: ApiKeyMode;
  key: string;
}
