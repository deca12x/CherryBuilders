import { useEffect, useRef } from "react";
import { UserTag, UserType } from "@/lib/supabase/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface UserTagsProps {
  user: UserType | null;
}

export default function UserTags({ user }: UserTagsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

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
    var slider = document.getElementById("slider");
    if (slider) {
      slider.scrollLeft = slider.scrollLeft - 300;
    }
  };

  const slideRight = () => {
    var slider = document.getElementById("slider");
    if (slider) {
      slider.scrollLeft = slider.scrollLeft + 300;
    }
  };

  if (!user?.tags) return null;

  return (
    <div className="relative flex items-center hover:px-7 transition-all duration-250 group">
      <div
        className="absolute left-0 pr-6 cursor-pointer text-secondary-foreground sm:block hidden opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={slideLeft}
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
        onClick={slideRight}
      >
        <ChevronRight />
      </div>
    </div>
  );
}
