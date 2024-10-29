// import { supabase } from "@/lib/supabase/supabase-server";
// import { supabase } from "../../lib/supabase/supabase-server";
const { supabase } = require("../../lib/supabase/supabase-server");

interface UserTelegramData {
  telegram: string | null;
  tg_notification_frequency: number | null;
  tg_matches_count: number;
}

const isValidTelegramHandle = (handle: string): boolean => {
  return /^[a-zA-Z0-9_]{5,32}$/.test(handle);
};

const sendTgMessage = async (user1Address: string, user2Address: string) => {
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
    postToTgApi(user1Data as UserTelegramData, TELEGRAM_BOT_TOKEN),
    postToTgApi(user2Data as UserTelegramData, TELEGRAM_BOT_TOKEN),
  ]);
};

const postToTgApi = async (userData: UserTelegramData, botToken: string) => {
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

const testUser1 = "0x60CC0188283433D4cE368419805A96354Dd497C3"; // deca
const testUser2 = "0x23032A3D92D72a857EB4eB2D9ea417ff103A4008"; // black

const testTgMessage = async () => {
  try {
    await sendTgMessage(testUser1, testUser2);
    console.log("Test successful!");
  } catch (error) {
    console.error("Test failed:", error);
  }
};

testTgMessage();
