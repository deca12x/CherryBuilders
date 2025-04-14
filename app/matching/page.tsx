"use client";
import { useEffect, useState } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/supabase/utils"; // Add this import
import LoadingSpinner from "@/components/ui/loading-spinner";
import ErrorCard from "@/components/ui/error-card";
import MatchingParent from "@/components/matching/MatchingParent";
import { FiltersProp } from "@/lib/types";
import { UserType, EventType } from "@/lib/supabase/types";
import EventDialog2Events from "@/components/promo/EventDialog2Events";
import { ALL_EVENTS } from "@/lib/supabase/eventData";

export default function Matching() {
  const { user, ready, getAccessToken } = usePrivy();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const [wasUserChecked, setWasUserChecked] = useState(false);
  const [filters, setFilters] = useState<FiltersProp>({
    tags: {
      "Frontend dev": false,
      "Backend dev": false,
      "Smart contract dev": false,
      Designer: false,
      "Talent scout": false,
      "Biz dev": false,
      Artist: false,
      "Here for the lolz": false,
    },
    events: Object.fromEntries(
      ALL_EVENTS.map((event) => [
        event.slug,
        {
          name: event.name,
          selected: false,
        },
      ])
    ),
  });

  const [loggedInUserData, setLoggedInUserData] = useState<UserType | null>(
    null
  );
  const [showEventDialog, setShowEventDialog] = useState(true);

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
      setLoggedInUserData(data);
    };

    checkUser();
  }, [user, ready, router, address]);

  useEffect(() => {
    // Check if user has dismissed the dialog before
    const hasSeenEventDialog = localStorage.getItem("hasSeenEventDialog");
    if (hasSeenEventDialog) {
      setShowEventDialog(false);
    }
  }, []);

  const handleDontShowAgain = () => {
    localStorage.setItem("hasSeenEventDialog", "true");
    setShowEventDialog(false);
  };

  if (error) {
    return <ErrorCard />;
  } else if (user && address && ready && wasUserChecked) {
    return (
      <>
        <MatchingParent
          jwt={jwt}
          address={address}
          userFilters={filters}
          loggedInUserData={loggedInUserData}
        />
        {/* {showG22Dialog && <G22Dialog onDontShowAgain={handleDontShowAgain} />} */}
        {showEventDialog && (
          <EventDialog2Events onDontShowAgain={handleDontShowAgain} />
        )}
      </>
    );
  } else {
    return <LoadingSpinner message="Loading matching system..." />;
  }
}
