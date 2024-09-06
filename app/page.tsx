"use client";
import { useRouter } from "next/navigation";
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";
import { K2D } from "next/font/google";
import { useAccount } from "wagmi";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

export default function Home() {
  const { address, isConnected, chain } = useAccount();
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-diagonal-gradient">
      <h1 className={`text-3xl font-bold text-center text-white ${k2d.className}`}>Welcome to</h1>
      <h1 className={`text-6xl font-bold text-center text-white ${k2d.className}`}>DEVLINK!</h1>
      <div className="flex flex-col justify-center items-center mt-8 gap-3">
        <DynamicWidget />
        {address ? (
          <button className="rounded-md bg-white text-center text-black py-2 px-4" onClick={() => router.push("/test")}>
            Launch App
          </button>
        ) : null}
      </div>
    </main>
  );
}
