import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";

type ChatHistoryItem = {
  id: string;
  name: string;
  lastMessage: string;
  otherUserAddress: string;
  profilePicture: string;
};

interface ChatListProps {
  onSelectChat: (chat: ChatHistoryItem) => void;
}

export default function ChatList({ onSelectChat }: ChatListProps) {
  const chatHistory: ChatHistoryItem[] = [
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    {
      id: "1",
      name: "John Doe",
      lastMessage: "Hey, how are you?",
      otherUserAddress: "0x123...",
      profilePicture: "/placeholder.svg?height=40&width=40",
    },
    // Add more placeholder chats here
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex h-16 p-4 border-b border-border">
        <h2 className="text-xl font-semibold">Chats</h2>
      </div>
      <ScrollArea className="flex-grow">
        <div className="p-4 space-y-4">
          {chatHistory.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center space-x-4 p-3 rounded-lg cursor-pointer hover:bg-accent"
              onClick={() => onSelectChat(chat)}
            >
              <Avatar>
                <AvatarImage src={chat.profilePicture} alt={chat.name} />
                <AvatarFallback>{chat.name.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <div className="flex-grow">
                <h3 className="font-semibold">{chat.name}</h3>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}
