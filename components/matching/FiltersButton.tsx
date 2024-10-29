import { Filter } from "lucide-react";

interface FiltersButtonProps {
  onOpenFilters: () => void;
  className?: string;
  showText?: boolean;
}

export default function FiltersButton({ onOpenFilters, className, showText = true }: FiltersButtonProps) {
  return (
    <button
      className={`flex justify-center items-center bg-secondary rounded-xl max-h-9 max-w-32 p-3 ${className}`}
      onClick={onOpenFilters}
    >
      <Filter className="h-5 w-5" />
      {showText && <span className="ml-2">Filters</span>}
    </button>
  );
}
