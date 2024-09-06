'use client';

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import ChatHeader from '@/components/chat/ChatHeader';
import ChatSidebar from '@/components/chat/ChatSideBar';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput'
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';

interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  created_at: string;
}

interface User {
  address: string;
  name: string;
}

type ChatParentProps = {
    userAddress: string;
    chatId: string;  // Add this line
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_ANON_KEY as string)

export default function ChatParent({
    userAddress,
    chatId  // Add this line
}: ChatParentProps) {
  const [message, setMessage] = useState('')
  const [currentChat, setCurrentChat] = useState<ChatMessage[]>([])
  const [otherUser, setOtherUser] = useState<User>({ address: '0x456...', name: 'Bob' })

  const chatHistory = [
    { id: 1, name: otherUser.name, lastMessage: 'Hey, how are you?' },
    // ... other chat history items ...
  ]

  useEffect(() => {
    fetchMessages()

    const channel = supabase
      .channel(`chat:${chatId}`)  // Update this line
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages', filter: `chat_id=eq.${chatId}` }, (payload) => {
        setCurrentChat(prevMessages => [...prevMessages, payload.new as ChatMessage])
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [chatId])  // Add chatId to the dependency array

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)  // Add this line
      .order('created_at', { ascending: true })
    
    if (error) console.error('Error fetching messages:', error)
    else setCurrentChat(data as ChatMessage[])
  }

  const handleSend = async () => {
    if (message.trim()) {
      const { error } = await supabase
        .from('messages')
        .insert({ sender: userAddress, message: message.trim(), chat_id: chatId })  // Add chat_id here
      
      if (error) console.error('Error sending message:', error)
      else setMessage('')
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar chatHistory={chatHistory} />
      <div className="flex-1 flex flex-col">
        <ChatHeader name={otherUser.name} />
  
        <MessageList 
          messages={currentChat} 
          currentUserAddress={userAddress}
        />
        <MessageInput
          message={message}
          setMessage={setMessage}
          handleSend={handleSend}
        />
      </div>
    </div>
  )
}