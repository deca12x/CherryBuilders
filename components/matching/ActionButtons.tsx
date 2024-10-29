import { X, Heart } from "lucide-react";
import FiltersButton from "./FiltersButton";

interface ActionButtonsProps {
  onReject: () => void;
  onAccept: () => void;
  isLoading: boolean;
}

export default function ActionButtons({ onReject, onAccept, isLoading }: ActionButtonsProps) {
  return (
    <div className="space-x-5">
      <button
        onClick={onReject}
        className="bg-primary text-destructive-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
        aria-label="Dislike"
        disabled={isLoading}
      >
        <X size={24} />
      </button>
      <button
        onClick={onAccept}
        className="bg-green-500 text-primary-foreground rounded-full p-4 shadow-lg hover:bg-green-500/90 transition-colors disabled:opacity-50"
        aria-label="Like"
        disabled={isLoading}
      >
        <Heart size={24} />
      </button>
    </div>
  );
}
