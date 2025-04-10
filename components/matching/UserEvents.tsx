import { UserType } from "@/lib/supabase/types";
import { CheckCircle2 } from "lucide-react";

interface UserTagsProps {
  user: UserType | null;
}

export default function UserEvents({ user }: UserTagsProps) {
  if (!user?.events) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {user.events.map((event) => (
        <span
          key={event.slug}
          className="bg-gradient-to-r from-[#f5acac] to-[#8ec5d4] text-red-foreground px-2 py-1 rounded-full text-sm flex"
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          <p className="font-bold">{event.name}</p>
        </span>
      ))}
    </div>
  );
}
