import { CheckCircle } from 'lucide-react'

export default function LannaHackathonConfirmation() {
  return (
    <div className="flex items-center space-x-2 text-green-600">
      <CheckCircle className="w-5 h-5" />
      <span className="font-medium">Lanna 2024 Hackathon confirmed</span>
    </div>
  )
}