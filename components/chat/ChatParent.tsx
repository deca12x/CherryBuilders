'use client';

import { useState, useEffect, useRef } from 'react'
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
    chat_id: string;
}

interface User {
    address: string;
    name: string;
}

type ChatParentProps = {
    userAddress: string;
    chatId: string;
}

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL as string, process.env.NEXT_PUBLIC_ANON_KEY as string, {
    realtime: {
        params: {
            eventsPerSecond: 10
        }
    }
})

export default function ChatParent({
    userAddress,
    chatId
}: ChatParentProps) {
    const [message, setMessage] = useState('')
    const [currentChat, setCurrentChat] = useState<ChatMessage[]>([])
    const [otherUser, setOtherUser] = useState<User>({ address: '0x456...', name: 'Bob' })
    const channelRef = useRef<any>(null);


    useEffect(() => {
        console.log('ChatParent: Component mounted or chatId/userAddress changed')
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('Supabase connection status:', supabase.getChannels().length > 0 ? 'Connected' : 'Disconnected')

        fetchMessages()
        
        console.log(`Subscribing to channel: chat:${chatId}`)
        channelRef.current = supabase
            .channel(`chat:${chatId}`)
            .on('postgres_changes', 
                { 
                    event: '*', // Listen for all events (INSERT, UPDATE, DELETE)
                    schema: 'public', 
                    table: 'messages', 
                    filter: `chat_id=eq.${chatId}` 
                }, 
                (payload) => {
                    console.log('Received change from Supabase:', payload)
                    if (payload.eventType === 'INSERT') {
                        const newMessage = payload.new as ChatMessage;
                        console.log('Processed new message:', newMessage)
                        if (newMessage.sender !== userAddress) {
                            console.log('Updating chat with new message from other user:', newMessage)
                            setCurrentChat(prevMessages => {
                                console.log('Current chat before update:', prevMessages)
                                const updatedChat = [...prevMessages, newMessage];
                                console.log('Updated chat after receiving new message:', updatedChat)
                                return updatedChat;
                            });
                        } else {
                            console.log('Received own message, not updating chat:', newMessage)
                        }
                    }
                }
            )
            .subscribe((status: string, err?: Error) => {
                if (err) {
                    console.error('Subscription error:', err)
                } else {
                    console.log('Subscription status:', status)
                    console.log('Successfully subscribed to channel')
                }
            })

        // Ping the channel every 30 seconds to keep the connection alive
        const intervalId = setInterval(() => {
            console.log('Pinging channel to keep connection alive')
            channelRef.current.send({
                type: 'broadcast',
                event: 'ping',
                payload: {},
            })
        }, 30000)

        return () => {
            console.log('ChatParent: Component unmounting, unsubscribing from channel')
            if (channelRef.current) {
                supabase.removeChannel(channelRef.current)
            }
            clearInterval(intervalId)
        }
    }, [chatId, userAddress])

    const fetchMessages = async () => {
        console.log('Fetching messages for chat:', chatId)
        const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('chat_id', chatId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching messages:', error)
        } else {
            console.log('Fetched messages:', data)
            setCurrentChat(data as ChatMessage[])
        }
    }

    const handleSend = async () => {
        if (message.trim()) {
            console.log('Sending message:', message)
            const newMessage: ChatMessage = {
                id: Date.now(),
                sender: userAddress,
                message: message.trim(),
                chat_id: chatId,
                created_at: new Date().toISOString()
            };
        
            console.log('Adding message to UI:', newMessage)
            setCurrentChat(prevMessages => {
                console.log('Current chat before sending:', prevMessages)
                const updatedChat = [...prevMessages, newMessage];
                console.log('Updated chat after sending:', updatedChat)
                return updatedChat;
            });
            setMessage('');
        
            const { data, error } = await supabase
                .from('messages')
                .insert(newMessage)
                .select()
            
            if (error) {
                console.error('Error sending message:', error)
                console.log('Reverting UI update')
                setCurrentChat(prevMessages => prevMessages.filter(msg => msg.id !== newMessage.id));
            } else if (data) {
                console.log('Message sent successfully to Supabase:', data[0])
                setCurrentChat(prevMessages => 
                    prevMessages.map(msg => 
                        msg.id === newMessage.id ? data[0] : msg
                    )
                );
            }
        }
    }

    return (
        <div className="flex h-screen bg-background">
            <ChatSidebar userAddress={userAddress} />
            <div className="flex-1 flex flex-col">
                <ChatHeader name={otherUser.name} />
                <MessageList
                    key={currentChat.length}  // Force re-render on messages change
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