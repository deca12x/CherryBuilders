import { UserType } from "@/lib/supabase/types";
import { AnimatePresence, motion } from "framer-motion";
import { Frown, Smile } from "lucide-react";
import ProfileCardSkeleton from "./ProfileCardSkeleton";
import ProfileCardContent from "./ProfileCardContent";
import NoUsersFound from "./NoUsersFound";
import { K2D } from "next/font/google";
import UserTags from "./UserTags";
import UserEvents from "./UserEvents";
import ProfileCardHeader from "./ProfileCardHeader";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

interface ProfileCardProps {
  user: UserType | null;
  imageIndex: number;
  isLoading: boolean;
  isProcessing: boolean;
  processingAction: "accept" | "reject" | null;
  animateFrame: boolean;
  setAnimateFrame: (value: boolean) => void;
  setIsFiltersModalOpen: (value: boolean) => void;
}

export default function ProfileCard({
  user,
  imageIndex,
  isLoading,
  isProcessing,
  processingAction,
  animateFrame,
  setAnimateFrame,
  setIsFiltersModalOpen,
}: ProfileCardProps) {
  return user || isLoading ? (
    <div className="w-full max-w-xl min-h-screen bg-background shadow-lg overflow-hidden relative flex-grow p-4">
      <AnimatePresence>
        {/* Dark overlay */}
        {isProcessing ? (
          <motion.div
            key="processing"
            className="absolute inset-0 flex items-center justify-center bg-background/80 z-20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {processingAction === "accept" ? (
              <Smile size={64} className="text-green-500" />
            ) : (
              <Frown size={64} className="text-gray-500" />
            )}
          </motion.div>
        ) : null}

        <div className="flex flex-col gap-3">
          {/* Card Header with image, name and filters button */}
          <ProfileCardHeader
            user={user}
            imageIndex={imageIndex}
            setIsFiltersModalOpen={setIsFiltersModalOpen}
            animateFrame={animateFrame}
            isLoading={isLoading}
          />

          {/* Tags and Events */}
          <motion.div
            key="1"
            className="flex flex-col gap-1.5 mb-3"
            initial={{ x: animateFrame ? 400 : 0, opacity: animateFrame ? 0 : 1 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: animateFrame ? -400 : 0, opacity: animateFrame ? 0 : 1 }}
            transition={{ type: "spring", duration: 0.55 }}
          >
            <UserTags user={user} />
            <UserEvents user={user} />
          </motion.div>

          {/* Content */}
          <motion.div
            key="2"
            className="w-full"
            initial={{
              x: animateFrame ? 400 : 0,
              opacity: animateFrame ? 0 : 1,
            }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: animateFrame ? -400 : 0, opacity: animateFrame ? 0 : 1 }}
            transition={{ type: "spring", duration: 0.7 }}
          >
            {isLoading ? <ProfileCardSkeleton /> : user ? <ProfileCardContent user={user} /> : null}
          </motion.div>
        </div>
      </AnimatePresence>
    </div>
  ) : (
    <NoUsersFound onOpenFilters={() => setIsFiltersModalOpen(true)} />
  );
}
