"use client";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import React from "react";

const NotAuthenticated: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen m-3">
      <div className="flex flex-col text-center items-center">
        <h1 className="text-2xl font-bold">Not Authenticated</h1>
        <p className="mb-5 mt-1">Please connect your wallet to access the app.</p>
        <ConnectButton />
      </div>
    </div>
  );
};

export default NotAuthenticated;
