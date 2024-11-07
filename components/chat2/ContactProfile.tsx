import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

type ChatHistoryItem = {
  id: string;
  name: string;
  lastMessage: string;
  otherUserAddress: string;
  profilePicture: string;
};

interface ContactProfileProps {
  contact: ChatHistoryItem | null;
  onClose: () => void;
}

export default function ContactProfile({ contact, onClose }: ContactProfileProps) {
  if (!contact) return null;

  return (
    <div className="flex flex-col h-full bg-background border-l border-border pb-[58px]">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold">Contact Info</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      <ScrollArea className="flex-grow p-4">
        <div className="flex flex-col items-center space-y-4">
          <Avatar className="h-24 w-24">
            <AvatarImage src={contact.profilePicture} alt={contact.name} />
            <AvatarFallback>{contact.name.slice(0, 2)}</AvatarFallback>
          </Avatar>
          <h3 className="text-2xl font-semibold">{contact.name}</h3>
          <p className="text-sm text-muted-foreground">{contact.otherUserAddress}</p>
        </div>
        {/* Add more contact information here */}
      </ScrollArea>
    </div>
  );
}
