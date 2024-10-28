'use client'

import React from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Heart, Sparkles } from "lucide-react"
import Link from 'next/link'
import { Checkbox } from "@/components/ui/checkbox"

interface G22DialogProps {
  onDontShowAgain: () => void;
}

export default function G22Dialog({ onDontShowAgain }: G22DialogProps) {
  const [open, setOpen] = React.useState(true)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md overflow-hidden">
        <DialogHeader className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-green-400/30 to-emerald-600/30 opacity-10 blur-lg" />
          <DialogTitle className="relative text-center text-3xl font-bold bg-gradient-to-r from-green-500 to-emerald-600 bg-clip-text text-transparent   ">
            Cherry.builders is live for G22! 
            <Sparkles className="inline-block ml-2 text-amber-400 animate-pulse" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="relative flex flex-col items-center space-y-6 py-6">
          <p className="text-center text-muted-foreground max-w-xs">
            Join us in building something amazing! Even the smallest contribution can make a big difference.
          </p>
          
          <div className="relative">
            <div className="absolute inset-0 bg-green-500/40 opacity-15 blur-sm rounded-full animate-pulse" />
            <Heart className="relative h-12 w-12 text-green-500/90 animate-pulse" />
          </div>
          
          <Button asChild
            className="bg-gradient-to-r from-green-400 to-emerald-600 hover:from-green-500 hover:to-emerald-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-green-500/25 rounded-xl"
            size="lg"
          >
            <Link 
              href="https://explorer.gitcoin.co/#/round/42161/611/27" 
              target="_blank" 
              className="flex items-center space-x-2"
              onClick={() => setOpen(false)}
            >
              <span className='text-lg'>Support the Project</span>
              <Sparkles className="h-4 w-4" />
            </Link>
          </Button>
          
          <p className="text-sm text-center text-muted-foreground italic max-w-xs">
            ps: even 1 cent can go very far and make a huge impact! ;)
          </p>
          
          <div className="flex items-center space-x-2">
            <Checkbox id="dontShow" onCheckedChange={(checked) => {
              if (checked) onDontShowAgain();
            }} />
            <label htmlFor="dontShow" className="text-sm text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
              Don't show again
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
