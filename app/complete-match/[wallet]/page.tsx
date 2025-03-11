"use client";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter, useParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  getPartialMatch,
  updateMatch,
  createChat,
  getSpecificChat,
  getUser,
} from "@/lib/supabase/utils";
import { sendMatchingEmail } from "@/lib/email/sendMatchingEmail";

export default function CompleteMatch() {
  const { user, ready, getAccessToken } = usePrivy();
  const router = useRouter();
  const params = useParams();
  const [isProcessing, setIsProcessing] = useState(true);

  // initiatorWallet is user A's wallet (the one who initiated)
  const initiatorWallet = params.wallet as string;
  // responderWallet is user B's wallet (the one completing the match)
  const responderWallet = user?.wallet?.address;

  useEffect(() => {
    const completeMatch = async () => {
      if (!ready) {
        console.log("Privy not ready");
        return;
      }

      if (!responderWallet) {
        console.log("No wallet found, redirecting to login");
        router.push("/");
        return;
      }

      if (!initiatorWallet) {
        console.log("No other wallet address found in URL");
        router.push("/matching");
        return;
      }

      try {
        console.log("Starting match completion process", {
          responderWallet,
          initiatorWallet,
        });
        const jwt = await getAccessToken();

        if (!jwt) {
          console.error("No JWT available");
          router.push("/");
          return;
        }

        // Check if there's a partial match
        console.log("Checking for partial match");
        const partialMatch = await getPartialMatch(
          initiatorWallet,
          responderWallet,
          jwt
        );

        if (!partialMatch.success || !partialMatch.data?.length) {
          console.log("No partial match found", partialMatch);
          router.push("/matching");
          return;
        }

        // Complete the match
        console.log("Completing match");
        const updatedMatch = await updateMatch(
          initiatorWallet,
          responderWallet,
          true,
          jwt
        );
        if (!updatedMatch.success) {
          console.error("Failed to update match", updatedMatch.error);
          throw new Error(updatedMatch.error);
        }

        // Create a chat
        console.log("Creating chat");
        const newChat = await createChat(responderWallet, initiatorWallet, jwt);
        if (!newChat.success) {
          console.error("Failed to create chat", newChat.error);
          throw new Error(newChat.error);
        }

        // Get the chat ID
        console.log("Getting chat ID");
        const specificChat = await getSpecificChat(
          responderWallet,
          initiatorWallet,
          jwt
        );
        if (!specificChat.success) {
          console.error("Failed to get chat", specificChat.error);
          throw new Error(specificChat.error);
        }

        // Check if other user has email notifications on and send email if they do
        console.log("Checking other user's email preferences");
        const otherUserData = await getUser(initiatorWallet, jwt);
        const myUserData = await getUser(responderWallet, jwt);

        if (
          otherUserData.success &&
          otherUserData.data?.emailNotifications &&
          myUserData.success
        ) {
          console.log("Sending email notification to other user");
          await sendMatchingEmail({
            matchedWith: myUserData.data?.name || "Someone",
            matchedWithImage: myUserData.data?.profile_pictures[0] || "",
            matchedWithBio: myUserData.data?.bio || "",
            matchedWithBuilding: myUserData.data?.building || "",
            matchedWithLookingFor: myUserData.data?.looking_for || "",
            matchedWithAddress: responderWallet,
            chatLink: `https://cherry.builders/chat?chatId=${specificChat.data?.id}`,
            receiverEmail: otherUserData.data.email || "",
            jwt,
            isMatchComplete: true,
          });
        }

        // Redirect to chat
        console.log("Redirecting to chat", specificChat.data?.id);
        router.push(`/chat?chatId=${specificChat.data?.id}`);
      } catch (error) {
        console.error("Error completing match:", error);
        router.push("/matching");
      }
    };

    completeMatch();
  }, [ready, responderWallet, initiatorWallet, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-secondary">
      <LoadingSpinner />
    </div>
  );
}
