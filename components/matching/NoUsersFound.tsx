import React from 'react';
import { Filter } from 'lucide-react';

interface NoUsersFoundProps {
  onOpenFilters: () => void;
}

const NoUsersFound: React.FC<NoUsersFoundProps> = ({ onOpenFilters }) => {
  return (
    <div className="flex flex-col gap-2 text-center justify-center items-center text-2xl font-bold w-full max-w-xl">
      <span>It seems nobody is here 🤔</span>
      <span className="text-xl">Why don't you try to remove a filter or two?</span>
      <button
        className="flex justify-end items-center bg-card rounded-xl py-2 px-3 mt-2"
        onClick={onOpenFilters}
      >
        <Filter className="mr-2 h-5 w-5" />
        Filters
      </button>
    </div>
  );
};

export default NoUsersFound;
