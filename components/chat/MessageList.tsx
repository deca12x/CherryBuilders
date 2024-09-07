import React, { useEffect, useRef, useLayoutEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area"
import RequestMessage from './RequestMessage';

interface Message {
  id: number;
  sender: string;
  message: string;
  type?: string;
  requestId?: string;
  paid?: boolean;
}

interface MessageListProps {
  messages: Message[];
  currentUserAddress: string;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUserAddress }) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (scrollContainer) {
        const scrollHeight = scrollContainer.scrollHeight;
        const height = scrollContainer.clientHeight;
        const maxScrollTop = scrollHeight - height;
        scrollContainer.scrollTop = maxScrollTop > 0 ? maxScrollTop : 0;
      }
    }
  };

  useLayoutEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          entry.target.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
      },
      { threshold: 0.1 }
    );

    if (lastMessageRef.current) {
      observer.observe(lastMessageRef.current);
    }

    return () => {
      if (lastMessageRef.current) {
        observer.unobserve(lastMessageRef.current);
      }
    };
  }, [messages]);


  // useEffect(() => {
  //   const array = []
  //   messages.forEach(msg => {
  //     array.push({
  //       sender: msg.sender,
  //       message: msg.message
  //     })
  
  //   });

  //   console.log(array)
  // }, [messages]);

  const handlePay = (amount: string) => {
    // Implement payment logic here
    console.log(`Paying ${amount}`);
  };

  return (
    <ScrollArea ref={scrollAreaRef} className="flex-1 p-4">
      {messages.map((msg, index) => (
        <div 
          key={msg.id} 
          ref={index === messages.length - 1 ? lastMessageRef : null}
          className={`flex mb-4 ${msg.sender === currentUserAddress ? 'justify-end' : 'justify-start'}`}
        >
          {msg.type === 'request' ? (
            <RequestMessage
              requestId={msg.requestId as string}
              message={msg.message}
              amount={msg.message.split(' ')[1]}
              isCurrentUser={msg.sender === currentUserAddress}
              hasBeenPaid={msg.paid}
              onPay={handlePay}
            />
          ) : (
            <div 
              className={`rounded-lg p-3 max-w-[75%] break-words ${
                msg.sender === currentUserAddress ? 'bg-primary text-primary-foreground' : 'bg-muted'
              }`}
            >
              <p>{msg.message}</p>
            </div>
          )}
        </div>
      ))}
    </ScrollArea>
  )
}

export default MessageList;