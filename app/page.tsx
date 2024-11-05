"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { getUser } from "@/lib/supabase/utils";
import ErrorCard from "@/components/ui/error-card";
import MiniProfileCard from "@/components/landing/miniProfileCard";
import { LANDING_PROFILES } from "@/lib/landing/data";
import WelcomeCard from "@/components/landing/welcomeCard";
export default function Home() {
  const { user, ready, getAccessToken } = usePrivy();
  const router = useRouter();

  const [error, setError] = useState(false);
  const [jwt, setJwt] = useState<string | null>("");

  const address = user?.wallet?.address;
  const isAuthenticated = !!(user && address && ready && jwt);

  useEffect(() => {
    const checkUser = async () => {
      if (!address || !user || !ready) return;

      // setting the jwt as a state variable to avoid stale closure
      const token = await getAccessToken();
      setJwt(token);

      // check if the user exists in the database
      const { success, data, error } = await getUser(address, token);

      // if the user is not found, redirect to the profile creation page
      // if the user is found, redirect to the matching page
      if (!success && error) {
        setError(true);
      } else if (data) {
        router.push("/matching");
      } else {
        router.push("/profile/creation");
      }
    };

    checkUser();
  }, [address, router, user, ready]);

  if (error) {
    return <ErrorCard />;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center sm:p-24 p-3 bg-background">
      <WelcomeCard isAuthenticated={isAuthenticated} />
      <MiniProfileCard profile={LANDING_PROFILES[0]} />
    </main>
  );
}
