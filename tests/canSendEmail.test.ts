// Define the ChatMessageType interface
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

/**
 * Copy of the canSendEmail function from lib/email/canSendEmail.ts
 */
function canSendEmail(
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

  // Filter messages sent by the current user with email_notification flag
  const userEmailNotifications = sortedMessages.filter(
    (msg) => msg.sender === userAddress && msg.email_notification === true
  );

  // Case 1/8: If user has never sent an email notification, they can send one
  if (userEmailNotifications.length === 0) {
    return { canSend: true, reason: "First email notification" };
  }

  // Get the last email notification sent by the user
  const lastEmailNotification =
    userEmailNotifications[userEmailNotifications.length - 1];
  const lastEmailNotificationDate = new Date(lastEmailNotification.created_at);
  const secondToLastEmailNotification =
    userEmailNotifications[userEmailNotifications.length - 2];
  const secondToLastEmailNotificationDate = secondToLastEmailNotification
    ? new Date(secondToLastEmailNotification.created_at)
    : null;
  const thirdToLastEmailNotification =
    userEmailNotifications[userEmailNotifications.length - 3];
  const thirdToLastEmailNotificationDate = thirdToLastEmailNotification
    ? new Date(thirdToLastEmailNotification.created_at)
    : null;

  // Get messages from the other user
  const otherUserMessages = sortedMessages.filter(
    (msg) => msg.sender === otherUserAddress
  );

  if (otherUserMessages.length === 0) {
    return {
      canSend: false,
      reason: "The other user hasn't sent any messages",
    };
  }

  // Case 2/8: If there are 2 messages at least 3 hours apart in the last 2 days, then user A can send an email notification 12h after their last one
  const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
  const otherUserMessagesLast2Days = otherUserMessages.filter(
    (msg) => new Date(msg.created_at) >= twoDaysAgo
  );
  if (otherUserMessagesLast2Days.length >= 2) {
    const firstMsg = otherUserMessagesLast2Days[0];
    const lastMsg =
      otherUserMessagesLast2Days[otherUserMessagesLast2Days.length - 1];

    const firstMsgDate = new Date(firstMsg.created_at);
    const lastMsgDate = new Date(lastMsg.created_at);

    const hoursDiff =
      Math.abs(lastMsgDate.getTime() - firstMsgDate.getTime()) /
      (1000 * 60 * 60);

    if (hoursDiff >= 3) {
      // User can send an email notification 12h after their last one
      const twelveHoursAfterLastEmail = new Date(
        lastEmailNotificationDate.getTime() + 12 * 60 * 60 * 1000
      );

      if (now >= twelveHoursAfterLastEmail) {
        return {
          canSend: true,
          reason:
            "Other user sent 2+ messages at least 3h apart in the last 2 days",
        };
      } else {
        const hoursToWait = Math.ceil(
          (now.getTime() - twelveHoursAfterLastEmail.getTime()) /
            (1000 * 60 * 60)
        );
        return {
          canSend: false,
          reason: `Need to wait ${hoursToWait} more hours after last email notification, unless they write back`,
        };
      }
    }
  }

  // Case 3/8: If user B has sent any message in the last 3 days AND user B has sent any message after user A's last email notification, then user A can send an email notification 24h after their last one
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
  const otherUserMessagesLast3Days = otherUserMessages.filter(
    (msg) => new Date(msg.created_at) >= threeDaysAgo
  );
  // User B's last message after user A's last email notification?
  const messageAfterLastEmailNotification =
    new Date(otherUserMessages[otherUserMessages.length - 1].created_at) >
    lastEmailNotificationDate;
  if (
    otherUserMessagesLast3Days.length > 0 &&
    messageAfterLastEmailNotification
  ) {
    const twentyFourHoursAfterLastEmail = new Date(
      lastEmailNotificationDate.getTime() + 24 * 60 * 60 * 1000
    );
    if (now >= twentyFourHoursAfterLastEmail) {
      return {
        canSend: true,
        reason:
          "Other user sent messages in last 3 days and after last email notification",
      };
    } else {
      const hoursToWait = Math.ceil(
        (now.getTime() - twentyFourHoursAfterLastEmail.getTime()) /
          (1000 * 60 * 60)
      );
      return {
        canSend: false,
        reason: `Need to wait ${hoursToWait} more hours after last email notification, unless they write back`,
      };
    }
  }

  // Case 4/8: If user B has sent any message in the last 7 days AND user B has sent any message after user A's second-to-last email notification, then user A can send an email notification 48h after their last one
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const otherUserMessagesLast7Days = otherUserMessages.filter(
    (msg) => new Date(msg.created_at) >= sevenDaysAgo
  );
  // User B's last message after user A's second-to-last email notification?
  const messageAfterSecondToLastEmailNotification =
    secondToLastEmailNotificationDate &&
    new Date(otherUserMessages[otherUserMessages.length - 1].created_at) >
      secondToLastEmailNotificationDate;
  if (
    otherUserMessagesLast7Days.length > 0 &&
    messageAfterSecondToLastEmailNotification
  ) {
    const fortyEightHoursAfterLastEmail = new Date(
      lastEmailNotificationDate.getTime() + 48 * 60 * 60 * 1000
    );
    if (now >= fortyEightHoursAfterLastEmail) {
      return {
        canSend: true,
        reason:
          "Other user sent messages in last 7 days and after second-to-last email notification",
      };
    } else {
      const hoursToWait = Math.ceil(
        (now.getTime() - fortyEightHoursAfterLastEmail.getTime()) /
          (1000 * 60 * 60)
      );
      return {
        canSend: false,
        reason: `Need to wait ${hoursToWait} more hours after second-to-last email notification, unless they write back`,
      };
    }
  }

  // Case 5/8: If user B has sent any message in the last 14 days AND user B has sent any message after user A's third-to-last email notification, then user A can send an email notification 3 days after their last one
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
  const otherUserMessagesLast14Days = otherUserMessages.filter(
    (msg) => new Date(msg.created_at) >= fourteenDaysAgo
  );
  // User B's last message after user A's third-to-last email notification?
  const messageAfterThirdToLastEmailNotification =
    thirdToLastEmailNotificationDate &&
    new Date(otherUserMessages[otherUserMessages.length - 1].created_at) >
      thirdToLastEmailNotificationDate;

  if (
    otherUserMessagesLast14Days.length > 0 &&
    messageAfterThirdToLastEmailNotification
  ) {
    const threeDaysAfterLastEmail = new Date(
      lastEmailNotificationDate.getTime() + 72 * 60 * 60 * 1000
    );

    if (now >= threeDaysAfterLastEmail) {
      return {
        canSend: true,
        reason:
          "Other user sent messages in last 14 days and after third-to-last email notification",
      };
    } else {
      const hoursToWait = Math.ceil(
        (now.getTime() - threeDaysAfterLastEmail.getTime()) / (1000 * 60 * 60)
      );
      return {
        canSend: false,
        reason: `Need to wait ${hoursToWait} more hours after last email notification, unless they write back`,
      };
    }
  }

  // Case 6/8: If user B has sent any message in the last 14 days, then user A can send an email notification 7 days after their last one
  if (otherUserMessagesLast14Days.length > 0) {
    const sevenDaysAfterLastEmail = new Date(
      lastEmailNotificationDate.getTime() + 24 * 7 * 60 * 60 * 1000
    );
    if (now >= sevenDaysAfterLastEmail) {
      return {
        canSend: true,
        reason: "Other user sent messages in last 14 days",
      };
    } else {
      const hoursToWait = Math.ceil(
        (now.getTime() - sevenDaysAfterLastEmail.getTime()) / (1000 * 60 * 60)
      );
      return {
        canSend: false,
        reason: `Need to wait ${hoursToWait} more hours after last email notification, unless they write back`,
      };
    }
  }

  // Case 7/8: If user B has sent any message in the last 30 days, then user A can send an email notification 14 days after their last one
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const otherUserMessagesLast30Days = otherUserMessages.filter(
    (msg) => new Date(msg.created_at) >= thirtyDaysAgo
  );
  if (otherUserMessagesLast30Days.length > 0) {
    const fourteenDaysAfterLastEmail = new Date(
      lastEmailNotificationDate.getTime() + 24 * 14 * 60 * 60 * 1000
    );
    if (now >= fourteenDaysAfterLastEmail) {
      return {
        canSend: true,
        reason: "Other user sent messages in last 14 days",
      };
    } else {
      const hoursToWait = Math.ceil(
        (now.getTime() - fourteenDaysAfterLastEmail.getTime()) /
          (1000 * 60 * 60)
      );
      return {
        canSend: false,
        reason: `Need to wait ${hoursToWait} more hours after last email notification, unless they write back`,
      };
    }
  }

  // Case 8/8: user cannot send an email notification
  return {
    canSend: false,
    reason: "The other user hasn't sent any messages in the last 30 days",
  };
}

// Mock user addresses
const userA = "0x123...userA";
const userB = "0x456...userB";

// Helper function to create a message
const createMessage = (
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
    chat_id: "test-chat-id",
    created_at: createdAt,
    email_notification: emailNotification,
  };
};

// Helper function to test a scenario
const testScenario = (
  description: string,
  messages: ChatMessageType[],
  now: Date,
  expectedCanSend: boolean
) => {
  const result = canSendEmail(messages, userA, userB, now);
  console.log(`\n=== Test: ${description} ===`);
  console.log(`Expected canSend: ${expectedCanSend}`);
  console.log(`Actual result:`, result);
  console.log(
    `Test ${result.canSend === expectedCanSend ? "PASSED" : "FAILED"}`
  );
};

// Base date for testing
const baseDate = new Date("2023-01-01T12:00:00Z");

// Test Case 1: User has never sent an email notification
console.log("\n\n--- CASE 1: User has never sent an email notification ---");
const case1Messages = [
  createMessage(
    userB,
    userA,
    "Hello from B",
    new Date(baseDate.getTime() - 24 * 60 * 60 * 1000).toISOString()
  ),
  createMessage(
    userA,
    userB,
    "Hi from A",
    new Date(baseDate.getTime() - 12 * 60 * 60 * 1000).toISOString()
  ),
];

testScenario(
  "User has never sent an email notification",
  case1Messages,
  baseDate,
  true
);

// Test Case 2: User B sent 2+ messages at least 3h apart in the last 2 days
console.log(
  "\n\n--- CASE 2: User B sent 2+ messages at least 3h apart in the last 2 days ---"
);

// True scenario: 12h has passed since last email notification
const case2TrueMessages = [
  // User B sends two messages 4 hours apart in the last 2 days
  createMessage(
    userB,
    userA,
    "Message 1",
    new Date(baseDate.getTime() - 30 * 60 * 60 * 1000).toISOString()
  ),
  createMessage(
    userB,
    userA,
    "Message 2",
    new Date(baseDate.getTime() - 26 * 60 * 60 * 1000).toISOString()
  ),
  // User A sends an email notification 13 hours ago
  createMessage(
    userA,
    userB,
    "Email notification",
    new Date(baseDate.getTime() - 13 * 60 * 60 * 1000).toISOString(),
    true
  ),
];

testScenario(
  "Case 2 - True: 12h has passed since last email notification",
  case2TrueMessages,
  baseDate,
  true
);

// False scenario: Only 8h has passed since last email notification
const case2FalseMessages = [
  // User B sends two messages 4 hours apart in the last 2 days
  createMessage(
    userB,
    userA,
    "Message 1",
    new Date(baseDate.getTime() - 30 * 60 * 60 * 1000).toISOString()
  ),
  createMessage(
    userB,
    userA,
    "Message 2",
    new Date(baseDate.getTime() - 26 * 60 * 60 * 1000).toISOString()
  ),
  // User A sends an email notification 8 hours ago
  createMessage(
    userA,
    userB,
    "Email notification",
    new Date(baseDate.getTime() - 8 * 60 * 60 * 1000).toISOString(),
    true
  ),
];

testScenario(
  "Case 2 - False: Only 8h has passed since last email notification",
  case2FalseMessages,
  baseDate,
  false
);

// Test Case 3: User B sent messages in last 3 days and after last email notification
console.log(
  "\n\n--- CASE 3: User B sent messages in last 3 days and after last email notification ---"
);

// True scenario: 24h has passed since last email notification
const case3TrueMessages = [
  // User A sends an email notification 25 hours ago
  createMessage(
    userA,
    userB,
    "Email notification",
    new Date(baseDate.getTime() - 25 * 60 * 60 * 1000).toISOString(),
    true
  ),
  // User B sends a message after the email notification
  createMessage(
    userB,
    userA,
    "Response after notification",
    new Date(baseDate.getTime() - 20 * 60 * 60 * 1000).toISOString()
  ),
];

testScenario(
  "Case 3 - True: 24h has passed since last email notification",
  case3TrueMessages,
  baseDate,
  true
);

// False scenario: Only 12h has passed since last email notification
const case3FalseMessages = [
  // User A sends an email notification 12 hours ago
  createMessage(
    userA,
    userB,
    "Email notification",
    new Date(baseDate.getTime() - 12 * 60 * 60 * 1000).toISOString(),
    true
  ),
  // User B sends a message after the email notification
  createMessage(
    userB,
    userA,
    "Response after notification",
    new Date(baseDate.getTime() - 10 * 60 * 60 * 1000).toISOString()
  ),
];

testScenario(
  "Case 3 - False: Only 12h has passed since last email notification",
  case3FalseMessages,
  baseDate,
  false
);

// Test Case 4: User B sent messages in last 7 days and after second-to-last email notification
console.log(
  "\n\n--- CASE 4: User B sent messages in last 7 days and after second-to-last email notification ---"
);

// True scenario: 48h has passed since last email notification
const case4TrueMessages = [
  // User A sends second-to-last email notification 5 days ago
  createMessage(
    userA,
    userB,
    "Second-to-last notification",
    new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
  // User B sends a message after second-to-last notification
  createMessage(
    userB,
    userA,
    "Response after second-to-last",
    new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
  ),
  // User A sends last email notification 3 days ago
  createMessage(
    userA,
    userB,
    "Last notification",
    new Date(baseDate.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
];

testScenario(
  "Case 4 - True: 48h has passed since last email notification",
  case4TrueMessages,
  baseDate,
  true
);

// False scenario: Only 24h has passed since last email notification
const case4FalseMessages = [
  // User A sends second-to-last email notification 5 days ago
  createMessage(
    userA,
    userB,
    "Second-to-last notification",
    new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
  // User B sends a message after second-to-last notification
  createMessage(
    userB,
    userA,
    "Response after second-to-last",
    new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString()
  ),
  // User A sends last email notification 1 day ago
  createMessage(
    userA,
    userB,
    "Last notification",
    new Date(baseDate.getTime() - 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
];

testScenario(
  "Case 4 - False: Only 24h has passed since last email notification",
  case4FalseMessages,
  baseDate,
  false
);

// Test Case 5: User B sent messages in last 14 days and after third-to-last email notification
console.log(
  "\n\n--- CASE 5: User B sent messages in last 14 days and after third-to-last email notification ---"
);

// True scenario: 72h has passed since last email notification
const case5TrueMessages = [
  // User A sends third-to-last email notification 10 days ago
  createMessage(
    userA,
    userB,
    "Third-to-last notification",
    new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
  // User B sends a message after third-to-last notification
  createMessage(
    userB,
    userA,
    "Response after third-to-last",
    new Date(baseDate.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString()
  ),
  // User A sends second-to-last email notification 7 days ago
  createMessage(
    userA,
    userB,
    "Second-to-last notification",
    new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
  // User A sends last email notification 4 days ago
  createMessage(
    userA,
    userB,
    "Last notification",
    new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
];

testScenario(
  "Case 5 - True: 72h has passed since last email notification",
  case5TrueMessages,
  baseDate,
  true
);

// False scenario: Only 48h has passed since last email notification
const case5FalseMessages = [
  // User A sends third-to-last email notification 10 days ago
  createMessage(
    userA,
    userB,
    "Third-to-last notification",
    new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
  // User B sends a message after third-to-last notification
  createMessage(
    userB,
    userA,
    "Response after third-to-last",
    new Date(baseDate.getTime() - 9 * 24 * 60 * 60 * 1000).toISOString()
  ),
  // User A sends second-to-last email notification 7 days ago
  createMessage(
    userA,
    userB,
    "Second-to-last notification",
    new Date(baseDate.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
  // User A sends last email notification 2 days ago
  createMessage(
    userA,
    userB,
    "Last notification",
    new Date(baseDate.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
];

testScenario(
  "Case 5 - False: Only 48h has passed since last email notification",
  case5FalseMessages,
  baseDate,
  false
);

// Test Case 6: User B sent messages in last 14 days
console.log("\n\n--- CASE 6: User B sent messages in last 14 days ---");

// True scenario: 7 days has passed since last email notification
const case6TrueMessages = [
  // User B sends a message 13 days ago
  createMessage(
    userB,
    userA,
    "Message from B",
    new Date(baseDate.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString()
  ),
  // User A sends last email notification 8 days ago
  createMessage(
    userA,
    userB,
    "Last notification",
    new Date(baseDate.getTime() - 8 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
];

testScenario(
  "Case 6 - True: 7 days has passed since last email notification",
  case6TrueMessages,
  baseDate,
  true
);

// False scenario: Only 5 days has passed since last email notification
const case6FalseMessages = [
  // User B sends a message 13 days ago
  createMessage(
    userB,
    userA,
    "Message from B",
    new Date(baseDate.getTime() - 13 * 24 * 60 * 60 * 1000).toISOString()
  ),
  // User A sends last email notification 5 days ago
  createMessage(
    userA,
    userB,
    "Last notification",
    new Date(baseDate.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
];

testScenario(
  "Case 6 - False: Only 5 days has passed since last email notification",
  case6FalseMessages,
  baseDate,
  false
);

// Test Case 7: User B sent messages in last 30 days
console.log("\n\n--- CASE 7: User B sent messages in last 30 days ---");

// True scenario: 14 days has passed since last email notification
const case7TrueMessages = [
  // User B sends a message 25 days ago
  createMessage(
    userB,
    userA,
    "Message from B",
    new Date(baseDate.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString()
  ),
  // User A sends last email notification 15 days ago
  createMessage(
    userA,
    userB,
    "Last notification",
    new Date(baseDate.getTime() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
];

testScenario(
  "Case 7 - True: 14 days has passed since last email notification",
  case7TrueMessages,
  baseDate,
  true
);

// False scenario: Only 10 days has passed since last email notification
const case7FalseMessages = [
  // User B sends a message 25 days ago
  createMessage(
    userB,
    userA,
    "Message from B",
    new Date(baseDate.getTime() - 25 * 24 * 60 * 60 * 1000).toISOString()
  ),
  // User A sends last email notification 10 days ago
  createMessage(
    userA,
    userB,
    "Last notification",
    new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
];

testScenario(
  "Case 7 - False: Only 10 days has passed since last email notification",
  case7FalseMessages,
  baseDate,
  false
);

// Test Case 8: User B hasn't sent any messages in the last 30 days
console.log(
  "\n\n--- CASE 8: User B hasn't sent any messages in the last 30 days ---"
);

const case8Messages = [
  // User B sends a message 35 days ago
  createMessage(
    userB,
    userA,
    "Message from B",
    new Date(baseDate.getTime() - 35 * 24 * 60 * 60 * 1000).toISOString()
  ),
  // User A sends last email notification 10 days ago
  createMessage(
    userA,
    userB,
    "Last notification",
    new Date(baseDate.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    true
  ),
];

testScenario(
  "Case 8: User B hasn't sent any messages in the last 30 days",
  case8Messages,
  baseDate,
  false
);
