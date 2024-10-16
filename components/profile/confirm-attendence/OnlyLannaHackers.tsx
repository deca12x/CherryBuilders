import { CheckCircle } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { useToast } from '@/hooks/use-toast'


export default function OnlyLannaHackers() {
  const [matchOnlyLanna, setMatchOnlyLanna] = useState(false)
  const { address } = useAccount()
  const { toast } = useToast()

  useEffect(() => {
    // Fetch the initial state from the backend
    const fetchInitialState = async () => {
      if (address) {
        try {
          const response = await fetch('/api/get-only-lanna', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ address }),
          });
          const data = await response.json();
          setMatchOnlyLanna(data.ONLY_LANNA_HACKERS || false);
        } catch (error) {
          console.error('Error fetching initial state:', error);
          toast({
            title: "Error",
            description: "Failed to fetch your preference. Please try again.",
            variant: "destructive",
          });
        }
      }
    };
    fetchInitialState();
  }, [address, toast]);

  const handleToggle = async (checked: boolean) => {
    if (address) {
      try {
        const response = await fetch('/api/set-only-lanna', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ address, value: checked }),
        });
        const data = await response.json();
        if (data.success) {
          setMatchOnlyLanna(checked);
          toast({
            title: "Success",
            description: `Preference ${checked ? 'enabled' : 'disabled'} successfully.`,
          });
        } else {
          throw new Error(data.error || 'Failed to update preference');
        }
      } catch (error) {
        console.error('Error updating preference:', error);
        toast({
          title: "Error",
          description: "Failed to update your preference. Please try again.",
          variant: "destructive",
        });
      }
    }
  }

  return (
    <div className="space-y-4 mt-4">
      <div className="flex items-center space-x-2">
        <Switch
          checked={matchOnlyLanna}
          onCheckedChange={handleToggle}
        />
        <span className={`
          ${matchOnlyLanna 
            ? 'bg-gradient-to-r from-[#f5acac] to-[#8ec5d4] text-transparent bg-clip-text font-semibold'
            : 'text-gray-700'
          }
        `}>
          I want to match only with Lanna 2024 hackers
        </span>
      </div>
    </div>
  )
}
