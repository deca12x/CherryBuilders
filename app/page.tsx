"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { getUser } from "@/lib/supabase/utils";
import ErrorCard from "@/components/ui/error-card";
import MiniProfileCard from "@/components/landing/miniProfileCard";
import { LANDING_PROFILES } from "@/lib/landing/data";
import WelcomeCard from "@/components/landing/welcomeCard";
import useWindowSize from "@/hooks/useWindowSize";
import useCardFloating from "@/hooks/useCardFloating";
import { SafeZone } from "@/lib/landing/types";

export default function Home() {
  // Third-party hooks
  const { user, ready, getAccessToken } = usePrivy();
  const router = useRouter();

  // Refs
  const welcomeCardRef = useRef<HTMLDivElement>(null);

  // State hooks
  const [error, setError] = useState(false);
  const [jwt, setJwt] = useState<string | null>("");
  const [safeZone, setSafeZone] = useState<SafeZone>({
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  });

  // Custom hooks
  const { width, height } = useWindowSize();

  // Derived state
  const address = user?.wallet?.address;
  const isAuthenticated = !!(user && address && ready && jwt);

  // Effects
  useEffect(() => {
    const checkUser = async () => {
      if (!address || !user || !ready) return;

      const token = await getAccessToken();
      setJwt(token);

      const { success, data, error } = await getUser(address, token);

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

  useEffect(() => {
    if (welcomeCardRef.current) {
      const rect = welcomeCardRef.current.getBoundingClientRect();
      setSafeZone({
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
      });
    }
  }, [width, height]);

  // Hooks that depend on state
  const nodes = useCardFloating({
    count: LANDING_PROFILES.length,
    width,
    height,
    safeZone,
  });

  // Early returns
  if (error) {
    return <ErrorCard />;
  }

  // Render
  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center bg-background overflow-hidden">
      <WelcomeCard ref={welcomeCardRef} isAuthenticated={isAuthenticated} />
      {nodes.map((node) => (
        <div
          key={node.index}
          style={{
            position: "absolute",
            left: `${node.x}px`,
            top: `${node.y}px`,
          }}
        >
          <MiniProfileCard profile={LANDING_PROFILES[node.index]} />
        </div>
      ))}
    </main>
  );
}
