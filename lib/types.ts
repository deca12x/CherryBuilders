export interface User {
  address: string;
  name: string;
}

export type ChatParentProps = {
  userAddress: string;
  chatId: string;
  authToken: string | null;
};
