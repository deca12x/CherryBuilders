import { UserTag, UserType } from "@/lib/supabase/types";

interface UserTagsProps {
  user: UserType | null;
}

export default function UserTags({ user }: UserTagsProps) {
  if (!user?.tags) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {user.tags.map((tag: UserTag, index: number) => (
        <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm">
          {tag.charAt(0).toUpperCase() + tag.slice(1)}
        </span>
      ))}
    </div>
  );
}
