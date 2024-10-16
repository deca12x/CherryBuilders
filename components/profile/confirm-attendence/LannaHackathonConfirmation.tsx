import { CheckCircle } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { useState } from 'react'

export default function LannaHackathonConfirmation() {


  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <CheckCircle className="w-5 h-5 text-[#8ec5d4]" />
        <span className="font-medium bg-gradient-to-r from-[#f5acac] to-[#8ec5d4] text-transparent bg-clip-text">
          Lanna 2024 Hackathon confirmed
        </span>
      </div>
  
    </div>
  )
}
