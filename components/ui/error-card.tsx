"use client";
import React from "react";
import { Card, CardContent } from "./card";
import ConnectButton from "./connectButton";

const ErrorCard: React.FC = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center sm:p-24 p-3 bg-background">
      <Card className="sm:max-w-xl">
        <CardContent className="pt-6 pb-8">
          <div className="text-primary text-center text-2xl">An unexpected error occurred, please try again!</div>
        </CardContent>
      </Card>
    </main>
  );
};

export default ErrorCard;
