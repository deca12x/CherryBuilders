import { ChatItem } from "@/components/chat2/ChatParent2";

/**
 * A function to sort chat history by last message date, if the last message date is not available, the chat will be placed at the bottom
 * @param chatHistory The chat history to sort
 * @param ascending Whether to sort in ascending order or not
 * @returns the sorted chat history
 */
export const sortChatHistory = (chatHistory: ChatItem[], ascending: boolean): ChatItem[] => {
  if (ascending) {
    return chatHistory.sort((a, b) => {
      if (a.lastMessage.date && b.lastMessage.date) {
        return new Date(a.lastMessage.date).getTime() - new Date(b.lastMessage.date).getTime();
      } else if (a.lastMessage.date) {
        return 1;
      } else if (b.lastMessage.date) {
        return -1;
      } else {
        return 0;
      }
    });
  } else {
    return chatHistory.sort((a, b) => {
      if (a.lastMessage.date && b.lastMessage.date) {
        return new Date(b.lastMessage.date).getTime() - new Date(a.lastMessage.date).getTime();
      } else if (a.lastMessage.date) {
        return -1;
      } else if (b.lastMessage.date) {
        return 1;
      } else {
        return 0;
      }
    });
  }
};

/**
 * A function to format a date string to a human readable format.
 * If the date is today, it will return the time, if it was yesterday, it will return the day of the week,
 * if it was within the last year, it will return the day and month, otherwise it will return the full date
 * @param dateString - The date string to format
 * @returns The formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const oneDay = 24 * 60 * 60 * 1000;
  const twoDays = 2 * oneDay;
  const oneYear = 365 * oneDay;

  if (now.getTime() - date.getTime() < oneDay) {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (now.getTime() - date.getTime() < twoDays) {
    return date.toLocaleDateString([], { weekday: "long" });
  } else if (now.getTime() - date.getTime() < oneYear) {
    return date.toLocaleDateString([], { day: "2-digit", month: "2-digit" });
  } else {
    return date.toLocaleDateString([], { day: "2-digit", month: "2-digit", year: "numeric" });
  }
}
