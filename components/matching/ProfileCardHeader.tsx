import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { K2D } from "next/font/google";
import { UserType } from "@/lib/supabase/types";
import Image from "next/image";
import ProfilePictureModal from "./ProfilePictureModal";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

interface ProfileCardHeaderProps {
  user: UserType | null;
  imageIndex: number;
  animateFrame: boolean;
  isLoading: boolean;
  setAnimateFrame: (value: boolean) => void;
}

export default function ProfileCardHeader({
  user,
  imageIndex,
  animateFrame,
  isLoading,
  setAnimateFrame,
}: ProfileCardHeaderProps) {
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] = React.useState(false);

  return (
    <AnimatePresence mode="wait">
      <div className="flex justify-between" key="header-container">
        <motion.div
          key={user?.evm_address ?? "Header"}
          className="flex sm:gap-5 gap-4"
          initial={{ x: animateFrame ? 400 : 0, opacity: animateFrame ? 0 : 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: animateFrame ? -400 : 0, opacity: animateFrame ? 0 : 1 }}
          transition={{ type: "spring", duration: 0.52 }}
          onAnimationComplete={() => setAnimateFrame(false)}
        >
          {!user || isLoading ? (
            <div className="bg-primary-foreground sm:w-[90px] sm:h-[90px] w-[70px] h-[70px] rounded-full flex-shrink-0 animate-pulse"></div>
          ) : (
            <button
              className="flex justify-center items-center bg-primary-foreground sm:w-[90px] sm:h-[90px] w-[70px] h-[70px] rounded-full overflow-hidden flex-shrink-0"
              onClick={() => setIsProfilePictureModalOpen(true)}
            >
              <Image
                src={user.profile_pictures[imageIndex] ?? "/images/default_propic.jpeg"}
                alt={user.name}
                className="rounded-full object-cover sm:w-[86px] sm:h-[86px] w-[66px] h-[66px]"
                width={100}
                height={100}
              />
            </button>
          )}
          <div
            className={`flex min-h-full items-center sm:text-3xl text-2xl font-bold text-primary-foreground leading-7 sm:leading-normal ${k2d.className}`}
          >
            {!user || isLoading ? (
              <div className="sm:h-8 sm:w-48 h-6 w-28 bg-gray-300 rounded animate-pulse"></div>
            ) : (
              user.name
            )}
          </div>
        </motion.div>
      </div>

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        images={user?.profile_pictures ?? []}
        isOpen={isProfilePictureModalOpen}
        onClose={() => setIsProfilePictureModalOpen(false)}
      />
    </AnimatePresence>
  );
}
