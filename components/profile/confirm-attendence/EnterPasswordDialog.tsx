'use client'

import { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from "@/components/ui/input-otp"
import { toast } from '@/hooks/use-toast'
import { useAccount } from 'wagmi'
import LannaHackathonConfirmation from './LannaHackathonConfirmation'
import { useRouter } from 'next/navigation'


type EnterPasswordDialogProps = {
  onSuccess?: () => void;
  isFromCreation?: boolean;
}

export default function EnterPasswordDialog({ onSuccess, isFromCreation }: EnterPasswordDialogProps) {
  const [open, setOpen] = useState(false)
  const [pin, setPin] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isConfirmed, setIsConfirmed] = useState(false)
  const { address } = useAccount()
  const router = useRouter()

  useEffect(() => {
    const checkAttendance = async () => {
      if (address) {
        try {
          const response = await fetch(`/api/checkHackathonAttendance?hackathon=LANNA_2024&evmAddress=${address}`);
          
          if (!response.ok) {
            throw new Error('Failed to fetch attendance status');
          }

          const data = await response.json();
          setIsConfirmed(data.isConfirmed);

     
          if (!data.isConfirmed) {
            console.log("No Lanna confirmation");
          }
        } catch (error) {
          console.error('Error checking attendance:', error);
          // Removed the error toast
        }
      }
    };

    checkAttendance();
  }, [address]);

  const handlePinChange = (value: string) => {
    setPin(value)
  }

  const handleConfirm = async () => {
    if (pin.length === 6 && address) {
      setIsLoading(true)
      try {
        const response = await fetch('/api/verifyOTP', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            hackathon: 'LANNA_2024', 
            otp: pin,
            evmAddress: address 
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to verify OTP');
        }

        const data = await response.json();

        if (data.success) {
          toast({
            title: "Attendance Confirmed",
            description: data.message,
          })
          setOpen(false)
          setPin('')
          setIsConfirmed(true)
          if(isFromCreation){
            router.push('/matching')
          }
        } else {
          toast({
            title: "Verification Failed",
            description: data.message,
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error('Error verifying OTP:', error)
        toast({
          title: "Error",
          description: "An error occurred while verifying your attendance.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    } else if (!address) {
      toast({
        title: "Error",
        description: "Please connect your wallet to confirm attendance.",
        variant: "destructive",
      })
    } else {
      toast({
        title: "Invalid PIN",
        description: "Please enter a 6-digit PIN.",
        variant: "destructive",
      })
    }
  }

  if (isConfirmed) {
    return <LannaHackathonConfirmation />
  }

  // Show the dialog button when not confirmed
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className='bg-gradient-to-r from-[#f5acac] to-[#8ec5d4] text-white'>Confirm Lanna Hackathon Attendance</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Confirm Lanna Hackathon Attendance</DialogTitle>
          <DialogDescription>
            Please enter your 6-digit PIN to confirm your attendance.
          </DialogDescription>
        </DialogHeader>
        <InputOTP maxLength={6} value={pin} onChange={handlePinChange}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
          </InputOTPGroup>
          <InputOTPSeparator />
          <InputOTPGroup>
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)} disabled={isLoading}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Verifying...' : 'Confirm Attendance'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
