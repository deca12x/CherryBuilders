"use client";

import { Filter } from "lucide-react";

interface FiltersButtonProps {
  onOpenFilters: () => void;
  className?: string;
}

export default function FiltersButton({
  onOpenFilters,
  className,
}: FiltersButtonProps) {
  return (
    <button
      className={`flex justify-center items-center rounded-xl max-h-9 max-w-32 p-3
      bg-gradient-to-r from-amber-300 via-yellow-500 to-amber-300
      bg-[length:200%_100%] animate-shimmer
      hover:opacity-90 transition-opacity
      ${className}`}
      onClick={onOpenFilters}
    >
      <Filter className="h-5 w-5 text-black" />
      {<span className="ml-2 font-medium text-black">Filters</span>}
    </button>
  );
}
