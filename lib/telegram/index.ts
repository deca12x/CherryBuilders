import { supabase } from "@/lib/supabase/supabase-server";

interface UserTelegramData {
  telegram: string | null;
  tg_notification_frequency: number | null;
  tg_matches_count: number;
}

export const sendTgMessage = async (
  user1Address: string,
  user2Address: string
) => {
  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error("TELEGRAM_BOT_TOKEN not found in environment variables");
  }
  // Get users' data including notification preferences
  const { data: user1Data } = await supabase
    .from("users")
    .select("telegram, tg_notification_frequency, tg_matches_count")
    .eq("evm_address", user1Address)
    .single();

  const { data: user2Data } = await supabase
    .from("users")
    .select("telegram, tg_notification_frequency, tg_matches_count")
    .eq("evm_address", user2Address)
    .single();

  if (!user1Data?.telegram || !user2Data?.telegram) {
    throw new Error("One or both users have not connected Telegram");
  }

  // Send appropriate message based on whether it's their first match
  await Promise.all([
    sendUserNotification(user1Data as UserTelegramData, TELEGRAM_BOT_TOKEN),
    sendUserNotification(user2Data as UserTelegramData, TELEGRAM_BOT_TOKEN),
  ]);
};

const sendUserNotification = async (
  userData: UserTelegramData,
  botToken: string
) => {
  // First time user
  if (userData.tg_notification_frequency === null) {
    return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: userData.telegram,
        text: "🍒 Congratulations on your first Cherry match!",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Every Match", callback_data: "freq_1" },
              { text: "Every 3", callback_data: "freq_3" },
              { text: "Every 10", callback_data: "freq_10" },
              { text: "Never", callback_data: "freq_0" },
            ],
          ],
        },
      }),
    });
  }

  // Regular notification
  return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: userData.telegram,
      text: "🍒 You have a new match! 🎉 Go to cherry.builders to find out who it is",
    }),
  });
};
