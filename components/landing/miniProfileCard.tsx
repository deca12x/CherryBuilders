import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { K2D } from "next/font/google";
import Image from "next/image";
import { MiniProfile } from "@/lib/landing/types";
import { Card, CardContent } from "@/components/ui/card";
import UserTags from "@/components/matching/UserTags";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

interface MiniProfileCardProps {
  profile: MiniProfile;
}

export default function MiniProfileCard({ profile }: MiniProfileCardProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={profile.index}
        initial={{ rotateX: 90, opacity: 0 }}
        animate={{ rotateX: 0, opacity: 1 }}
        exit={{ rotateX: -90, opacity: 0 }}
        transition={{
          type: "spring",
          damping: 20,
          stiffness: 100,
          duration: 0.6,
        }}
        style={{
          perspective: 1000,
          transformStyle: "preserve-3d",
        }}
      >
        <Card className="w-[280px]">
          <CardContent className="p-3">
            <div className="flex items-center gap-2">
              <div className="flex-shrink-0">
                <Image
                  src={profile.image}
                  alt={profile.name}
                  className="rounded-full object-cover w-10 h-10"
                  width={40}
                  height={40}
                />
              </div>
              <div className="flex flex-col min-w-0">
                <h3
                  className={`${k2d.className} text-base font-bold text-primary-foreground truncate`}
                >
                  {profile.name}
                </h3>
                <UserTags user={{ tags: profile.tags }} size="sm" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
