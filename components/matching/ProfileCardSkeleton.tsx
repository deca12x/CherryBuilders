import React from "react";

const ProfileCardSkeleton: React.FC = () => {
  return (
    <div className="flex flex-col gap-3">
      {/* Stats Skeleton */}
      <div className="flex flex-row gap-3">
        <div className="flex flex-grow flex-col items-center bg-card rounded-xl p-3">
          <div className="h-4 w-24 bg-gray-300 rounded mb-2 animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex flex-col items-center bg-card rounded-xl p-3">
          <div className="h-4 w-24 bg-gray-300 rounded mb-2 animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
      {/* Bio Skeleton */}
      <div className="flex flex-col gap-2 bg-card rounded-xl p-3">
        <div className="h-4 w-24 bg-gray-300 rounded mb-2 animate-pulse"></div>
        <div className="h-4 w-full bg-gray-300 rounded mb-1 animate-pulse"></div>
        <div className="h-4 w-full bg-gray-300 rounded mb-1 animate-pulse"></div>
        <div className="h-4 w-3/4 bg-gray-300 rounded animate-pulse"></div>
      </div>
      {/* Links Skeleton */}
      <div className="flex flex-col gap-3 bg-card rounded-xl p-3">
        <div className="h-4 w-16 bg-gray-300 rounded mb-2 animate-pulse"></div>
        <div className="flex justify-between sm:px-14">
          <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
        </div>
        <div className="flex justify-between sm:px-14">
          <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
          <div className="h-6 w-24 bg-gray-300 rounded animate-pulse"></div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCardSkeleton;
