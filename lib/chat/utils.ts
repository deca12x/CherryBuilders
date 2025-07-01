import { ChatItem } from "@/components/chat/ChatParent";

/**
 * A function to sort chat history by last message date, if the last message date is not available, the chat will be placed at the bottom
 * @param chatHistory The chat history to sort
 * @param ascending Whether to sort in ascending order or not
 * @returns the sorted chat history
 */
export const sortChatHistory = (
  chatHistory: ChatItem[],
  ascending: boolean
): ChatItem[] => {
  if (ascending) {
    return chatHistory.sort((a, b) => {
      if (a.lastMessage.date && b.lastMessage.date) {
        return (
          new Date(a.lastMessage.date).getTime() -
          new Date(b.lastMessage.date).getTime()
        );
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
        return (
          new Date(b.lastMessage.date).getTime() -
          new Date(a.lastMessage.date).getTime()
        );
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
 * If the date is today, it will return the time
 * If in the current year but not today, it will return the day and month with time
 * If in a different year, it will include the year as well
 * @param dateString - The date string to format
 * @returns The formatted date string
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();

  // Check if the date is today (same day, month, and year)
  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  // Check if the date is in the current year
  const isSameYear = date.getFullYear() === now.getFullYear();

  if (isToday) {
    // Format: "10:00"
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } else if (isSameYear) {
    // Format: "24th Jul at 10:00"
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Add ordinal suffix to day
    const ordinalSuffix = getOrdinalSuffix(day);

    return `${day}${ordinalSuffix} ${month} at ${time}`;
  } else {
    // Format: "24th Jul 2024 at 10:00"
    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    const year = date.getFullYear();
    const time = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Add ordinal suffix to day
    const ordinalSuffix = getOrdinalSuffix(day);

    return `${day}${ordinalSuffix} ${month} ${year} at ${time}`;
  }
}

/**
 * Helper function to get the ordinal suffix for a number (1st, 2nd, 3rd, etc.)
 * @param day - The day of the month
 * @returns The ordinal suffix
 */
function getOrdinalSuffix(day: number): string {
  if (day > 3 && day < 21) return "th";
  switch (day % 10) {
    case 1:
      return "st";
    case 2:
      return "nd";
    case 3:
      return "rd";
    default:
      return "th";
  }
}
