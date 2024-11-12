import React from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";
import { UserType } from "@/lib/supabase/types";
import ContactProfileCard from "./ContactProfileCard";

interface ContactProfilePanelProps {
  contact: UserType;
  onClose: () => void;
}

export default function ContactProfilePanel({ contact, onClose }: ContactProfilePanelProps) {
  if (!contact) return null;

  return (
    <div className="flex flex-col h-full bg-background border-l border-border pb-[58px]">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-xl font-semibold">Contact Info</h2>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-6 w-6" />
        </Button>
      </div>
      <ScrollArea className="flex-grow px-4 pt-4">
        <ContactProfileCard user={contact} />
      </ScrollArea>
    </div>
  );
}
