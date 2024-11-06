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
    <Card className="w-[280px]">
      <CardContent className="p-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={profile.index}
            className="flex items-center gap-2"
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -400, opacity: 0 }}
            transition={{ type: "spring", duration: 0.52 }}
          >
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
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
