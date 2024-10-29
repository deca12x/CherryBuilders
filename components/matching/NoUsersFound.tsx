import React from "react";
import FiltersButton from "./FiltersButton";

interface NoUsersFoundProps {
  onOpenFilters: () => void;
}

const NoUsersFound: React.FC<NoUsersFoundProps> = ({ onOpenFilters }) => {
  return (
    <div className="flex flex-col gap-2 text-center justify-center items-center text-2xl font-bold w-full max-w-xl">
      <span>It seems nobody is here 🤔</span>
      <span className="text-xl">Why don't you try to remove a filter or two?</span>
      <FiltersButton onOpenFilters={onOpenFilters} />
    </div>
  );
};

export default NoUsersFound;
