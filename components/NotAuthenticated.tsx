'use client';
import { DynamicWidget } from '@dynamic-labs/sdk-react-core';
import React from 'react';


const NotAuthenticated: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Not Authenticated</h1>
        <p>Please connect your wallet to access the chat.</p>
        <DynamicWidget />
      </div>
    </div>
  );
};

export default NotAuthenticated;