"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { K2D } from "next/font/google";
import { useAccount } from "wagmi";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WorldIDVerification from "@/components/verify";
import { createClient } from "@supabase/supabase-js";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

// Initialize Supabase client using environment variables
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

export default function Home() {
  const { address } = useAccount();
  const router = useRouter();

  useEffect(() => {
    const checkAddress = async () => {
      if (address) {
        try {
          const { data, error } = await supabase
            .from("UserData")
            .select("evmAddress")
            .eq("evmAddress", address)
            .single();

          if (error) throw error;

          if (data) {
            router.push("/matching");
          } else {
            router.push("/profile");
          }
        } catch (error) {
          console.error("Error checking address:", error);
        }
      }
    };

    checkAddress();
  }, [address, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <Card className="w-[350px]">
        <CardContent className="pt-6">
          <h1
            className={`text-3xl font-bold text-center text-primary ${k2d.className}`}
          >
            Welcome to
          </h1>
          <h1
            className={`text-6xl font-bold text-center text-primary ${k2d.className}`}
          >
            DEVLINK!
          </h1>
          <div className="flex flex-col justify-center items-center mt-8 gap-3">
            <DynamicWidget />
            <WorldIDVerification />
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          {address && (
            <Button variant="default" onClick={() => router.push("/test")}>
              Launch App
            </Button>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
