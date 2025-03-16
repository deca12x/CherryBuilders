import { ThumbsDown, ThumbsUp } from "lucide-react";
interface ActionButtonsProps {
  onReject: () => void;
  onAccept: () => void;
  onIcebreaker: () => void;
  isLoading: boolean;
  userHasEmailNotifsOn: boolean;
  userHasEmail: boolean;
  onShowNoEmailModal: () => void;
}

export default function ActionButtons({
  onReject,
  onAccept,
  onIcebreaker,
  isLoading,
  userHasEmailNotifsOn,
  userHasEmail,
  onShowNoEmailModal,
}: ActionButtonsProps) {
  return (
    <div className="space-x-5">
      <button
        onClick={onReject}
        className="bg-primary text-destructive-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        aria-label="Dislike"
        disabled={isLoading}
      >
        <ThumbsDown size={24} />
      </button>
      <button
        onClick={
          userHasEmailNotifsOn && userHasEmail
            ? onIcebreaker
            : onShowNoEmailModal
        }
        className="bg-[#22976A] text-primary-foreground rounded-full p-4 shadow-lg hover:bg-[#22976A]/90 transition-colors disabled:opacity-50"
        aria-label="Send Icebreaker"
        disabled={isLoading}
      >
        <ThumbsUp size={24} />
      </button>
    </div>
  );
}
