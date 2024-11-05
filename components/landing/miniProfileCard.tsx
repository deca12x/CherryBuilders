import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { K2D } from "next/font/google";
import { UserType } from "@/lib/supabase/types";
import Image from "next/image";
import UserTags from "../matching/UserTags";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

interface MiniProfileCardProps {
  user: UserType;
  imageIndex?: number;
  animateFrame?: boolean;
}

export default function MiniProfileCard({
  user,
  imageIndex = 0,
  animateFrame = false,
}: MiniProfileCardProps) {
  return (
    <AnimatePresence mode="wait">
      <div key="mini-header-container">
        <motion.div
          key={user.evm_address}
          className="flex sm:gap-5 gap-4"
          initial={{ x: animateFrame ? 400 : 0, opacity: animateFrame ? 0 : 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: animateFrame ? -400 : 0, opacity: animateFrame ? 0 : 1 }}
          transition={{ type: "spring", duration: 0.52 }}
        >
          <div className="flex justify-center items-center bg-primary-foreground sm:w-[90px] sm:h-[90px] w-[70px] h-[70px] rounded-full overflow-hidden flex-shrink-0">
            <Image
              src={
                user.profile_pictures[imageIndex] ??
                "/images/default_propic.jpeg"
              }
              alt={user.name}
              className="rounded-full object-cover sm:w-[86px] sm:h-[86px] w-[66px] h-[66px]"
              width={100}
              height={100}
            />
          </div>
          <div className="flex flex-col w-full justify-center gap-2 overflow-auto">
            <div
              className={`${k2d.className} sm:text-3xl text-2xl font-bold text-primary-foreground`}
            >
              {user.name}
            </div>
            <UserTags user={user} />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
