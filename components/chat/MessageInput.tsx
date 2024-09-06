'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, DollarSign, Image, FileText } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CreateRequestModal from './CreateRequestModal'

type MessageInputProps = {
  message: string;
  setMessage: (message: string) => void;
  handleSend: (message: string, type?: string) => void;
}

export default function MessageInput({ message, setMessage, handleSend }: MessageInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateRequest = (amount: string) => {
    const requestMessage = `Requested ${amount}`;
    handleSend(requestMessage, 'request');
    setIsModalOpen(false);
  }

  const onSend = () => {
    handleSend(message);
    setMessage('');
  }

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex space-x-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSend()}
          className="flex-1"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <Paperclip className="h-4 w-4 mr-2" />
              Attach
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onSelect={() => setIsModalOpen(true)}>
              <DollarSign className="mr-2 h-4 w-4" />
              <span>Create Request</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Image className="mr-2 h-4 w-4" />
              <span>Image</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FileText className="mr-2 h-4 w-4" />
              <span>Document</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button onClick={onSend}>
          <Send className="h-4 w-4" />
          <span className="sr-only">Send</span>
        </Button>
      </div>

      <CreateRequestModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateRequest={handleCreateRequest}
      />
    </div>
  )
}