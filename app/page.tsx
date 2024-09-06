"use client";
import { useRouter } from "next/navigation";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { K2D } from "next/font/google";
import { useAccount } from "wagmi";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import WorldIDVerification from "@/components/verify";


const k2d = K2D({ weight: "600", subsets: ["latin"] });

export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-background">
      <Card className="w-[350px]">
        <CardContent className="pt-6">
          <h1 className={`text-3xl font-bold text-center text-primary ${k2d.className}`}>Welcome to</h1>
          <h1 className={`text-6xl font-bold text-center text-primary ${k2d.className}`}>DEVLINK!</h1>
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
