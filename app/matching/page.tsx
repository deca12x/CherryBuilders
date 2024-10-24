"use client";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { getUser } from "@/lib/supabase/utils";
import ErrorCard from "@/components/ui/error-card";
import MatchingParent from "@/components/matching/MatchingParent";

export default function Matching() {
  const { user, ready, getAccessToken } = usePrivy();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const [wasUserChecked, setWasUserChecked] = useState(false);

  const address = user?.wallet?.address;

  useEffect(() => {
    const checkUser = async () => {
      if (!ready) return;

      if (!user || !address) {
        router.push("/");
        return;
      }

      const token = await getAccessToken();
      setJwt(token);

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
  }, [user, ready, router, address]);

  if (error) {
    return <ErrorCard />;
  } else if (user && address && ready && wasUserChecked) {
    return <MatchingParent jwt={jwt} address={address} />;
  } else {
    return <LoadingSpinner />;
  }
}
