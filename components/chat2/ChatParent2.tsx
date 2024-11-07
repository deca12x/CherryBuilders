"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ChatList from "./ChatList";
import ChatWindow from "./ChatWindow";
import ContactProfile from "./ContactProfile";
import useWindowSize from "./hook";

type ChatHistoryItem = {
  id: string;
  name: string;
  lastMessage: string;
  otherUserAddress: string;
  profilePicture: string;
};

// Breakpoint for switching to mobile layout
const SM_BREAKPOINT = 640;

export default function ChatApp({ authToken }: { authToken: string | null }) {
  const [selectedChat, setSelectedChat] = useState<ChatHistoryItem | null>(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const windowSize = useWindowSize();

  const isMobile = windowSize.width <= SM_BREAKPOINT;

  return (
    <div className="flex h-screen overflow-hidden">
      <motion.div
        initial={{ width: "100%" }}
        animate={{
          width: selectedChat && isMobile ? "0%" : "100%",
          x: selectedChat && isMobile ? -50 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="h-full sm:w-1/3 pb-[58px] sm:max-w-sm border-r border-border"
      >
        <ChatList onSelectChat={setSelectedChat} />
      </motion.div>

      <AnimatePresence>
        {selectedChat && (
          <motion.div
            key="chat-window"
            initial={isMobile ? { x: "100%" } : { width: "100%" }}
            animate={isMobile ? { x: isProfileOpen ? -50 : 0 } : {}}
            exit={isMobile ? { x: "100%" } : {}}
            transition={{ duration: 0.3 }}
            className={`${isMobile ? "fixed inset-0" : "relative flex-grow"}`}
          >
            <ChatWindow
              chat={selectedChat}
              onBack={() => setSelectedChat(null)}
              onOpenProfile={() => setIsProfileOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isProfileOpen && (
          <motion.div
            key="contact-profile"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 sm:w-1/3 sm:relative"
          >
            <ContactProfile contact={selectedChat} onClose={() => setIsProfileOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
