"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Checkbox } from "@/components/ui/checkbox";

interface DevconDialogProps {
  onDontShowAgain: () => void;
}

export default function DevconDialog({ onDontShowAgain }: DevconDialogProps) {
  const [open, setOpen] = React.useState(true);
  const [checked, setChecked] = React.useState(false);

  return (
    <Dialog
      open={open}
      onOpenChange={() => {
        if (checked) onDontShowAgain();
        setOpen(false);
      }}
    >
      <DialogContent
        className="max-w-[calc(100%-2rem)] sm:max-w-lg overflow-hidden p-4"
        style={{
          backgroundImage: 'url("/images/eventDialog.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <DialogHeader className="relative pb-2">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-600/30 opacity-10 blur-lg" />
          <DialogTitle className="relative text-center text-xl font-bold bg-gradient-to-r text-black bg-clip-text py-1">
            Coming up on cherry.builders
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex flex-col items-center space-y-3 py-2">
          {/* Events grid - 2 on top, 1 below on desktop; stacked on mobile */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full px-2">
            {/* First row - 2 events on desktop */}
            <Link
              href="https://www.ethdublin.io/"
              target="_blank"
              className="w-full transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                if (checked) onDontShowAgain();
                setOpen(false);
              }}
            >
              <img
                src="/images/eventDialogDublin.png"
                alt="Event promotion"
                className="aspect-video rounded-xl object-cover w-full"
              />
            </Link>
            <Link
              href="https://ethbelgrade.rs/"
              target="_blank"
              className="w-full transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                if (checked) onDontShowAgain();
                setOpen(false);
              }}
            >
              <img
                src="/images/eventDialogBelgrade.png"
                alt="Event promotion"
                className="aspect-video rounded-xl object-cover w-full"
              />
            </Link>

            {/* Second row - 1 centered event on desktop */}
            <Link
              href="https://lu.ma/cookathon"
              target="_blank"
              className="w-full sm:col-span-2 sm:w-1/2 sm:mx-auto transition-all duration-300 transform hover:scale-105 mb-0"
              onClick={() => {
                if (checked) onDontShowAgain();
                setOpen(false);
              }}
            >
              <img
                src="/images/eventDialogCookathon.png"
                alt="Event promotion"
                className="aspect-video rounded-xl object-cover w-full"
              />
            </Link>
          </div>

          {/* Footer section with button and checkbox side by side */}
          <div className="flex flex-row items-center justify-between w-full px-2 gap-2">
            <Button
              asChild
              className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 transition-all duration-300 shadow-lg hover:shadow-blue-500/25 rounded-xl flex-1"
            >
              <Link
                href="https://x.com/CherryBuilders"
                target="_blank"
                className="flex items-center justify-center"
                onClick={() => {
                  if (checked) onDontShowAgain();
                  setOpen(false);
                }}
              >
                <span className="text-sm sm:text-base">Find out more on X</span>
              </Link>
            </Button>

            <div className="flex items-center space-x-2 gap-1 bg-background/20 backdrop-blur-sm p-2 rounded-xl flex-1 justify-center">
              <Checkbox
                id="dontShow"
                checked={checked}
                onCheckedChange={() => setChecked(!checked)}
              />
              <label
                htmlFor="dontShow"
                className="text-xs sm:text-sm text-black cursor-pointer hover:text-white transition-colors"
              >
                Don't show again
              </label>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
