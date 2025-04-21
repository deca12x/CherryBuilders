import React from "react";
import { Link } from "lucide-react";
import { UserType } from "@/lib/supabase/types";
import Image from "next/image";
import UserEvents from "./UserEvents";
import UserPoaps from "./UserPoaps";
import { motion } from "framer-motion";

interface ProfileCardContentProps {
  user: UserType;
}

const ProfileCardContent: React.FC<ProfileCardContentProps> = ({ user }) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <motion.div
      className="flex flex-col gap-3"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Bio */}
      <motion.div
        className="flex flex-col gap-2 bg-card rounded-xl p-3"
        variants={itemVariants}
      >
        <p className="font-bold text-white">Bio</p>
        <p className="text-grey-foreground">{user.bio}</p>
      </motion.div>

      {/* POAPs */}
      <UserPoaps
        user={user}
        itemVariants={itemVariants}
        maxDisplayedPoaps={5}
      />

      {/* Building */}
      {user.building && (
        <motion.div
          className="flex flex-col gap-2 bg-card rounded-xl p-3"
          variants={itemVariants}
        >
          <p className="font-bold text-white">What I'm building</p>
          <p className="text-grey-foreground">{user.building}</p>
        </motion.div>
      )}

      {/* Looking For */}
      {user.looking_for && (
        <motion.div
          className="flex flex-col gap-2 bg-card rounded-xl p-3"
          variants={itemVariants}
        >
          <p className="font-bold text-white">Who I'm looking for</p>
          <p className="text-grey-foreground">{user.looking_for}</p>
        </motion.div>
      )}

      {/* Events */}
      {user.events && user.events.length > 0 && (
        <motion.div
          className="flex flex-col gap-2 bg-card rounded-xl p-3"
          variants={itemVariants}
        >
          <p className="font-bold text-white">You can find me at</p>
          <UserEvents user={user} />
        </motion.div>
      )}

      {/* Talent score */}
      {user.talent_score && user.talent_score > 0 ? (
        <motion.div
          className="flex flex-col items-center bg-card rounded-xl p-3"
          variants={itemVariants}
        >
          <p className="font-bold text-white">Talent Score</p>
          <p className="text-grey-foreground">{user.talent_score}</p>
        </motion.div>
      ) : null}

      {/* Links */}
      {(user.twitter_link ||
        user.github_link ||
        user.farcaster_link ||
        user.other_link) && (
        <motion.div
          className="flex flex-col gap-3 bg-card rounded-xl p-3"
          variants={itemVariants}
        >
          <p className="font-bold text-white">Links</p>
          <div className="grid grid-cols-2 gap-4 sm:px-14">
            {user.github_link && (
              <p className="text-grey-foreground flex items-center gap-2">
                <Image
                  height={26}
                  width={26}
                  src="/images/github.svg"
                  alt="github logo"
                />
                <a
                  href={user.github_link}
                  target="_blank"
                  className="text-grey-foreground hover:underline"
                >
                  Github
                </a>
              </p>
            )}
            {user.twitter_link && (
              <p className="text-grey-foreground flex items-center gap-2">
                <Image
                  height={20}
                  width={20}
                  src="/images/x.svg"
                  alt="x logo"
                />
                <a
                  href={user.twitter_link}
                  target="_blank"
                  className="text-grey-foreground hover:underline"
                >
                  Twitter
                </a>
              </p>
            )}
            {user.farcaster_link && (
              <p className="text-grey-foreground flex items-center gap-2">
                <Image
                  height={23}
                  width={23}
                  src="/images/farcaster.svg"
                  alt="farcaster logo"
                />
                <a
                  href={user.farcaster_link}
                  target="_blank"
                  className="text-grey-foreground hover:underline"
                >
                  Farcaster
                </a>
              </p>
            )}
            {user.other_link && (
              <p className="text-grey-foreground flex items-center gap-2">
                <Link size={24} />
                <a
                  href={user.other_link}
                  target="_blank"
                  className="text-grey-foreground hover:underline"
                >
                  Other
                </a>
              </p>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ProfileCardContent;
