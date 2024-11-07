"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { getUser } from "@/lib/supabase/utils";
import ErrorCard from "@/components/ui/error-card";
import MiniProfileCard from "@/components/landing/miniProfileCard";
import { LANDING_PROFILES } from "@/lib/landing/data";
import WelcomeCard from "@/components/landing/welcomeCard";
import useCardFloating from "@/hooks/useCardFloating";
import useWindowSize from "@/hooks/useWindowSize";

export default function Home() {
  // Third-party hooks
  const { user, ready, getAccessToken } = usePrivy();
  const router = useRouter();

  // State hooks
  const [error, setError] = useState(false);
  const [jwt, setJwt] = useState<string | null>("");

  // Derived state
  const address = user?.wallet?.address;
  const isAuthenticated = !!(user && address && ready && jwt);

  const { width, height } = useWindowSize();

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

  // Hooks that depend on state
  const nodes = useCardFloating({
    count: 8,
    width,
    height,
  });

  // Early returns
  if (error) {
    return <ErrorCard />;
  }

  // Render
  return (
    <main className="fixed inset-0 flex flex-col items-center justify-center bg-background overflow-hidden">
      <WelcomeCard isAuthenticated={isAuthenticated} />
      {nodes.map((node) => (
        <div
          key={node.index}
          style={{
            position: "absolute",
            left: `${node.x}px`,
            top: `${node.y}px`,
            transform: "translate(-50%, -50%)",
          }}
        >
          <MiniProfileCard profile={LANDING_PROFILES[node.index]} />
        </div>
      ))}
    </main>
  );
}
