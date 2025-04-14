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
        className="sm:max-w-md overflow-hidden"
        style={{
          backgroundImage: 'url("/images/eventDialog.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <DialogHeader className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-600/30 opacity-10 blur-lg" />
          <DialogTitle className="relative text-center text-3xl font-bold bg-gradient-to-r text-black bg-clip-text">
            2-5 April: ETH Bucharest
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex flex-col items-center space-y-6 py-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-2">
            <Link
              href="https://ethbucharest.ro/"
              target="_blank"
              className="w-full transition-all duration-300 transform hover:scale-105"
              onClick={() => {
                if (checked) onDontShowAgain();
                setOpen(false);
              }}
            >
              <img
                src="/images/eventDialogBucharest.jpeg"
                alt="ETH Bucharest Conference & Hackathon"
                className="rounded-xl object-cover w-full"
              />
            </Link>
          </div>

          <Button
            asChild
            className="bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25 rounded-xl"
            size="lg"
          >
            <Link
              href="https://x.com/CherryBuilders"
              target="_blank"
              className="flex items-center space-x-2"
              onClick={() => {
                if (checked) onDontShowAgain();
                setOpen(false);
              }}
            >
              <span className="text-lg">Follow us on X</span>
            </Link>
          </Button>

          <div className="flex items-center space-x-2 gap-2 bg-background/20 backdrop-blur-sm p-2 rounded-xl">
            <Checkbox
              id="dontShow"
              checked={checked}
              onCheckedChange={() => setChecked(!checked)}
            />
            <label
              htmlFor="dontShow"
              className="text-sm text-black cursor-pointer hover:text-white transition-colors"
            >
              Don't show again
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
