"use client";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter, useSearchParams } from "next/navigation";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { getUser, getSpecificUser } from "@/lib/supabase/utils";
import ErrorCard from "@/components/ui/error-card";
import { FiltersProp } from "@/lib/types";
import { UserType } from "@/lib/supabase/types";
import MatchingParentIcebreaker from "@/components/matching/MatchingParentIcebreaker";

export default function MatchingIcebreaker() {
  const { user, ready, getAccessToken } = usePrivy();
  const router = useRouter();
  const searchParams = useSearchParams();

  const profileAddress = searchParams.get("profile");
  const icebreakerMessage = searchParams.get("message");

  const [error, setError] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const [loggedInUserData, setLoggedInUserData] = useState<UserType | null>(
    null
  );
  const [specificUser, setSpecificUser] = useState<UserType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const address = user?.wallet?.address;

  // Default empty filters since we're showing a specific user
  const emptyFilters: FiltersProp = {
    tags: {},
    events: {},
  };

  useEffect(() => {
    const init = async () => {
      if (!ready) return;

      if (!user || !address) {
        router.push("/");
        return;
      }

      const token = await getAccessToken();
      setJwt(token);

      // Get logged in user data
      const { success, data, error } = await getUser(address, token);
      if (!success && error) {
        setError(true);
        return;
      } else if (!data) {
        router.push("/profile/creation");
        return;
      }
      setLoggedInUserData(data);

      // Get specific user data
      if (profileAddress && token) {
        const specificUserResult = await getSpecificUser(profileAddress, token);
        if (specificUserResult.success && specificUserResult.data) {
          setSpecificUser(specificUserResult.data);
        } else {
          setError(true);
        }
      }

      setIsLoading(false);
    };

    init();
  }, [user, ready, router, address, profileAddress]);

  if (error) {
    return <ErrorCard />;
  }

  if (isLoading || !jwt || !address) {
    return <LoadingSpinner />;
  }

  return (
    <MatchingParentIcebreaker
      jwt={jwt}
      address={address}
      loggedInUserData={loggedInUserData}
      specificUser={specificUser}
      icebreakerMessage={icebreakerMessage}
      onComplete={() => router.push("/matching")}
    />
  );
}
