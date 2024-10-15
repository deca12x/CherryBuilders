'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, Paperclip, DollarSign, Image as ImageIcon, FileText } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import CreateRequestModal from './CreateRequestModal'
import Image from 'next/image'

type MessageInputProps = {
  message: string;
  setMessage: (message: string) => void;
  handleSend: (message: string, type?: string, requestId?: string) => void;
  payeeAddress: string;
  payerAddress: string;
}

export default function MessageInput({ message, setMessage, handleSend, payeeAddress, payerAddress }: MessageInputProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateRequest = (amount: string, requestId: string) => {
    const requestMessage = `Requested ${amount}`;
    handleSend(requestMessage, 'request', requestId);
    setIsModalOpen(false);
  }

  const onSend = () => {
    handleSend(message);
    setMessage('');
  }

  return (
    <div className="p-4 border-t border-border bg-card">
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Input
          type="text"
          placeholder="Type a message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && onSend()}
          className="flex-1"
        />
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Paperclip className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Attach</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onSelect={() => setIsModalOpen(true)} className="opacity-50 cursor-not-allowed">
                <Image src={'/images/request.png'} className="mr-2 h-4 w-4" width={24} height={24} alt="request" />
                <span>Create Request (coming soon)</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="opacity-50 cursor-not-allowed">
                <ImageIcon className="mr-2 h-4 w-4" />
                <span>Image (coming soon)</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="opacity-50 cursor-not-allowed">
                <FileText className="mr-2 h-4 w-4" />
                <span>Document (coming soon)</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={onSend} className="w-full sm:w-auto">
            <Send className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline">Send</span>
          </Button>
        </div>
      </div>

      <CreateRequestModal
        payeeAddress={payeeAddress}
        payerAddress={payerAddress}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreateRequest={handleCreateRequest}
      />
    </div>
  )
}