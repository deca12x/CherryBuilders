"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { K2D } from "next/font/google";
import { Card, CardContent } from "@/components/ui/card";
import ConnectButton from "@/components/ui/connectButton";
import { useAccount } from "wagmi";
import { usePrivy } from "@privy-io/react-auth";
import { isUserInDatabase } from "@/lib/supabase/utils";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

export default function Home() {
  const { user, ready } = usePrivy();
  const router = useRouter();

  const [error, setError] = useState(false);

  const address = user?.wallet?.address;

  useEffect(() => {
    const checkUser = async () => {
      if (!address || !user || !ready) return;
      const { data, error } = await isUserInDatabase(address);
      if (error) {
        setError(true);
      } else if (data) {
        router.push("/matching");
      } else {
        router.push("/profile/creation?newUser=true");
      }
    };

    checkUser();
  }, [address, router, user, ready]);

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
        <div className="text-primary text-2xl">An unexpected error occured, please try again!</div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <Card className="sm:max-w-xl">
        <CardContent className="pt-6">
          <h1 className={`text-3xl font-bold text-center text-primary ${k2d.className}`}>Welcome to</h1>
          <h1 className={`text-5xl sm:text-6xl font-bold text-center text-primary ${k2d.className}`}>Cherry 🍒</h1>
          <div className="flex flex-col justify-center items-center mt-8 gap-3">
            <ConnectButton />
            <p className="text-sm text-center text-muted-foreground mt-4">
              Cherry is currently under development, use at your own discretion
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
