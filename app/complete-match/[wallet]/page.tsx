"use client";
import { useEffect, useMemo } from "react";
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

  // initiatorWallet is user A's wallet (the one who initiated)
  const initiatorWallet = params.wallet as string;
  // responderWallet is user B's wallet (the one completing the match)
  const responderWallet = useMemo(
    () => user?.wallet?.address,
    [user?.wallet?.address]
  );

  useEffect(() => {
    let isExecuting = false;

    const completeMatch = async () => {
      if (isExecuting) return;
      isExecuting = true;
      if (!ready) {
        return;
      }

      if (!responderWallet) {
        router.push("/" + "?initiatorAddress=" + initiatorWallet);
        return;
      }

      if (!initiatorWallet) {
        router.push("/matching");
        return;
      }

      try {
        const jwt = await getAccessToken();

        if (!jwt) {
          console.error("No JWT available");
          router.push("/");
          return;
        }

        // Check if there's a partial match
        const partialMatch = await getPartialMatch(
          initiatorWallet,
          responderWallet,
          jwt
        );

        if (!partialMatch.success || !partialMatch.data?.length) {
          router.push("/matching");
          return;
        }

        // Complete the match
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
        const newChat = await createChat(responderWallet, initiatorWallet, jwt);

        if (!newChat.success) {
          console.error("Failed to create chat", newChat.error);
          throw new Error(newChat.error);
        }

        // Get the chat ID
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
        const otherUserData = await getUser(initiatorWallet, jwt);
        const myUserData = await getUser(responderWallet, jwt);

        if (
          otherUserData.success &&
          otherUserData.data?.emailNotifications &&
          myUserData.success
        ) {
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

        // Make sure we have a valid chat ID before redirecting
        if (specificChat.data?.id) {
          console.log("Redirecting to chat:", specificChat.data.id);
          // Use replace instead of push for a cleaner navigation
          router.replace(`/chat?chatId=${specificChat.data.id}`);
        } else {
          console.error("No chat ID available for redirection");
          router.push("/matching");
        }
      } catch (error) {
        console.error("Error completing match:", error);
        router.push("/matching");
      }
    };

    completeMatch();
  }, [ready, responderWallet, initiatorWallet, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoadingSpinner message="Processing match..." />
    </div>
  );
}
