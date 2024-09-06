'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"

type CreateRequestModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onCreateRequest: (amount: string) => void;
}

export default function CreateRequestModal({ isOpen, onClose, onCreateRequest }: CreateRequestModalProps) {
  const [amount, setAmount] = useState('')

  const handleCreateRequest = () => {

    

    onCreateRequest(amount)
    setAmount('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Request</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <Input
            type="number"
            placeholder="Enter amount..."
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleCreateRequest}>Create Request</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}