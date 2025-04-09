"use client";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/supabase/utils";
import ProfileCreation from "@/components/profile/ProfileCreation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ErrorCard from "@/components/ui/error-card";

export default function ProfileCreationPage() {
  const { user, ready, getAccessToken } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [wasUserChecked, setWasUserChecked] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      if (!ready) return;

      if (!user || !user.wallet?.address) {
        router.push("/");
        return;
      }

      try {
        const token = await getAccessToken();
        if (!token) {
          console.error("Failed to get access token");
          setError(true);
          return;
        }
        setJwt(token);

        const { success, data, error } = await getUser(
          user.wallet.address,
          token
        );

        if (!success && error) {
          setError(true);
        } else if (data) {
          router.push("/matching");
        }

        setWasUserChecked(true);
        setIsLoading(false);
      } catch (error) {
        console.error("Error in checkUser:", error);
        setError(true);
      }
    };

    checkUser();
  }, [user, ready, router]);

  if (!ready || !jwt) {
    return <LoadingSpinner message="Setting up your profile..." />;
  }

  if (error) {
    return <ErrorCard />;
  }

  if (!user || !user.wallet?.address) {
    return null; // This will be handled by the router.push("/") in the useEffect
  }

  return <ProfileCreation jwt={jwt} address={user.wallet.address} />;
}
