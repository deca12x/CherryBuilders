import React from "react";
import Image from "next/image";
import FiltersButton from "./FiltersButton";

interface NoUsersFoundProps {
  onOpenFilters: () => void;
}

const NoUsersFound: React.FC<NoUsersFoundProps> = ({ onOpenFilters }) => {
  return (
    <div className="flex flex-col gap-1 text-center justify-center items-center text-2xl font-bold w-full max-w-xl p-3">
      <div className="w-80 h-80 relative mb-4">
        <Image
          src="/images/tooManyFilters.png"
          alt="Too many filters"
          fill
          className="object-contain rounded-xl"
        />
      </div>
      <span className="mb-3">Try removing a filter or two</span>
      <FiltersButton onOpenFilters={onOpenFilters} />
    </div>
  );
};

export default NoUsersFound;
