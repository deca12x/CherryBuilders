"use client";
import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatWindow from "./ChatWindow";
import useWindowSize from "./hook";
import { ChatMessageType, ChatType, UserType } from "@/lib/supabase/types";
import { createSupabaseClient } from "@/lib/supabase/supabase-client";
import { getChatsFromUserAddress, getLastChatMessage, getUser } from "@/lib/supabase/utils";
import ChatListPanel from "./ChatListPanel";
import ContactProfilePanel from "./ContactProfilePanel";
import { useQueryState } from "nuqs";

export type ChatItem = {
  id: string;
  lastMessage: { text: string; fromAddress: string; date: string }; // {text: string; fromAddress: string; date: string, read: boolean};
  chatMessages: ChatMessageType[];
  otherUserData: UserType;
  fetchedMessages: boolean;
};

interface ChatParentProps {
  authToken: string | null;
  setError: (error: boolean) => void;
  userAddress: string;
}

// Breakpoint for switching to mobile layout
const SM_BREAKPOINT = 640;

export default function ChatParent({ authToken, setError, userAddress }: ChatParentProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatItem[]>([]);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const [wasChatHistoryFetched, setWasChatHistoryFetched] = useState(false);
  const supabaseRef = useRef<any>(null);
  const chatHistoryRef = useRef<ChatItem[]>(chatHistory);
  const selectedChatIdRef = useRef<string | null>(null);
  const windowSize = useWindowSize();

  // Routing things with nuqs
  const [selectedChatId, setSelectedChatId] = useQueryState("chatId");

  const isMobile = windowSize.width <= SM_BREAKPOINT;
  const selectedChat = chatHistory.find((chat) => chat.id === selectedChatId);

  // Update the ref whenever chatHistory state changes
  // This is needed otherwise the state will be outdated in the subscription
  useEffect(() => {
    chatHistoryRef.current = chatHistory;
  }, [chatHistory]);

  // Update the ref whenever selectedChatId state changes
  // This is needed otherwise the state will be outdated in the subscription
  useEffect(() => {
    selectedChatIdRef.current = selectedChatId;
  }, [selectedChatId]);

  // This will create a supabase client used for subscription when the user logs in or changes
  useEffect(() => {
    const initSupabase = async () => {
      const client = await createSupabaseClient(userAddress, authToken as string);
      console.log("Supabase client created with address:", userAddress);
      setSupabaseClient(client);
    };

    initSupabase();
  }, [userAddress]);

  // This useEffect function will fetch all chats the user is involved in
  // and fills the chatHistory array with chat items
  useEffect(() => {
    const setupRealtimeSubscription = () => {
      if (!supabaseClient) return;

      const channelName = `chat:messages:${userAddress}`;
      console.log(`Attempting to subscribe to channel: ${channelName}`);

      supabaseRef.current = supabaseClient
        .channel(channelName, { config: { broadcast: { ack: true }, presence: { key: userAddress } } })
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "messages",
            // Filter by receiver to only get messages directed to the connected user
            filter: `receiver=eq.${userAddress}`,
          },
          (payload: any) => {
            console.log("Received real-time update:", payload);
            const newMessage = payload.new as ChatMessageType;
            console.log("Processed new message:", newMessage);
            const chatId = newMessage.chat_id.toString();

            // Create a new last message for the chat history
            const newLastMessage = {
              text: newMessage.message,
              date: newMessage.created_at,
              fromAddress: newMessage.sender,
              //read: newMessage.chat_id === selectedChatIdRef.current ? true : false,
            };

            // Append the new message to the chat messages array if the chat was already fetched
            const targetChat = chatHistoryRef.current.find((chatItem) => chatItem.id === chatId);
            const newChatMessages = targetChat?.fetchedMessages ? [...targetChat.chatMessages, newMessage] : [];

            // Finally set the chat history with the updated chat item
            setChatHistory((prevHistory) => {
              const updatedHistory = prevHistory.map((chatItem) => {
                if (chatItem.id === chatId) {
                  return {
                    ...chatItem,
                    lastMessage: newLastMessage,
                    chatMessages: newChatMessages,
                  };
                } else {
                  return chatItem;
                }
              });
              return updatedHistory;
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

      console.log("Channel subscription set up");
    };

    const fetchChats = async () => {
      if (supabaseClient) {
        // Find all chats where the user is involved
        const {
          success: chatsSuccess,
          data: chatsData,
          error: chatsError,
        } = await getChatsFromUserAddress(userAddress, authToken);
        if (!chatsSuccess && chatsError) {
          setError(true);
        } else if (chatsData) {
          console.log("Chat data:", chatsData);

          // Fetch user data for each chat
          const chatItems = await Promise.all(
            chatsData.map(async (chat: ChatType) => {
              const otherUserAddress = chat.user_1 === userAddress ? chat.user_2 : chat.user_1;
              const { success: userSuccess, data: userData, error: userError } = await getUser(otherUserAddress, authToken);

              if (!userSuccess && userError) {
                setError(true);
                return null;
              }

              const { data: lastMessageData }: { data: ChatMessageType } = await getLastChatMessage(
                chat.id.toString(),
                authToken
              );

              const chatItem: ChatItem = {
                id: chat.id.toString(),
                lastMessage: {
                  text: lastMessageData?.message || "No messages yet",
                  date: lastMessageData?.created_at || "",
                  fromAddress: lastMessageData?.sender || "",
                  // read: lastMessageData ? lastMessageData.read : true,
                },
                chatMessages: [],
                otherUserData: userData,
                fetchedMessages: false,
              };

              return chatItem;
            })
          );

          // Filter out any null values (in case of errors)
          const validChatItems = chatItems.filter((item) => item !== null);

          setChatHistory(validChatItems as ChatItem[]);
          setWasChatHistoryFetched(true);
        }
      }
    };

    fetchChats();
    setupRealtimeSubscription();

    // Cleanup function
    return () => {
      if (supabaseRef.current) {
        supabaseClient?.removeChannel(supabaseRef.current);
      }
    };
  }, [supabaseClient, userAddress, authToken]);

  return (
    <div className="flex h-screen overflow-hidden">
      <motion.div
        initial={{ width: "100%" }}
        animate={{
          width: selectedChatId && isMobile && wasChatHistoryFetched ? "0%" : "100%",
          x: selectedChatId && isMobile && wasChatHistoryFetched ? -50 : 0,
        }}
        transition={{ duration: 0.2 }}
        className="h-full sm:w-1/3 pb-[58px] sm:max-w-sm border-r border-border"
      >
        <ChatListPanel setSelectedChatId={setSelectedChatId} selectedChatId={selectedChatId} chatHistory={chatHistory} />
      </motion.div>

      <AnimatePresence>
        {selectedChat && selectedChat.otherUserData && selectedChatId && wasChatHistoryFetched && (
          <motion.div
            key="chat-window"
            initial={isMobile ? { x: "100%" } : { opacity: 0 }}
            animate={isMobile ? { x: isProfileOpen ? -50 : 0 } : { opacity: 1 }}
            exit={isMobile ? { x: "100%" } : {}}
            transition={{ duration: 0.2 }}
            className={`${isMobile ? "fixed inset-0" : "relative flex-grow"}`}
          >
            <ChatWindow
              chat={selectedChat}
              selectedChatId={selectedChatId}
              onBack={() => setSelectedChatId(null)}
              onOpenProfile={() => setIsProfileOpen(true)}
              authToken={authToken}
              userAddress={userAddress}
              chatHistory={chatHistory}
              setChatHistory={(updateFn: (prevHistory: ChatItem[]) => ChatItem[]) => {
                setChatHistory((prevHistory) => updateFn(prevHistory));
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileOpen && selectedChat && selectedChat.otherUserData && (
          <motion.div
            key="contact-profile"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 w-full sm:w-[450px] sm:relative"
          >
            <ContactProfilePanel contact={selectedChat.otherUserData} onClose={() => setIsProfileOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
