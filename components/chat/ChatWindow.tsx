"use client";

import { useEffect, useRef, useState } from "react";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Bell, BellOff, Send } from "lucide-react";
import type { ChatItem } from "./ChatParent";
import { createMessage, getChatMessages, getUser } from "@/lib/supabase/utils";
import { motion } from "framer-motion";
import LoadingSpinner from "../ui/loading-spinner";
import type { ChatMessageType, UserType } from "@/lib/supabase/types";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { formatDate } from "@/lib/chat/utils";
import { canSendEmail } from "@/lib/email/canSendEmail";
import { canSendMessage } from "@/lib/chat/canSendMessage";
import { sendNotificationEmail } from "@/lib/email/sendNotificationEmail";
import { toast } from "@/hooks/use-toast";

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
  const [currentUserData, setCurrentUserData] = useState<UserType | null>(null);

  // We use emailBellOn to check if the user can send an email notification or a message
  const [emailBellOn, setemailBellOn] = useState(false);
  const [canSendEmailStatus, setCanSendEmailStatus] = useState<{
    canSend: boolean;
    reason: string;
  }>({ canSend: false, reason: "Checking..." });
  const [canSendMessageStatus, setCanSendMessageStatus] = useState<{
    canSend: boolean;
    reason: string;
  }>({ canSend: false, reason: "Checking..." });

  // Fetch current user data
  useEffect(() => {
    const fetchCurrentUserData = async () => {
      if (userAddress && authToken) {
        try {
          const { success, data, error } = await getUser(
            userAddress,
            authToken
          );
          if (success && data) {
            setCurrentUserData(data);
          } else if (error) {
            console.error("Error fetching current user data:", error);
          }
        } catch (error) {
          console.error("Error in fetchCurrentUserData:", error);
        }
      }
    };

    fetchCurrentUserData();
  }, [userAddress, authToken]);

  // Check if user can send a message or an email
  useEffect(() => {
    if (chat.chatMessages && chat.chatMessages.length > 0) {
      // Run when session starts, chat messages change, or notifications are disabled
      if (!emailBellOn) {
        const messageResult = canSendMessage(
          chat.chatMessages,
          userAddress,
          chat.otherUserData.evm_address,
          new Date()
        );
        setCanSendMessageStatus(messageResult);
      } else {
        const emailResult = canSendEmail(
          chat.chatMessages,
          userAddress,
          chat.otherUserData.evm_address,
          new Date()
        );
        setCanSendEmailStatus(emailResult);
      }
    }
  }, [chat.chatMessages, emailBellOn]);

  // Toggle notifications enabled/disabled
  const toggleNotifications = () => {
    setemailBellOn(!emailBellOn);
  };

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

    // Check if user can send - NEW VALIDATION
    const canProceed = emailBellOn
      ? canSendEmailStatus.canSend
      : canSendMessageStatus.canSend;

    if (!canProceed) {
      // Remove toast notifications for validation errors
      // The tooltip will already show the error message
      return;
    }

    // Determine if this should be an email notification
    const shouldSendEmailNotification =
      emailBellOn && canSendEmailStatus.canSend;

    const newMessage: ChatMessageType = {
      id: Date.now(),
      sender: userAddress,
      receiver: chat.otherUserData.evm_address,
      message: messageText.trim(),
      chat_id: selectedChatId,
      created_at: new Date().toISOString(),
      type: type,
      requestId: requestId,
      email_notification: shouldSendEmailNotification,
    };

    // Save the last message in case of UI revert
    const lastMessage = chat.lastMessage;

    // Update UI optimistically
    setChatHistory((prevChats: ChatItem[]) => {
      return prevChats.map((chatItem) => {
        if (chatItem.id === selectedChatId) {
          const updatedMessages = [...chatItem.chatMessages, newMessage];
          return {
            ...chatItem,
            chatMessages: updatedMessages,
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

      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } else if (shouldSendEmailNotification) {
      // Show a toast notification that the email was sent
      toast({
        title: "Email Notification Sent",
        description: `${chat.otherUserData.name} will be notified about your message.`,
      });

      // Send email notification
      try {
        if (chat.otherUserData.email && currentUserData) {
          await sendNotificationEmail({
            senderName: currentUserData.name || userAddress,
            senderImage:
              currentUserData.profile_pictures &&
              currentUserData.profile_pictures.length > 0
                ? currentUserData.profile_pictures[0]
                : "",
            senderBio: currentUserData.bio || "",
            senderBuilding: currentUserData.building || "",
            senderLookingFor: currentUserData.looking_for || "",
            chatLink: `${window.location.origin}/chat?id=${selectedChatId}`,
            receiverEmail: chat.otherUserData.email,
            message: newMessage.message,
            jwt: authToken || "",
          });
        } else if (!chat.otherUserData.email) {
          console.warn(
            "Cannot send email notification: Recipient has no email address"
          );
        } else if (!currentUserData) {
          console.warn(
            "Cannot send email notification: Current user data not available"
          );
        }
      } catch (emailError) {
        console.error("Error sending email notification:", emailError);
        // Don't show an error to the user, as the message was sent successfully
      }
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
                {emailBellOn
                  ? canSendEmailStatus.canSend
                    ? `${chat.otherUserData.name} will receive an email with your message`
                    : `Cannot send email: ${canSendEmailStatus.reason}`
                  : !canSendMessageStatus.canSend
                    ? canSendMessageStatus.reason
                    : `Click the bell to notify ${chat.otherUserData.name} by email`}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Button
              type="button"
              size="icon"
              variant={emailBellOn ? "secondary" : "default"}
              onClick={toggleNotifications}
              className={`transition-colors ${
                emailBellOn
                  ? "bg-zinc-200 hover:bg-zinc-300 text-zinc-700"
                  : "bg-zinc-800 hover:bg-zinc-700"
              }`}
            >
              {emailBellOn ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
          </TooltipProvider>
          <Button
            type="submit"
            size="icon"
            onClick={() => handleSend(newMessage)}
            disabled={!newMessage.trim()}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
