import { UserType } from "@/lib/supabase/types";
import { AnimatePresence, motion } from "framer-motion";
import { Frown, Smile, MessageCircle } from "lucide-react";
import ProfileCardSkeleton from "./ProfileCardSkeleton";
import ProfileCardContent from "./ProfileCardContent";
import NoUsersFound from "./NoUsersFound";
import UserTags from "./UserTags";
import UserEvents from "./UserEvents";
import ProfileCardHeader from "./ProfileCardHeader";
import ActionButtons from "./ActionButtons";
import FiltersButton from "./FiltersButton";
import { useEffect, useState } from "react";
import IcebreakerModal from "./IcebreakerModal";

interface ProfileCardProps {
  user: UserType | null;
  imageIndex: number;
  isLoading: boolean;
  processingAction: "accept" | "reject" | "icebreaker" | null;
  animateFrame: boolean;
  setAnimateFrame: (value: boolean) => void;
  setIsFiltersModalOpen: (value: boolean) => void;
  handleReject: () => void;
  handleAccept: () => void;
  handleIcebreaker: (message: string) => void;
  icebreakerMessage?: string | null;
  onShowNoEmailModal: () => void;
}

export default function ProfileCard({
  user,
  imageIndex,
  isLoading,
  processingAction,
  animateFrame,
  setAnimateFrame,
  setIsFiltersModalOpen,
  handleReject,
  handleAccept,
  handleIcebreaker,
  icebreakerMessage,
  onShowNoEmailModal,
}: ProfileCardProps) {
  const [isIcebreakerModalOpen, setIsIcebreakerModalOpen] = useState(false);

  // Prevent scrolling when processing an action
  useEffect(() => {
    console.log(user);

    if (processingAction) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup on component unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [processingAction]);

  return user || isLoading ? (
    <>
      <div className="w-full max-w-xl min-h-screen bg-background shadow-lg overflow-x-hidden pb-36 p-4">
        <AnimatePresence>
          {/* Dark overlay */}
          {processingAction ? (
            <motion.div
              key={processingAction + "Processing"}
              className="fixed inset-0 flex justify-center items-center bg-background/80 z-20"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              {processingAction === "accept" ? (
                <Smile size={64} className="text-green-500" />
              ) : processingAction === "icebreaker" ? (
                <motion.div
                  className="flex flex-col items-center gap-2"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", bounce: 0.5 }}
                >
                  <MessageCircle size={64} className="text-blue-500" />
                </motion.div>
              ) : (
                <Frown size={64} className="text-gray-500" />
              )}
            </motion.div>
          ) : null}

          <div className="flex flex-col gap-5">
            {/* Card Header with image, name and filters button */}
            <ProfileCardHeader
              user={user}
              imageIndex={imageIndex || 0}
              animateFrame={animateFrame}
              isLoading={isLoading}
              setAnimateFrame={setAnimateFrame}
            />

            {/* Icebreaker Message if exists */}
            {icebreakerMessage && (
              <motion.div
                className="w-full bg-gradient-to-r from-primary/20 to-secondary/20 rounded-lg p-6 mb-4 border-2 border-primary/20 shadow-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", bounce: 0.4 }}
              >
                <div className="flex items-center gap-2 text-red font-semibold mb-2">
                  <MessageCircle size={20} />
                  <span className="text-lg">Icebreaker Message</span>
                </div>
                <div className="text-white text-lg font-medium leading-relaxed">
                  "{decodeURIComponent(icebreakerMessage)}"
                </div>
              </motion.div>
            )}

            {/* Content */}
            <motion.div
              key={user?.evm_address + "Content"}
              className="w-full"
              initial={{
                x: animateFrame ? 400 : 0,
                opacity: animateFrame ? 0 : 1,
              }}
              animate={{ x: 0, opacity: 1 }}
              exit={{
                x: animateFrame ? -400 : 0,
                opacity: animateFrame ? 0 : 1,
              }}
              transition={{ type: "spring", duration: 0.7 }}
              onAnimationComplete={() => setAnimateFrame(false)}
            >
              {isLoading ? (
                <ProfileCardSkeleton />
              ) : user ? (
                <ProfileCardContent user={user} />
              ) : null}
            </motion.div>
          </div>
        </AnimatePresence>
      </div>

      {/* Buttons */}
      {user && (
        <div className="fixed w-full max-w-xl flex bottom-[75px] justify-center items-center">
          <ActionButtons
            onReject={handleReject}
            onAccept={handleAccept}
            onIcebreaker={() => setIsIcebreakerModalOpen(true)}
            isLoading={isLoading}
            userHasEmailNotifsOn={user.emailNotifications || false}
            userHasEmail={Boolean(user.email)}
            onShowNoEmailModal={onShowNoEmailModal}
          />
          <div className="absolute right-4">
            <FiltersButton onOpenFilters={() => setIsFiltersModalOpen(true)} />
          </div>
        </div>
      )}

      {/* Icebreaker Modal */}
      {user &&
        (console.log("ProfileCard handleIcebreaker:", handleIcebreaker),
        (
          <IcebreakerModal
            isOpen={isIcebreakerModalOpen}
            onClose={() => setIsIcebreakerModalOpen(false)}
            onSend={handleIcebreaker}
            user={user}
          />
        ))}
    </>
  ) : (
    <NoUsersFound onOpenFilters={() => setIsFiltersModalOpen(true)} />
  );
}
