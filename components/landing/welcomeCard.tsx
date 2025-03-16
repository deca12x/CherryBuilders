"use client";
import { K2D } from "next/font/google";
import ConnectButton from "@/components/ui/connectButton";
import React, { forwardRef } from "react";
import SocialLink from "./socialLink";
import Image from "next/image";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

interface WelcomeCardProps {
  isAuthenticated: boolean;
}

const WelcomeCard = forwardRef<HTMLDivElement, WelcomeCardProps>(
  ({ isAuthenticated }, ref) => {
    return (
      <div
        ref={ref}
        className="flex flex-col items-center justify-center w-full max-w-[90vw] sm:max-w-xl p-3 sm:p-6"
      >
        <h1
          className={`flex items-center text-5xl sm:text-6xl font-bold text-center text-primary ${k2d.className}`}
        >
          <Image
            src="/images/logo.svg"
            alt="Cherry logo"
            width={48}
            height={48}
            className="sm:w-[56px] sm:h-[56px]"
          />
          cherry.builders
        </h1>
        <p className="text-center text-muted-foreground mt-4">
          Find collaborators for your next hackathon or conference
        </p>
        <div className="flex flex-col justify-center items-center mt-4 gap-3">
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
        </div>
      </div>
    );
  }
);
WelcomeCard.displayName = "WelcomeCard";

export default WelcomeCard;
