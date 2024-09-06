export default function ChatHeader({ name }: { name: string }) {
    return (
      <div className="p-4 border-b border-border bg-card">
        <h2 className="text-xl font-semibold">{name}</h2>
      </div>
    )
  }