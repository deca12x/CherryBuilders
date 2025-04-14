"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  message?: string;
}

export default function LoadingSpinner({
  className,
  message = "Loading...",
}: LoadingSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 justify-center items-center h-full min-h-screen",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-red" />
      <div className="text-red-foreground text-xl">{message}</div>
    </div>
  );
}
