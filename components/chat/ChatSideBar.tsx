import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, Menu } from "lucide-react";
import { useRouter } from "next/navigation";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { supabase } from "@/lib/supabase";
import { Sheet, SheetContent, SheetTrigger } from "../ui/sheet";
import { Button } from "../ui/button";

type ChatHistoryItem = {
  id: string;
  name: string;
  lastMessage: string;
  otherUserAddress: string;
  profilePicture: string;
};

type UserData = {
  name: string;
  profile_pictures: string[];
};

interface ChatSidebarProps {
  userAddress: string;
  activeChatId?: string;
}

export default function ChatSidebar({ userAddress, activeChatId }: ChatSidebarProps) {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchChatHistory();
  }, [userAddress]);

  const fetchUserData = async (address: string): Promise<UserData | null> => {
    const { data, error } = await supabase
      .from("user_data")
      .select("name, profile_pictures")
      .eq("evm_address", address)
      .single();

    if (error) {
      console.error("Error fetching user data:", error);
      return null;
    }

    return data;
  };

  const fetchChatHistory = async () => {
    setIsLoading(true);
    console.log("Fetching chat history for user:", userAddress);
    const { data, error } = await supabase.from("chats").select("*").or(`user_1.eq.${userAddress},user_2.eq.${userAddress}`);

    if (error) {
      console.error("Error fetching chat history:", error);
      setIsLoading(false);
      return;
    }

    console.log("Fetched chat history:", data);
    const history: ChatHistoryItem[] = await Promise.all(
      data.map(async (chat) => {
        const otherUserAddress = chat.user_1 === userAddress ? chat.user_2 : chat.user_1;
        const lastMessage = await fetchLastMessage(chat.id);
        const userData = await fetchUserData(otherUserAddress);
        return {
          id: chat.id,
          name: userData?.name || `User ${otherUserAddress.slice(0, 6)}...`,
          lastMessage: lastMessage?.message || "No messages yet",
          otherUserAddress,
          profilePicture: userData?.profile_pictures[0] || "",
        };
      })
    );

    setChatHistory(history);
    setIsLoading(false);
  };

  const fetchLastMessage = async (chatId: string): Promise<{ message: string } | null> => {
    const { data, error } = await supabase
      .from("messages")
      .select("message")
      .eq("chat_id", chatId)
      .order("created_at", { ascending: false })
      .limit(1);

    if (error) {
      console.error("Error fetching last message:", error);
      return null;
    }
    return data[0] || null;
  };

  const handleChatClick = (chatId: string) => {
    router.push(`/chat/${chatId}`);

    setIsOpen(false);

  };

  const ChatList = () => (
    <ScrollArea className="h-[calc(100vh-10rem)] lg:h-[calc(100vh-4rem)]">
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        chatHistory.map((chat) => (
          <div
            key={chat.id}
            className={`flex items-center p-4 hover:bg-accent cursor-pointer transition-colors duration-200 ${
              chat.id === activeChatId ? "bg-accent" : ""
            }`}
            onClick={() => handleChatClick(chat.id)}
          >
            <Avatar className="h-10 w-10 flex-shrink-0">
              <AvatarImage src={chat.profilePicture || `https://api.dicebear.com/6.x/initials/svg?seed=${chat.name}`} />
              <AvatarFallback>{chat.name[0]}</AvatarFallback>
            </Avatar>
            <div className="ml-4 overflow-hidden">
              <p className="font-semibold truncate">{chat.name}</p>
              <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
            </div>
          </div>
        ))
      )}
    </ScrollArea>
  );

  return (
    <>
      {/* Mobile Topbar */}

      {/* Desktop Sidebar */}
      <div className="block w-full max-w-sm bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Chats</h2>
        </div>
        <ChatList />
      </div>
    </>
  );
}
