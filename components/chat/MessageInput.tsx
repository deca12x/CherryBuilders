import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send } from 'lucide-react'

type MessageInputProps = {
  message: string;
  setMessage: (message: string) => void;
  handleSend: () => void;
}

export default function MessageInput({ message, setMessage, handleSend }: MessageInputProps) {
  return (
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
  )
}