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

  // otherUserWallet is user A's wallet (the one who initiated)
  const otherUserWallet = params.wallet as string;
  // myWallet is user B's wallet (the one completing the match)
  const myWallet = user?.wallet?.address;

  useEffect(() => {
    const completeMatch = async () => {
      if (!ready) {
        console.log("Privy not ready");
        return;
      }

      if (!myWallet) {
        console.log("No wallet found, redirecting to login");
        router.push("/");
        return;
      }

      if (!otherUserWallet) {
        console.log("No other wallet address found in URL");
        router.push("/matching");
        return;
      }

      try {
        console.log("Starting match completion process", {
          myWallet,
          otherUserWallet,
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
          otherUserWallet,
          myWallet,
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
          otherUserWallet,
          myWallet,
          true,
          jwt
        );
        if (!updatedMatch.success) {
          console.error("Failed to update match", updatedMatch.error);
          throw new Error(updatedMatch.error);
        }

        // Create a chat
        console.log("Creating chat");
        const newChat = await createChat(myWallet, otherUserWallet, jwt);
        if (!newChat.success) {
          console.error("Failed to create chat", newChat.error);
          throw new Error(newChat.error);
        }

        // Get the chat ID
        console.log("Getting chat ID");
        const specificChat = await getSpecificChat(
          myWallet,
          otherUserWallet,
          jwt
        );
        if (!specificChat.success) {
          console.error("Failed to get chat", specificChat.error);
          throw new Error(specificChat.error);
        }

        // Check if other user has email notifications on and send email if they do
        console.log("Checking other user's email preferences");
        const otherUserData = await getUser(otherUserWallet, jwt);
        const myUserData = await getUser(myWallet, jwt);

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
            matchedWithAddress: myWallet,
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
  }, [ready, myWallet, otherUserWallet, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary to-secondary">
      <LoadingSpinner />
    </div>
  );
}
