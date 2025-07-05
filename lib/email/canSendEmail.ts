import { ChatMessageType } from "@/lib/supabase/types";

/**
 * Determines if a user can send an email notification based on complex rules
 *
 * Rules:
 * 1. If user A has not sent any email notification yet, then they can send one
 * 2. If user B has sent any 2 messages at least 3h apart from each other, in the last 2 days,
 *    then user A can send an email notification 12h after their last one
 * 3. If user B has sent any message in the last 3 days AND user B has sent any message after
 *    user A's last email notification, then user A can send an email notification 24h after their last one
 * 4. If user B has sent any message in the last 7 days AND user B has sent any message after
 *    user A's second-to-last email notification, then user A can send an email notification 48h after their last one
 * 5. If user B has sent any message in the last 14 days AND user B has sent any message after
 *    user A's third-to-last email notification, then user A can send an email notification 72h after their last one
 * 6. If user B has sent any message in the last 14 days, then user A can send an email notification 7 days after their last one
 * 7. If user B has sent any message in the last 30 days, then user A can send an email notification 14 days after their last one
 * 8. Otherwise, user A cannot send an email notification
 *
 * @param messages - All messages in the chat
 * @param userAddress - The address of the current user (user A)
 * @param otherUserAddress - The address of the other user (user B)
 * @returns An object indicating if the user can send an email notification and the reason
 */
export function canSendEmail(
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
          reason: `Need to wait ${hoursToWait} more hours, unless they write back`,
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
