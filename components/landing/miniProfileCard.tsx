import React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { K2D } from "next/font/google";
import Image from "next/image";
import { LandingProfile } from "@/lib/landing/types";
import { Card, CardContent } from "@/components/ui/card";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

interface MiniProfileCardProps {
  profile: LandingProfile;
}

export default function MiniProfileCard({ profile }: MiniProfileCardProps) {
  return (
    <Card className="flex flex-col items-center justify-center w-full max-w-[90vw] sm:max-w-xl">
      <CardContent className="pt-6">
        <AnimatePresence mode="wait">
          <div key="mini-header-container">
            <motion.div
              key={profile.index}
              className="flex sm:gap-5 gap-4"
              initial={{ x: 400, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -400, opacity: 0 }}
              transition={{ type: "spring", duration: 0.52 }}
            >
              <div className="flex justify-center items-center bg-primary-foreground sm:w-[90px] sm:h-[90px] w-[70px] h-[70px] rounded-full overflow-hidden flex-shrink-0">
                <Image
                  src={profile.image}
                  alt={profile.name}
                  className="rounded-full object-cover sm:w-[86px] sm:h-[86px] w-[66px] h-[66px]"
                  width={100}
                  height={100}
                />
              </div>
              <div className="flex flex-col w-full justify-center gap-2 overflow-auto">
                <div
                  className={`${k2d.className} sm:text-3xl text-2xl font-bold text-primary-foreground`}
                >
                  {profile.name}
                </div>
                <div className="flex justify-start items-center cursor-default sm:gap-2 gap-1.5 pb-2 sm:pb-0 pr-0.5 overflow-x-auto">
                  {profile.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex text-nowrap bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm"
                    >
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
