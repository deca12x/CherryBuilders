"use client";
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingSpinner: React.FC = () => {
  return (
    <div className="flex flex-col gap-3 justify-center items-center h-full min-h-screen">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-primary-foreground text-xl">Loading...</div>
    </div>
  );
};

export default LoadingSpinner;
