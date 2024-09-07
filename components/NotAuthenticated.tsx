'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import React from 'react';


const NotAuthenticated: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
        <p>Please connect your wallet to access the chat.</p>
     <ConnectButton />
      </div>
    </div>
  );
};

export default NotAuthenticated;