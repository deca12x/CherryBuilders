'use client';
import { ConnectButton } from "@rainbow-me/rainbowkit";

export default function ChatHeader({ name }: { name: string }) {
  return (
    <div className="p-4 border-b border-border bg-card">
      <h2 className="text-sm font-semibold truncate mb-2 hidden lg:block">{name}</h2>
      <ConnectButton />
    </div>
  )
}