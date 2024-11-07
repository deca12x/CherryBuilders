import { useEffect, useRef } from "react";
import { UserTag, UserType } from "@/lib/supabase/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UserTagsProps {
  user: UserType | null | { tags: UserTag[] };
  size?: "sm" | "default";
}

export default function UserTags({ user, size = "default" }: UserTagsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Adjust tags for MiniProfileCard
  const scrollAmount = size === "sm" ? 100 : 300;
  const tagStyles = size === "sm" ? "px-1.5 py-0.5 text-[8px]" : "px-2 py-1 text-sm";

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const handleScroll = () => {
      scrollContainer.classList.add("scrollbar-thin");
      scrollContainer.classList.remove("scrollbar-none");
    };

    scrollContainer.addEventListener("scroll", handleScroll);

    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const slideLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft -= scrollAmount;
    }
  };

  const slideRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft += scrollAmount;
    }
  };

  if (!user?.tags) return null;

  return (
    <div className="relative flex items-center sm:hover:px-7 transition-all duration-250 group">
      <div
        className="absolute left-0 pr-6 cursor-pointer text-secondary-foreground sm:block hidden opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={slideLeft}
      >
        <ChevronLeft />
      </div>
      <div
        ref={scrollContainerRef}
        id="slider"
        className="flex justify-start items-center cursor-default sm:gap-2 gap-1.5 pb-2 sm:pb-0 pr-0.5 overflow-x-auto scroll-smooth scrollbar-none sm:scrollbar-none"
      >
        {user.tags.map((tag: UserTag, index: number) => (
          <div
            key={index}
            className="flex text-nowrap bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm"
          >
            {tag.charAt(0).toUpperCase() + tag.slice(1)}
          </div>
        ))}
      </div>
      <div
        className="absolute right-0 pl-6 cursor-pointer text-secondary-foreground sm:block hidden opacity-0 group-hover:opacity-100 transition-opacity"
        onMouseDown={slideRight}
      >
        <ChevronRight />
      </div>
    </div>
  );
}
