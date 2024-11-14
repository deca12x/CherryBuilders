"use client";
import React from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
}

export default function LoadingSpinner({ className }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex flex-col gap-3 justify-center items-center h-full min-h-screen", className)}>
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <div className="text-primary-foreground text-xl">Loading...</div>
    </div>
  );
}
