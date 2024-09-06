'use client';

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageCircle, Send } from 'lucide-react'

export default function ChatUI() {
  const [message, setMessage] = useState('')

  const chatHistory = [
    { id: 1, name: 'Alice', lastMessage: 'Hey, how are you?' },
    { id: 2, name: 'Bob', lastMessage: 'Did you see the game last night?' },
    { id: 3, name: 'Charlie', lastMessage: 'I\'m working on the project now.' },
    { id: 4, name: 'Diana', lastMessage: 'Let\'s meet for coffee tomorrow.' },
  ]

  const currentChat = [
    { id: 1, sender: 'Alice', message: 'Hi there! How\'s your day going?' },
    { id: 2, sender: 'You', message: 'Hey Alice! It\'s going well, thanks for asking. How about yours?' },
    { id: 3, sender: 'Alice', message: 'That\'s great to hear! My day has been pretty good too. I just finished a big project at work.' },
    { id: 4, sender: 'You', message: 'Wow, congratulations! That must feel amazing. What was the project about?' },
  ]

  const handleSend = () => {
    if (message.trim()) {
      // Here you would typically send the message to your backend
      console.log('Sending message:', message)
      setMessage('')
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Chat History Sidebar */}
      <div className="w-1/4 bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Chats</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-5rem)]">
          {chatHistory.map((chat) => (
            <div key={chat.id} className="flex items-center p-4 hover:bg-accent cursor-pointer">
              <Avatar className="h-10 w-10">
                <AvatarImage src={`https://api.dicebear.com/6.x/initials/svg?seed=${chat.name}`} />
                <AvatarFallback>{chat.name[0]}</AvatarFallback>
              </Avatar>
              <div className="ml-4">
                <p className="font-semibold">{chat.name}</p>
                <p className="text-sm text-muted-foreground truncate">{chat.lastMessage}</p>
              </div>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-border bg-card">
          <h2 className="text-xl font-semibold">Alice</h2>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          {currentChat.map((msg) => (
            <div key={msg.id} className={`flex mb-4 ${msg.sender === 'You' ? 'justify-end' : 'justify-start'}`}>
              <div className={`rounded-lg p-3 max-w-xs ${msg.sender === 'You' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                <p>{msg.message}</p>
              </div>
            </div>
          ))}
        </ScrollArea>

        {/* Message Input */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex space-x-2">
            <Input
              type="text"
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1"
            />
            <Button onClick={handleSend}>
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}