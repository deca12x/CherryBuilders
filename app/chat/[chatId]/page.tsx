'use client';

import ChatParent from "@/components/chat/ChatParent";
import NotAuthenticated from "@/components/NotAuthenticated";
import { useAccount } from "wagmi";
import { useParams } from 'next/navigation';
import { useEffect } from "react";
import BottomNavigationBar from "@/components/navbar/BottomNavigationBar";

export default function ChatUI() {
  const { address } = useAccount();
  const params = useParams();
  const chatId = params.chatId as string;


  return (
    <>
      {address ? (
        <div>
        <ChatParent userAddress={address as string} chatId={chatId} />
    
        </div>
      ) : (
        <NotAuthenticated />
      )}
    </>
  );
}