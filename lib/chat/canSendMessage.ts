import { ChatMessageType } from "@/lib/supabase/types";

/**
 * Determines if a user can send a message when notifications are disabled
 *
 * Rules:
 * 1. If user A has sent less than 20 messages, then user A can send a message
 * 2. Else if user B has sent any message since user A's 20th-to-last message, then user A can send a message
 * 3. Else, user A cannot send a message
 *
 * @param messages - All messages in the chat
 * @param userAddress - The address of the current user (user A)
 * @param otherUserAddress - The address of the other user (user B)
 * @returns An object indicating if the user can send a message and the reason
 */
export function canSendMessage(
  messages: ChatMessageType[],
  userAddress: string,
  otherUserAddress: string,
  now: Date
): { canSend: boolean; reason: string } {
  // Sort messages by creation date (oldest first)
  const sortedMessages = [...messages].sort(
    (a, b) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  // Filter messages sent by the current user
  const userMessages = sortedMessages.filter(
    (msg) => msg.sender === userAddress
  );

  // Case 1/3: If user A has sent less than 20 messages, then user A can send a message
  if (userMessages.length < 20) {
    return {
      canSend: true,
      reason: `You can send ${20 - userMessages.length} more messages before the other user needs to respond`,
    };
  }

  // Case 2/3: If user B has sent any message since user A's 20th-to-last message, then user A can send a message
  // Case 2/3: If user B has sent any message since user A's 20th-to-last message, then user A can send a message
  const twentyToLastUserMessageDate = new Date(
    userMessages[userMessages.length - 20].created_at
  );

  // Get the latest message from the other user
  const otherUserMessages = sortedMessages.filter(
    (msg) => msg.sender === otherUserAddress
  );
  const latestOtherUserMessage =
    otherUserMessages.length > 0
      ? otherUserMessages[otherUserMessages.length - 1]
      : null;

  // Check if the other user's latest message is after the user's 20th-to-last message
  if (
    latestOtherUserMessage &&
    new Date(latestOtherUserMessage.created_at) > twentyToLastUserMessageDate
  ) {
    return {
      canSend: true,
      reason: "The other user has responded to your messages",
    };
  }

  // Rule 3: Otherwise, user A cannot send a message
  return {
    canSend: false,
    reason:
      "You've sent 20 consecutive messages without a response. Wait for the other user to reply.",
  };
}
