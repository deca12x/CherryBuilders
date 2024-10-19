import React, { useState, useEffect } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { getChatsFromUserAddress, getLastChatMessage, getUser } from "@/lib/supabase/utils";

type ChatHistoryItem = {
  id: string;
  name: string;
  lastMessage: string;
  otherUserAddress: string;
  profilePicture: string;
};

interface ChatSidebarProps {
  userAddress: string;
  activeChatId?: string;
  authToken: string | null;
}

export default function ChatSidebar({ userAddress, activeChatId, authToken }: ChatSidebarProps) {
  const [chatHistory, setChatHistory] = useState<ChatHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    fetchChatHistory();
  }, [userAddress]);

  const fetchChatHistory = async () => {
    setIsLoading(true);
    console.log("Fetching chat history for user:", userAddress);
    const foundChats = await getChatsFromUserAddress(userAddress, authToken);

    if (!foundChats.success) {
      console.error("Error fetching chat history:", foundChats.error);
      setIsLoading(false);
      return;
    }

    console.log("Fetched chat history:", foundChats.data);
    const history: ChatHistoryItem[] = await Promise.all(
      foundChats.data.map(async (chat: any) => {
        const otherUserAddress = chat.user_1 === userAddress ? chat.user_2 : chat.user_1;
        const lastMessage = await fetchLastMessage(chat.id);
        const userData = await getUser(otherUserAddress, authToken);
        return {
          id: chat.id,
          name: userData.data?.name || `User ${otherUserAddress.slice(0, 6)}...`,
          lastMessage: lastMessage?.message || "No messages yet",
          otherUserAddress,
          profilePicture: userData.data?.profile_pictures[0] || "",
        };
      })
    );

    setChatHistory(history);
    setIsLoading(false);
  };

  const fetchLastMessage = async (chatId: string): Promise<{ message: string } | null> => {
    const lastMessage = await getLastChatMessage(chatId, authToken);

    if (!lastMessage.success) {
      console.error("Error fetching last message:", lastMessage.error);
      return null;
    }
    return lastMessage.data[0] || null;
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
