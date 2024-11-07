import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send } from "lucide-react";

type ChatHistoryItem = {
  id: string;
  name: string;
  lastMessage: string;
  otherUserAddress: string;
  profilePicture: string;
};

interface ChatWindowProps {
  chat: ChatHistoryItem;
  onBack: () => void;
  onOpenProfile: () => void;
}

export default function ChatWindow({ chat, onBack, onOpenProfile }: ChatWindowProps) {
  return (
    <div className="flex flex-col h-full pb-[58px]">
      <div className="flex items-center h-20 p-4 bg-background border-b border-border">
        <Button variant="ghost" size="icon" className="sm:hidden mr-2" onClick={onBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onOpenProfile}>
          <Avatar>
            <AvatarImage src={chat.profilePicture} alt={chat.name} />
            <AvatarFallback>{chat.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <h2 className="text-lg font-semibold">{chat.name}</h2>
        </div>
      </div>
      <ScrollArea className="flex-grow p-4">
        {/* Placeholder for chat messages */}
        <div className="space-y-4">
          <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[70%] ml-auto">Hello! How are you?</div>
          <div className="bg-muted p-3 rounded-lg max-w-[70%]">Hi! I'm doing great, thanks for asking. How about you?</div>
          {/* Add more placeholder messages here */}
        </div>
      </ScrollArea>
      <div className="p-4 border-t border-border">
        <form className="flex space-x-2">
          <Input className="flex-grow" placeholder="Type your message..." type="text" />
          <Button type="submit" size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
}
