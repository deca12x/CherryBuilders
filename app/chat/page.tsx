"use client";
import ChatParentNoChat from "@/components/chat/ChatParentNoChat";
import { usePrivy } from "@privy-io/react-auth";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/supabase/utils";

export default function ChatUI() {
  const { user, ready, getAccessToken } = usePrivy();
  const router = useRouter();
  const [error, setError] = useState(false);

  const address = user?.wallet?.address;

  useEffect(() => {
    const fetchExistingProfile = async () => {
      if (!ready) return;

      const jwt = await getAccessToken();

      // If no address or no user are found, push the user to log in
      if (!user || !address) {
        router.push("/");
        return;
      }

      // If no error occurs but the user is not in the database
      // push it toward the profile creation page
      const { success, data, error } = await getUser(address, jwt);
      if (!success && error) {
        setError(true);
        return;
      } else if (!data) {
        router.push("/profile/creation");
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
    return <ChatParentNoChat userAddress={address as string} />;
  } else {
    return <LoadingSpinner />;
  }
}
