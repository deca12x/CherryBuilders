"use client";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { getUser, getUserFilters } from "@/lib/supabase/utils";
import ErrorCard from "@/components/ui/error-card";
import MatchingParent from "@/components/matching/MatchingParent";
import { FiltersProp } from "@/lib/types";

export default function Matching() {
  const { user, ready, getAccessToken } = usePrivy();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const [wasUserChecked, setWasUserChecked] = useState(false);
  const [wasFiltersChecked, setWasFiltersChecked] = useState(false);
  const [filters, setFilters] = useState<FiltersProp>({
    tags: {},
    events: {},
  });

  const address = user?.wallet?.address;

  useEffect(() => {
    const fetchUserFilters = async () => {
      const { success, data, error } = await getUserFilters(jwt);
      if (!success && error) {
        setError(true);
        return;
      }
      setFilters(data!);
      setWasFiltersChecked(true);
    };

    if (wasUserChecked) fetchUserFilters();
  }, [wasUserChecked, jwt]);

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
  } else if (user && address && ready && wasUserChecked && wasFiltersChecked) {
    return <MatchingParent jwt={jwt} address={address} userFilters={filters} />;
  } else {
    return <LoadingSpinner />;
  }
}
