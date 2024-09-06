import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DynamicWidget } from "@dynamic-labs/sdk-react-core";

type ChatHistoryItem = {
  id: number;
  name: string;
  lastMessage: string;
}

export default function ChatSidebar({ chatHistory }: { chatHistory: ChatHistoryItem[] }) {
  return (
    <div className="w-1/4 bg-card border-r border-border">
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-semibold">Chats</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-5rem)]">
      <DynamicWidget />
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
  )
}