import React, { useEffect, useRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"

interface Message {
  id: number;
  sender: string;
  message: string;
}

interface MessageListProps {
  messages: Message[];
  currentUserAddress: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserAddress }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <ScrollArea className="flex-1 p-4">
      {messages.map((msg) => (
        <div 
          key={msg.id} 
          className={`flex mb-4 ${msg.sender === currentUserAddress ? 'justify-end' : 'justify-start'}`}
        >
          <div 
            className={`rounded-lg p-3 max-w-xs ${
              msg.sender === currentUserAddress ? 'bg-primary text-primary-foreground' : 'bg-muted'
            }`}
          >
            <p>{msg.message}</p>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </ScrollArea>
  )
}

export default MessageList;