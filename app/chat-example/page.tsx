'use client';

import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import ChatHeader from '@/components/chat/ChatHeader';
import ChatSidebar from '@/components/chat/ChatSideBar';
import MessageList from '@/components/chat/MessageList';
import MessageInput from '@/components/chat/MessageInput'

// Add this interface at the top of your file
interface ChatMessage {
  id: number;
  sender: string;
  message: string;
  created_at: string;
}

// Initialize Supabase client
const supabase = createClient('YOUR_SUPABASE_URL', 'YOUR_SUPABASE_ANON_KEY')

export default function ChatUI() {
  const [message, setMessage] = useState('')
  const [currentChat, setCurrentChat] = useState<ChatMessage[]>([])

  const chatHistory = [
    { id: 1, name: 'Alice', lastMessage: 'Hey, how are you?' },
    // ... other chat history items ...
  ]

  useEffect(() => {
    // Subscribe to new messages
    const channel = supabase
      .channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setCurrentChat(prevMessages => [...prevMessages, payload.new as ChatMessage])
      })
      .subscribe()

    // Fetch existing messages
    fetchMessages()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchMessages = async () => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) console.error('Error fetching messages:', error)
    else setCurrentChat(data as ChatMessage[])
  }

  const handleSend = async () => {
    if (message.trim()) {
      const { error } = await supabase
        .from('messages')
        .insert({ sender: 'User', message: message.trim() })
      
      if (error) console.error('Error sending message:', error)
      else setMessage('')
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar chatHistory={chatHistory} />
      <div className="flex-1 flex flex-col">
        <ChatHeader name="Alice" />
        <MessageList messages={currentChat} />
        <MessageInput
          message={message}
          setMessage={setMessage}
          handleSend={handleSend}
        />
      </div>
    </div>
  )
}