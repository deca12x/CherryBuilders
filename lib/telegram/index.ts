import { supabase } from "@/lib/supabase/supabase-server";
interface UserTgData {
  tgHandle: string | null;
  tgFrequencyPreference: number | null;
  tgMatchCount: number;
}

const isValidTgHandle = (handle: string): boolean => {
  return /^[a-zA-Z0-9_]{5,32}$/.test(handle);
};

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
    .select("tgHandle, tgFrequencyPreference, tgMatchCount")
    .eq("evm_address", user1Address)
    .single();

  // const { data: user2Data } = await supabase
  //   .from("users")
  //   .select("tgHandle, tgFrequencyPreference, tgMatchCount")
  //   .eq("evm_address", user2Address)
  //   .single();

  // if (!user1Data?.tgHandle || !user2Data?.tgHandle) {
  //   throw new Error("One or both users have not connected Telegram");
  // }

  await Promise.all([
    postToTgApi(user1Data as UserTgData, TELEGRAM_BOT_TOKEN),
    // postToTgApi(user2Data as UserTgData, TELEGRAM_BOT_TOKEN),
  ]);
};

const postToTgApi = async (userData: UserTgData, botToken: string) => {
  // First time user
  if (userData.tgFrequencyPreference === null) {
    return fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: userData.tgHandle,
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
      chat_id: userData.tgHandle,
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
