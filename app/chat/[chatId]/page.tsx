"use client";
import ChatParent from "@/components/chat/ChatParent";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { getUser } from "@/lib/supabase/utils";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ErrorCard from "@/components/ui/error-card";

export default function ChatUI() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { user, ready, getAccessToken } = usePrivy();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const [wasUserChecked, setWasUserChecked] = useState(false);

  const address = user?.wallet?.address;

  useEffect(() => {
    const checkUser = async () => {
      if (!ready) return;

      // If no address or no user are found, push the user to log in
      if (!user || !address) {
        router.push("/");
        return;
      }

      const token = await getAccessToken();
      setJwt(token);

      // If no error occurs but the user is not in the database
      // push it toward the profile creation page
      const { success, data, error } = await getUser(address, token);
      if (!success && error) {
        setError(true);
        return;
      } else if (!data) {
        router.push("/profile/creation");
        return;
      }
      setWasUserChecked(true);
    };

    checkUser();
  }, [user, ready, router]);

  if (error) {
    return <ErrorCard />;
  } else if (address && user && ready && wasUserChecked) {
    return <ChatParent userAddress={address as string} chatId={chatId} authToken={jwt} />;
  } else {
    return <LoadingSpinner />;
  }
}
