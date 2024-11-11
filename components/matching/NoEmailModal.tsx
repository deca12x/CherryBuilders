import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface NoEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLikeAnyway: () => void;
  onSkip: () => void;
}

export default function NoEmailModal({ isOpen, onClose, onLikeAnyway, onSkip }: NoEmailModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>No Email Registered</DialogTitle>
          <DialogDescription>
            This user has no email registered
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-center gap-4 mt-4">
     
          <button
            onClick={onSkip}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            Skip
          </button>
          <button
            onClick={onLikeAnyway}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            Like anyway
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 