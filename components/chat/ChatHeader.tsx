"use client";
import { usePrivy } from "@privy-io/react-auth";

export default function ChatHeader({ name }: { name: string }) {
  const { user } = usePrivy();
  return (
    <div className="p-4 border-b border-border bg-card">
      <h2 className="text-lg font-semibold truncate mb-2 hidden lg:block">{name}</h2>
      {/* {user?.wallet?.address} */}
    </div>
  );
}
