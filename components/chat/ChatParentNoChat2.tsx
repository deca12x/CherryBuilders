"use client";
import React, { useState, useEffect, useRef } from "react";
import { createSupabaseClient } from "@/lib/supabase/supabase-client";
import { getChatsFromUserAddress, getLastChatMessage, getUser } from "@/lib/supabase/utils";
import { useRouter } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { ChatItem } from "../chat2/ChatParent2";

interface ChatParentNoChat2Props {
  userAddress: string;
  authToken: string | null;
}

export default function ChatParentNoChat2({ authToken, userAddress }: ChatParentNoChat2Props) {
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const chatsRef = useRef<any>(null);
  const router = useRouter();

  // Create Supabase client
  useEffect(() => {
    const initSupabase = async () => {
      const client = await createSupabaseClient(userAddress, authToken as string);
      setSupabaseClient(client);
    };

    initSupabase();
  }, [userAddress]);

  // Setup realtime subscription and fetch chats
  useEffect(() => {
    const setupRealtimeSubscription = () => {
      if (!supabaseClient) return;

      chatsRef.current = supabaseClient
        .channel(`chat:messages:${userAddress}`, {
          config: { broadcast: { ack: true }, presence: { key: userAddress } }
        })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            filter: `sender=neq.${userAddress}`,
          },
          (payload: any) => {
            const newMessage = payload.new;
            const chatId = newMessage.chat_id.toString();

            const newLastMessage = {
              text: newMessage.message,
              date: newMessage.created_at,
              fromAddress: newMessage.sender,
            };

            const targetChat = chatHistory.find((chatItem) => chatItem.id === chatId);
            const newChatMessages = targetChat?.fetchedMessages ? [...targetChat.chatMessages, newMessage] : [];

            setChatHistory((prevHistory) => {
              return prevHistory.map((chatItem) => {
                if (chatItem.id === chatId) {
                  return {
                    ...chatItem,
                    lastMessage: newLastMessage,
                    chatMessages: newChatMessages,
                  };
                }
                return chatItem;
              });
            });
          }
        )
        .subscribe(async (status: string, err?: Error) => {
          if (err) {
            console.error("Subscription error:", err);
          } else {
            console.log("Subscription status:", status);
          }
        });
    };

    const fetchChats = async () => {
      if (!supabaseClient) return;
      setIsLoading(true);

      const { success, data: chatsData, error } = await getChatsFromUserAddress(userAddress, authToken);
      
      if (success && chatsData) {
        const chatItems = await Promise.all(
          chatsData.map(async (chat: any) => {
            const otherUserAddress = chat.user_1 === userAddress ? chat.user_2 : chat.user_1;
            const { data: userData } = await getUser(otherUserAddress, authToken);
            const { data: lastMessageData } = await getLastChatMessage(chat.id.toString(), authToken);

            return {
              id: chat.id.toString(),
              lastMessage: {
                text: lastMessageData?.message || "No messages yet",
                date: lastMessageData?.created_at || "",
                fromAddress: lastMessageData?.sender || "",
              },
              chatMessages: [],
              otherUserData: userData,
              fetchedMessages: false,
            };
          })
        );

        setChatHistory(chatItems);
      }
      setIsLoading(false);
    };

    fetchChats();
    setupRealtimeSubscription();

    return () => {
      if (chatsRef.current) {
        supabaseClient?.removeChannel(chatsRef.current);
      }
    };
  }, [supabaseClient, userAddress, authToken]);

  const handleChatClick = (chatId: string) => {
    router.push(`/chat2/${chatId}`);
  };

  return (
    <div className="block w-full max-w-sm bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold">Chats</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-4rem)]">
        {isLoading ? (
          <div className="flex justify-center items-center h-full">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          chatHistory.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center p-4 hover:bg-accent cursor-pointer transition-colors duration-200"
              onClick={() => handleChatClick(chat.id)}
            >
              <Avatar className="h-10 w-10 flex-shrink-0">
                <AvatarImage 
                  src={chat.otherUserData?.profile_pictures?.[0] || 
                    `https://api.dicebear.com/6.x/initials/svg?seed=${chat.otherUserData?.name}`} 
                />
                <AvatarFallback>
                  {chat.otherUserData?.name?.[0] || '?'}
                </AvatarFallback>
              </Avatar>
              <div className="ml-4 overflow-hidden">
                <p className="font-semibold truncate">
                  {chat.otherUserData?.name || `User ${chat.otherUserData?.evm_address.slice(0, 6)}...`}
                </p>
                <p className="text-sm text-muted-foreground truncate">
                  {chat.lastMessage.text}
                </p>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
} 