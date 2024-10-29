import { supabase } from "@/lib/supabase/supabase-server";

export const sendTgMessage = async (
  user1Address: string,
  user2Address: string
) => {
  // Get users' telegram handles
  const { data: user1Data } = await supabase
    .from("users")
    .select("telegram_id")
    .eq("evm_address", user1Address)
    .single();

  const { data: user2Data } = await supabase
    .from("users")
    .select("telegram_id")
    .eq("evm_address", user2Address)
    .single();

  if (!user1Data?.telegram_id || !user2Data?.telegram_id) {
    throw new Error("One or both users have not connected Telegram");
  }

  const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

  // Send match notification to both users
  await Promise.all([
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: user1Data.telegram_id,
        text: "🍒 You have a new match! 🎉 Go to cherry.builders to find out who it is",
      }),
    }),
    fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: user2Data.telegram_id,
        text: "🍒 You have a new match! 🎉 Go to cherry.builders to find out who it is",
      }),
    }),
  ]);
};
