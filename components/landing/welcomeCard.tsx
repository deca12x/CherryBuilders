"use client";
import { K2D } from "next/font/google";
import ConnectButton from "@/components/ui/connectButton";
import React, { forwardRef } from "react";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

interface WelcomeCardProps {
  isAuthenticated: boolean;
}

const WelcomeCard = forwardRef<HTMLDivElement, WelcomeCardProps>(
  ({ isAuthenticated }, ref) => {
    return (
      <div
        ref={ref}
        className="flex flex-col items-center justify-center w-full max-w-[90vw] sm:max-w-xl p-6"
      >
        <h1
          className={`text-3xl font-bold text-center text-primary ${k2d.className}`}
        >
          Welcome to
        </h1>
        <h1
          className={`text-5xl sm:text-6xl font-bold text-center text-primary ${k2d.className}`}
        >
          cherry.builders
        </h1>
        <div className="flex flex-col justify-center items-center mt-7 gap-3">
          {isAuthenticated ? (
            <div className="flex flex-col items-center gap-1">
              <p className="text-center text-lg text-primary-foreground">
                Wallet connected!
              </p>
              <p className="text-center text-lg text-primary-foreground">
                Redirecting...
              </p>
            </div>
          ) : (
            <ConnectButton />
          )}
          <p className="text-sm text-center text-muted-foreground mt-4">
            Cherry is currently under development, use at your own discretion
          </p>
        </div>
      </div>
    );
  }
);
WelcomeCard.displayName = "WelcomeCard";

export default WelcomeCard;
