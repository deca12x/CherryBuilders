"use client";
import ChatParent from "@/components/chat/ChatParent";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { isUserInDatabase } from "@/lib/supabase/utils";
import LoadingSpinner from "@/components/loadingSpinner";

export default function ChatUI() {
  const params = useParams();
  const chatId = params.chatId as string;
  const { user, ready } = usePrivy();
  const router = useRouter();
  const [error, setError] = useState(false);

  const address = user?.wallet?.address;

  useEffect(() => {
    const fetchExistingProfile = async () => {
      if (!ready) return;

      // If no address or no user are found, push the user to log in
      if (!user || !address) {
        router.push("/");
        return;
      }

      // If no error occurs but the user is not in the database
      // push it toward the profile creation page
      const { data, error } = await isUserInDatabase(address);
      if (error) {
        setError(true);
        return;
      } else if (!data) {
        router.push("profile/creation");
        return;
      }
    };

    fetchExistingProfile();
  }, [address, user, ready, router]);

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-primary text-2xl">
        An unexpected error occured, please try again!
      </div>
    );
  } else if (address && user && ready) {
    return <ChatParent userAddress={address as string} chatId={chatId} />;
  } else {
    return <LoadingSpinner />;
  }
}
