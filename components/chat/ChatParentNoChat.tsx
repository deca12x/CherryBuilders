"use client";

import React from "react";
import ChatSidebar from "@/components/chat/ChatSideBar";
import { ChatParentProps } from "@/lib/types";

export default function ChatParentNoChat({ userAddress }: Omit<ChatParentProps, 'chatId'>) {
  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar userAddress={userAddress} />
      <div className="flex-1 flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <p className="text-xl text-gray-500">
            Click on a chat to start
          </p>
        </div>
      </div>
    </div>
  );
}