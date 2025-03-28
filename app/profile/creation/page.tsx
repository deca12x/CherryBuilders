"use client";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/supabase/utils";
import ProfileCreation from "@/components/profile/ProfileCreation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ErrorCard from "@/components/ui/error-card";
import { ProfileQuery } from "@/lib/airstack/types";

export default function ProfileCreationPage() {
  const { user, ready, getAccessToken } = usePrivy();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);
  const [wasUserChecked, setWasUserChecked] = useState(false);
  const [userProfile, setUserProfile] = useState<ProfileQuery | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const router = useRouter();

  // First useEffect: Check user and get JWT
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
        setIsLoading(false); // Show form immediately after user check
      } catch (error) {
        console.error("Error in checkUser:", error);
        setError(true);
      }
    };

    checkUser();
  }, [user, ready, router]);

  // Second useEffect: Fetch Airstack data only if user has Farcaster
  useEffect(() => {
    const fetchAirstackProfile = async () => {
      if (!jwt) return; // Don't fetch if no JWT

      // Only fetch if user has Farcaster as a login method
      const hasFarcaster = user?.linkedAccounts?.some(
        (account) => account.type === "farcaster"
      );

      if (!hasFarcaster) {
        setUserProfile(null);
        return;
      }

      try {
        const response = await fetch("/api/airstack/user", {
          method: "GET",
          headers: { Authorization: `Bearer ${jwt}` },
        });

        if (!response.ok) {
          console.error("Airstack API error:", response.status);
          setUserProfile(null);
          return;
        }

        const { data } = await response.json();
        setUserProfile(data);
      } catch (error) {
        console.error("Error fetching Airstack profile:", error);
        setUserProfile(null);
      }
    };

    if (wasUserChecked && jwt) {
      fetchAirstackProfile();
    }
  }, [wasUserChecked, jwt, user?.linkedAccounts]);

  if (!ready || !jwt) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorCard />;
  }

  if (!user || !user.wallet?.address) {
    return null;
  }

  return (
    <ProfileCreation
      jwt={jwt}
      address={user.wallet.address}
      userProfile={userProfile}
    />
  );
}
