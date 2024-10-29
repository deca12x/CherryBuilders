import { cn } from "@/lib/utils";
import { Filter } from "lucide-react";

interface FiltersButtonProps {
  onOpenFilters: () => void;
  className?: string;
}

export default function FiltersButton({ onOpenFilters, className }: FiltersButtonProps) {
  return (
    <button
      className={cn(`flex justify-center items-center bg-card rounded-xl max-h-9 max-w-32 py-1 px-3 ${className}`)}
      onClick={onOpenFilters}
    >
      <Filter className="mr-2 h-5 w-5" />
      <span>Filters</span>
    </button>
  );
}
