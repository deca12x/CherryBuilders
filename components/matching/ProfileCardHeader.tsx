import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { K2D } from "next/font/google";
import { UserType } from "@/lib/supabase/types";
import Image from "next/image";
import ProfilePictureModal from "./ProfilePictureModal";
import UserTags from "./UserTags";

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
  const [isProfilePictureModalOpen, setIsProfilePictureModalOpen] =
    React.useState(false);
  const [imgError, setImgError] = React.useState(false);

  return (
    <AnimatePresence mode="wait">
      <div key="header-container">
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
            <div className="bg-red-foreground sm:w-[90px] sm:h-[90px] w-[70px] h-[70px] rounded-full flex-shrink-0 animate-pulse"></div>
          ) : (
            <button
              className="flex justify-center items-center bg-red-foreground sm:w-[90px] sm:h-[90px] w-[70px] h-[70px] rounded-full overflow-hidden flex-shrink-0"
              onClick={() => setIsProfilePictureModalOpen(true)}
            >
              <Image
                src={
                  imgError
                    ? "/images/default_propic.jpeg"
                    : (user.profile_pictures[imageIndex] ??
                      "/images/default_propic.jpeg")
                }
                alt={user.name}
                className="rounded-full object-cover sm:w-[86px] sm:h-[86px] w-[66px] h-[66px]"
                width={100}
                height={100}
                onError={() => setImgError(true)}
              />
            </button>
          )}
          <div className="flex flex-col w-full justify-center gap-2 overflow-auto">
            {!user || isLoading ? (
              <>
                <div className="sm:h-8 sm:w-48 h-6 w-28 bg-gray-300 rounded animate-pulse"></div>
                <div className="sm:h-6 sm:w-24 h-4 w-14 bg-gray-300 rounded animate-pulse"></div>
              </>
            ) : (
              <>
                <div
                  className={`${k2d.className} sm:text-3xl text-2xl font-bold text-red-foreground`}
                >
                  {user.name}
                </div>
                <UserTags user={user} />
              </>
            )}
          </div>
        </motion.div>

        {/* Profile Picture Modal */}
        <ProfilePictureModal
          images={user?.profile_pictures ?? []}
          isOpen={isProfilePictureModalOpen}
          onClose={() => setIsProfilePictureModalOpen(false)}
        />
      </div>
    </AnimatePresence>
  );
}
