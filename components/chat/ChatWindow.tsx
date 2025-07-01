"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send } from "lucide-react";
import type { ChatItem } from "./ChatParent";
import { createMessage, getChatMessages } from "@/lib/supabase/utils";
import { motion } from "framer-motion";
import LoadingSpinner from "../ui/loading-spinner";
import type { ChatMessageType } from "@/lib/supabase/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/chat/utils";

interface ChatWindowProps {
  chat: ChatItem;
  selectedChatId: string;
  onBack: () => void;
  onOpenProfile: () => void;
  authToken: string | null;
  userAddress: string;
  chatHistory: ChatItem[];
  setChatHistory: (updateFn: (prevHistory: ChatItem[]) => ChatItem[]) => void;
}

export default function ChatWindow({
  chat,
  selectedChatId,
  onBack,
  onOpenProfile,
  authToken,
  userAddress,
  chatHistory,
  setChatHistory,
}: ChatWindowProps) {
  const [newMessage, setNewMessage] = useState("");
  const [chatMessagesError, setChatMessagesError] = useState(false);
  const [chatMessagesLoading, setChatMessagesLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInputFocused, setIsInputFocused] = useState(false);

  // Fetch chat messages on component mount and when chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      // If the chat has already fetched messages, return
      if (chat.fetchedMessages) return;

      // Set loading state
      setChatMessagesLoading(true);

      // Fetch messages from chat.chatMessages
      const { success, data, error } = await getChatMessages(
        chat.id,
        true,
        authToken
      );
      if (!success && error) {
        console.error("Error fetching messages:", error);
        setChatMessagesError(true);
      } else if (data) {
        // Set the messages read value to true before adding them to the chat history
        // const updatedMessages = data.map((msg: ChatMessageType) => {
        //   return { ...msg, read: true };
        // });

        // Search and set the messages in the correct chat
        const updatedChatHistory = chatHistory.map((chatItem) => {
          if (chatItem.id === chat.id) {
            return {
              ...chatItem,
              chatMessages: data,
              fetchedMessages: true,
            };
          } else {
            return chatItem;
          }
        });
        // Update the chat history
        setChatHistory(() => updatedChatHistory);

        // Update the messages read value in the database
        // const { success, error } = await updateMessagesReadValue(selectedChatId, true, authToken);
        // if (!success && error) {
        //   console.error("Error updating messages read value:", error);
        // }

        // Set loading state to false
        setChatMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChatId, authToken]);

  // Modified scroll effect
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "instant" });
    }
  }, [chat.chatMessages]);

  const handleSend = async (
    messageText: string,
    type?: string,
    requestId?: string
  ) => {
    if (!messageText.trim()) return;

    const newMessage: ChatMessageType = {
      id: Date.now(),
      sender: userAddress,
      receiver: chat.otherUserData.evm_address,
      message: messageText.trim(),
      chat_id: selectedChatId,
      created_at: new Date().toISOString(),
      type: type,
      requestId: requestId,
      //read: false,
    };

    // Save the last message in case of UI revert
    const lastMessage = chat.lastMessage;

    // Update UI optimistically
    setChatHistory((prevChats: ChatItem[]) => {
      return prevChats.map((chatItem) => {
        if (chatItem.id === selectedChatId) {
          return {
            ...chatItem,
            chatMessages: [...chatItem.chatMessages, newMessage],
            lastMessage: {
              text: newMessage.message,
              date: newMessage.created_at,
              fromAddress: newMessage.sender,
              //read: true,
            },
          };
        }
        return chatItem;
      });
    });

    setNewMessage("");

    // Send to Supabase
    const { error } = await createMessage(newMessage, authToken);

    if (error) {
      console.error("Error sending message:", error);
      // Revert the UI update on error
      setChatHistory((prevChats: ChatItem[]) => {
        return prevChats.map((chatItem) => {
          if (chatItem.id === selectedChatId) {
            return {
              ...chatItem,
              chatMessages: chatItem.chatMessages.filter(
                (msg) => msg.id !== newMessage.id
              ),
              lastMessage: lastMessage, // Restore previous last message
            };
          }
          return chatItem;
        });
      });
    }
  };

  return (
    <div className="flex flex-col h-full pb-[58px]">
      <div className="flex flex-shrink-0 items-center h-20 p-4 bg-background border-b border-border">
        <Button
          variant="ghost"
          size="icon"
          className="sm:hidden mr-2"
          onClick={onBack}
        >
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div
          className="flex items-center space-x-3 cursor-pointer group"
          onClick={onOpenProfile}
        >
          <Avatar className="transition-transform group-hover:scale-105">
            <AvatarImage
              src={
                chat.otherUserData.profile_pictures.length > 0
                  ? chat.otherUserData.profile_pictures[0]
                  : "/images/default_propic.jpeg"
              }
              alt="Other Users Propic"
              className="user-image"
            />
          </Avatar>
          <h2 className="text-lg font-semibold group-hover:text-red transition-colors">
            {chat.otherUserData.name}
          </h2>
        </div>
      </div>
      {chatMessagesLoading ? (
        <LoadingSpinner
          message="Loading messages..."
          className="justify-start mt-28"
        />
      ) : chat.chatMessages && !chatMessagesError ? (
        <ScrollArea className="flex-grow p-5" ref={scrollAreaRef}>
          <div className="space-y-4">
            {chat.chatMessages.map((message, index) => {
              if (message.sender === userAddress) {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.07 * index }}
                    key={message.id}
                    className="flex flex-col bg-red text-red-foreground px-3 py-2 rounded-lg max-w-[65%] ml-auto mr-2"
                  >
                    <div>{message.message}</div>
                    <div className="flex justify-end w-full text-sm text-red-foreground">
                      {formatDate(message.created_at)}
                    </div>
                  </motion.div>
                );
              } else {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.07 * index }}
                    key={message.id}
                    className="flex flex-col bg-grey px-3 py-2 rounded-lg max-w-[70%]"
                  >
                    {message.message}
                    <div className="flex justify-end w-full text-sm text-red-foreground">
                      {formatDate(message.created_at)}
                    </div>
                  </motion.div>
                );
              }
            })}
            {/* Dummy div to have a direct connection to the end of the chat */}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>
      ) : chatMessagesError ? (
        <div className="flex justify-center text-lg text-red items-center text-center h-full">
          {"An unexpected error occurred while fetching you messages :("}
          <br />
          {"Please try again!"}
        </div>
      ) : (
        <div className="flex justify-center text-lg items-center text-center h-full">
          {"You didn't exchange any message yet."}
          <br />
          {"Why don't you say hi? :)"}
        </div>
      )}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <TooltipProvider>
            <Tooltip delayDuration={0} open={isInputFocused}>
              <TooltipTrigger asChild>
                <Input
                  className="flex"
                  placeholder="Type your message..."
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onFocus={() => setIsInputFocused(true)}
                  onBlur={() => setIsInputFocused(false)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSend(newMessage);
                    }
                  }}
                />
              </TooltipTrigger>
              <TooltipContent className="max-w-[300px] p-3 text-sm">
                <p>
                  We don&apos;t want to spam you, you won&apos;t receive email
                  notifications after this one, so we suggest exchanging contact
                  details
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            type="submit"
            size="icon"
            onClick={() => handleSend(newMessage)}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
