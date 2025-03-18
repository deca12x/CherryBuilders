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

  useEffect(() => {
    const checkUser = async () => {
      if (!ready) return;

      if (!user || !user.wallet?.address) {
        router.push("/");
        return;
      }

      const token = await getAccessToken();
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
    };

    checkUser();
  }, [user, ready, router]);

  useEffect(() => {
    const fetchAirstackProfile = async () => {
      const response = await fetch("/api/airstack/user", {
        method: "GET",
        headers: { Authorization: `Bearer ${jwt}` },
      });
      const { data } = await response.json();
      setUserProfile(response.ok ? data : null);
      setIsLoading(false);
    };

    if (wasUserChecked) fetchAirstackProfile();
  }, [wasUserChecked, jwt]);

  if (isLoading || !jwt) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorCard />;
  }

  if (!user || !user.wallet?.address) {
    return null; // This will be handled by the router.push("/") in the useEffect
  }

  return (
    <ProfileCreation
      jwt={jwt}
      address={user.wallet.address}
      userProfile={userProfile}
    />
  );
}
