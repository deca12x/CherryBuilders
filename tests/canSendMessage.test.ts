// Copy of the canSendMessage function from lib/chat/canSendMessage.ts
function canSendMessage(
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

// Define the ChatMessageType interface if not already defined in global scope
interface ChatMessageType {
  id: number;
  sender: string;
  receiver: string;
  message: string;
  chat_id: string;
  created_at: string;
  email_notification: boolean;
  type?: string;
  requestId?: string;
}

// Use different user addresses to avoid conflicts with other test files
const userX = "0xABC...userX";
const userY = "0xDEF...userY";

// Helper function to create a message (reusing the pattern from canSendEmail.test.ts)
const createMsgForTest = (
  sender: string,
  receiver: string,
  message: string,
  createdAt: string,
  emailNotification: boolean = false
): ChatMessageType => {
  return {
    id: Math.floor(Math.random() * 1000000),
    sender,
    receiver,
    message,
    chat_id: "test-chat-id-message",
    created_at: createdAt,
    email_notification: emailNotification,
  };
};

// Helper function to test a scenario (reusing the pattern from canSendEmail.test.ts)
const testMessageScenario = (
  description: string,
  messages: ChatMessageType[],
  now: Date,
  expectedCanSend: boolean
) => {
  const result = canSendMessage(messages, userX, userY, now);
  console.log(`\n=== Test: ${description} ===`);
  console.log(`Expected canSend: ${expectedCanSend}`);
  console.log(`Actual result:`, result);
  console.log(
    `Test ${result.canSend === expectedCanSend ? "PASSED" : "FAILED"}`
  );
};

// Base date for testing
const baseMessageDate = new Date("2023-02-01T12:00:00Z");

// Test Case 1: User has sent less than 20 messages (should allow sending)
console.log("\n\n--- CASE 1: User has sent less than 20 messages ---");
const case1MessagesForSendMsg = Array.from({ length: 15 }, (_, i) =>
  createMsgForTest(
    userX,
    userY,
    `Message ${i + 1}`,
    new Date(baseMessageDate.getTime() - (i + 1) * 60 * 60 * 1000).toISOString()
  )
);

// Add some messages from the other user
case1MessagesForSendMsg.push(
  createMsgForTest(
    userY,
    userX,
    "Reply from Y",
    new Date(baseMessageDate.getTime() - 5 * 60 * 60 * 1000).toISOString()
  )
);

testMessageScenario(
  "User has sent less than 20 messages",
  case1MessagesForSendMsg,
  baseMessageDate,
  true
);

// Test Case 2: User has sent 20+ messages, but the other user has replied after the 20th-to-last message
console.log(
  "\n\n--- CASE 2: User has sent 20+ messages, but other user replied after 20th-to-last message ---"
);
const case2MessagesForSendMsg = Array.from({ length: 25 }, (_, i) =>
  createMsgForTest(
    userX,
    userY,
    `Message ${i + 1}`,
    new Date(
      baseMessageDate.getTime() - (30 - i) * 60 * 60 * 1000
    ).toISOString()
  )
);

// Add a reply from the other user after the 20th-to-last message
const twentyToLastIndex = case2MessagesForSendMsg.length - 20;
case2MessagesForSendMsg.push(
  createMsgForTest(
    userY,
    userX,
    "Reply from Y after 20th-to-last message",
    new Date(
      new Date(
        case2MessagesForSendMsg[twentyToLastIndex].created_at
      ).getTime() +
        1 * 60 * 60 * 1000
    ).toISOString()
  )
);

testMessageScenario(
  "User has sent 20+ messages, but other user replied after 20th-to-last message",
  case2MessagesForSendMsg,
  baseMessageDate,
  true
);

// Test Case 3: User has sent 20+ messages, and the other user has not replied after the 20th-to-last message
console.log(
  "\n\n--- CASE 3: User has sent 20+ messages, no reply after 20th-to-last message ---"
);
const case3MessagesForSendMsg = Array.from({ length: 25 }, (_, i) =>
  createMsgForTest(
    userX,
    userY,
    `Message ${i + 1}`,
    new Date(
      baseMessageDate.getTime() - (30 - i) * 60 * 60 * 1000
    ).toISOString()
  )
);

// Add a reply from the other user BEFORE the 20th-to-last message
const beforeTwentyToLastIndex = case3MessagesForSendMsg.length - 22;
case3MessagesForSendMsg.push(
  createMsgForTest(
    userY,
    userX,
    "Reply from Y before 20th-to-last message",
    new Date(
      new Date(
        case3MessagesForSendMsg[beforeTwentyToLastIndex].created_at
      ).getTime() -
        1 * 60 * 60 * 1000
    ).toISOString()
  )
);

testMessageScenario(
  "User has sent 20+ messages, no reply after 20th-to-last message",
  case3MessagesForSendMsg,
  baseMessageDate,
  false
);
