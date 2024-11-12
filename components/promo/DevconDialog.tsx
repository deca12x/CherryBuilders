"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles } from "lucide-react";
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
          backgroundImage: 'url("/images/devcon.png")',
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <DialogHeader className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-600/30 opacity-10 blur-lg" />
          <DialogTitle className="relative text-center text-3xl font-bold bg-gradient-to-r text-black bg-clip-text">
            Welcome to Devcon 2024
          </DialogTitle>
        </DialogHeader>

        <div className="relative flex flex-col items-center space-y-6 py-6">
          <div className="bg-background/20 backdrop-blur-sm p-4 rounded-xl">
            <p className="text-center max-w-xs text-black">
              Find builders to work with at ETHGlobal Bangkok, on your next
              startup or project!
            </p>
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
              className="text-sm text-black cursor-pointer hover:text-foreground transition-colors"
            >
              Don't show again
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
