import React, { useEffect, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send } from "lucide-react";
import { ChatItem } from "./ChatParent2";
import { getChatMessages } from "@/lib/supabase/utils";
import { motion } from "framer-motion";
import LoadingSpinner from "../ui/loading-spinner";
import { ChatMessageType } from "@/lib/supabase/types";
import { createSupabaseClient } from "@/lib/supabase/supabase-client";

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
  const [supabaseClient, setSupabaseClient] = useState<any>(null);

  // Fetch chat messages on component mount and when chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      // If the chat has already fetched messages, return
      if (chat.fetchedMessages) return;

      // Set loading state
      setChatMessagesLoading(true);

      // Fetch messages from chat.chatMessages
      const { success, data, error } = await getChatMessages(chat.id, true, authToken);
      if (!success && error) {
        console.error("Error fetching messages:", error);
        setChatMessagesError(true);
      } else if (data) {
        console.log("Fetched messages:", data);
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

        // Set loading state to false
        setChatMessagesLoading(false);
      }
    };

    fetchMessages();
  }, [selectedChatId, authToken]);

  // Add useEffect to initialize Supabase client
  useEffect(() => {
    const initSupabase = async () => {
      const client = await createSupabaseClient(userAddress, authToken as string);
      setSupabaseClient(client);
    };

    initSupabase();
  }, [userAddress, authToken]);

  const handleSend = async (messageText: string, type?: string, requestId?: string) => {
    if (!messageText.trim() || !supabaseClient) return;

    const newMessage: ChatMessageType = {
      id: Date.now(),
      sender: userAddress,
      receiver: chat.otherUserData.evm_address,
      message: messageText.trim(),
      chat_id: selectedChatId,
      created_at: new Date().toISOString(),
      type: type,
      requestId: requestId,
      read: false,
    };

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
            },
          };
        }
        return chatItem;
      });
    });

    setNewMessage("");

    // Send to Supabase
    const { data, error } = await supabaseClient
      .from("messages")
      .insert(newMessage)
      .select();

    if (error) {
      console.error("Error sending message:", error);
      // Revert the UI update on error
      setChatHistory((prevChats: ChatItem[]) => {
        return prevChats.map((chatItem) => {
          if (chatItem.id === selectedChatId) {
            return {
              ...chatItem,
              chatMessages: chatItem.chatMessages.filter((msg) => msg.id !== newMessage.id),
              lastMessage: chatItem.lastMessage, // Restore previous last message
            };
          }
          return chatItem;
        });
      });
    } else if (data) {
      console.log("Message sent successfully to Supabase:", data[0]);
      // Update the message with the server-generated ID and data
      setChatHistory((prevChats: ChatItem[]) => {
        return prevChats.map((chatItem) => {
          if (chatItem.id === selectedChatId) {
            return {
              ...chatItem,
              chatMessages: chatItem.chatMessages.map((msg) => 
                msg.id === newMessage.id ? data[0] : msg
              ),
            };
          }
          return chatItem;
        });
      });
    }
  };

  return (
    <div className="flex flex-col h-full pb-[58px]">
      <div className="flex items-center h-20 p-4 bg-background border-b border-border">
        <Button variant="ghost" size="icon" className="sm:hidden mr-2" onClick={onBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <div className="flex items-center space-x-3 cursor-pointer" onClick={onOpenProfile}>
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
          <h2 className="text-lg font-semibold">{chat.otherUserData.name}</h2>
        </div>
      </div>
      {chatMessagesLoading ? (
        <LoadingSpinner className="justify-start mt-28" />
      ) : (
        <ScrollArea className="flex-grow p-4">
          <div className="space-y-4">
            {chat.chatMessages.map((message, index) => {
              if (message.sender === userAddress) {
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 25 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: 0.07 * index }}
                    key={message.id}
                    className="flex flex-col bg-primary text-primary-foreground px-3 py-2 rounded-lg max-w-[65%] ml-auto mr-2"
                  >
                    <div>{message.message}</div>
                    <div className="flex justify-end w-full text-sm text-primary-foreground">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                    className="flex flex-col bg-muted px-3 py-2 rounded-lg max-w-[70%]"
                  >
                    {message.message}
                    <div className="flex justify-end w-full text-sm text-primary-foreground">
                      {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </div>
                  </motion.div>
                );
              }
            })}
          </div>
        </ScrollArea>
      )}
      <div className="p-4 border-t border-border">
        <div className="flex space-x-2">
          <Input
            className="flex"
            placeholder="Type your message..."
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSend(newMessage);
              }
            }}
          />
          <Button type="submit" size="icon" onClick={() => handleSend(newMessage)}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
