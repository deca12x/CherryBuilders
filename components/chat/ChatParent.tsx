"use client";

import { useState, useEffect, useRef } from "react";
import ChatHeader from "@/components/chat/ChatHeader";
import ChatSidebar from "@/components/chat/ChatSideBar";
import MessageList from "@/components/chat/MessageList";
import MessageInput from "@/components/chat/MessageInput";
import { supabase } from "@/lib/supabase/supabase-client";
import {ChatParentProps, User } from "@/lib/types";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";
import { Menu } from "lucide-react";
import BottomNavigationBar from "../navbar/BottomNavigationBar";
import { ChatMessageType } from "@/lib/supabase/types";
import { getUser } from "@/lib/supabase/utils";
import { usePrivy } from '@privy-io/react-auth';
import { createSupabaseClient } from "@/lib/supabase/supabase-client";

export default function ChatParent({ userAddress, chatId, authToken }: ChatParentProps) {
  const [message, setMessage] = useState("");
  const [currentChat, setCurrentChat] = useState<ChatMessageType[]>([]);
  const [otherUser, setOtherUser] = useState<User | null>(null);
  const channelRef = useRef<any>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [supabaseClient, setSupabaseClient] = useState<any>(null);
  const { user } = usePrivy();

  useEffect(() => {
    const initSupabase = async () => {
      if (user?.wallet?.address) {
        const client = await createSupabaseClient(user.wallet.address);
        setSupabaseClient(client);
      }
    };

    initSupabase();
  }, [user]);

  useEffect(() => {
    if (supabaseClient && chatId) {
      fetchChatDetails();
      fetchMessages();
      setupRealtimeSubscription();
    }

    return () => {
      if (channelRef.current) {
        supabaseClient?.removeChannel(channelRef.current);
      }
    };
  }, [supabaseClient, chatId]);

  const fetchChatDetails = async () => {
    if (!supabaseClient) return;
    console.log("Fetching chat details for chat ID:", chatId);
    const { data, error } = await supabaseClient.from("chats").select("*").eq("id", chatId).single();

    if (error) {
      console.error("Error fetching chat details:", error);
      return;
    }

    if (data) {
      console.log("Chat data:", data);
      const otherUserAddress = data.user_1 === userAddress ? data.user_2 : data.user_1;
      const otherUserData = await getUser(otherUserAddress, authToken);
      console.log("Determined other user address:", otherUserAddress);

      setOtherUser({
        address: otherUserAddress,
        name: otherUserData?.data.name || otherUserAddress,
      });
    } else {
      console.log("No chat data found for chat ID:", chatId);
    }
  };

  const fetchMessages = async () => {
    if (!supabaseClient) return;
    console.log("Fetching messages for chat:", chatId);
    const { data, error } = await supabaseClient
      .from("messages")
      .select("*")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching messages:", error);
    } else {
      console.log("Fetched messages:", data);
      setCurrentChat(data as ChatMessageType[]);
    }
  };

  const setupRealtimeSubscription = () => {
    console.log(`Subscribing to channel: chat:${chatId}`);
    channelRef.current = supabaseClient
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        (payload: any) => {
          console.log("Received change from Supabase:", payload);
          if (payload.eventType === "INSERT") {
            const newMessage = payload.new as ChatMessageType;
            console.log("Processed new message:", newMessage);
            if (newMessage.sender !== userAddress) {
              console.log("Updating chat with new message from other user:", newMessage);
              setCurrentChat((prevMessages) => {
                console.log("Current chat before update:", prevMessages);
                const updatedChat = [...prevMessages, newMessage];
                console.log("Updated chat after receiving new message:", updatedChat);
                return updatedChat;
              });
            } else {
              console.log("Received own message, not updating chat:", newMessage);
            }
          }
        }
      )
      .subscribe(async (status: string, err?: Error) => {
        if (err) {
          console.error("Subscription error:", err);
        } else {
          console.log("Subscription status:", status);
          if (status === 'SUBSCRIBED') {
            console.log("Successfully subscribed to channel");
          }
        }
      });
  };

  const handleSend = async (messageText: string, type?: string, requestId?: string) => {
    if (messageText.trim()) {
      console.log("Sending message:", messageText, "Type:", type, "RequestId:", requestId);
      const newMessage: ChatMessageType = {
        id: Date.now(),
        sender: userAddress,
        message: messageText.trim(),
        chat_id: chatId,
        created_at: new Date().toISOString(),
        type: type,
        requestId: requestId,
      };

      console.log("Adding message to UI:", newMessage);
      setCurrentChat((prevMessages) => {
        console.log("Current chat before sending:", prevMessages);
        const updatedChat = [...prevMessages, newMessage];
        console.log("Updated chat after sending:", updatedChat);
        return updatedChat;
      });
      setMessage("");

      const { data, error } = await supabaseClient.from("messages").insert(newMessage).select();

      if (error) {
        console.error("Error sending message:", error);
        console.log("Reverting UI update");
        setCurrentChat((prevMessages) => prevMessages.filter((msg) => msg.id !== newMessage.id));
      } else if (data) {
        console.log("Message sent successfully to Supabase:", data[0]);
        setCurrentChat((prevMessages) => prevMessages.map((msg) => (msg.id === newMessage.id ? data[0] : msg)));

        if (type === "request" && requestId) {
          console.log("Request message stored with requestId:", requestId);
        }
      }
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background lg:flex-row">
      {/* Mobile Sidebar Trigger */}
      <div className="lg:hidden p-4 border-b border-border">
        <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
            <ChatSidebar userAddress={userAddress} activeChatId={chatId} authToken={authToken} />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <div className="hidden lg:block w-1/4 border-r border-border">
        <ChatSidebar userAddress={userAddress} activeChatId={chatId} authToken={authToken} />
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col p-2 pb-12">
        <ChatHeader name={otherUser?.name || "Loading..."} />
        <MessageList key={currentChat.length} messages={currentChat} currentUserAddress={userAddress} authToken={authToken} />
        <MessageInput
          payeeAddress={userAddress}
          payerAddress={otherUser?.address as string}
          message={message}
          setMessage={setMessage}
          handleSend={handleSend}
        />
      </div>
      <BottomNavigationBar />
    </div>
  );
}
