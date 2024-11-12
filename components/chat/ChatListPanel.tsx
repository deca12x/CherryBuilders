import React from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatItem } from "./ChatParent";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import LoadingSpinner from "../ui/loading-spinner";
import { formatDate, sortChatHistory } from "@/lib/chat/utils";

interface ChatListPanelProps {
  setSelectedChatId: (chatId: string) => void;
  selectedChatId: string | null;
  chatHistory: ChatItem[];
}

export default function ChatListPanel({ setSelectedChatId, selectedChatId, chatHistory }: ChatListPanelProps) {
  // Sort chatHistory by lastMessage.date in descending order
  // If the lastMessage.date is not available, the chat will be placed at the bottom
  sortChatHistory(chatHistory, false);

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 p-4 border-b border-border">
        <h2 className="text-xl font-semibold">Chats</h2>
      </div>
      {chatHistory.length > 0 ? (
        <ScrollArea className="flex-grow">
          <div className="p-4 space-y-4">
            {chatHistory.map((chat, index) => {
              if (chat.otherUserData) {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.2 * index }}
                    key={chat.id}
                    className={cn(
                      "flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-accent",
                      selectedChatId === chat.id && "bg-primary/25 hover:bg-primary/25"
                    )}
                    onClick={() => setSelectedChatId(chat.id)}
                  >
                    <Avatar>
                      <AvatarImage
                        src={
                          chat.otherUserData.profile_pictures.length > 0
                            ? chat.otherUserData.profile_pictures[0]
                            : "/images/default_propic.jpeg"
                        }
                        alt="Other Users Propic"
                      />
                    </Avatar>
                    <div className="flex flex-col w-full">
                      <div className="flex justify-between">
                        <div className="flex items-center w-full text-md font-semibold">{chat.otherUserData.name}</div>
                        <div className="flex items-center justify-end w-full text-sm">
                          {chat.lastMessage.date ? formatDate(chat.lastMessage.date) : ""}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-muted-foreground truncate">{chat.lastMessage.text}</div>
                        {/* {!chat.lastMessage?.read && <div className="bg-primary rounded-full h-3 w-3" />} */}
                      </div>
                    </div>
                  </motion.div>
                );
              }
            })}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex items-start justify-center mt-28">
          <LoadingSpinner className="min-h-0" />
        </div>
      )}
    </div>
  );
}
