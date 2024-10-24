import React from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { cn } from "@/lib/utils";
import { K2D } from "next/font/google";
import { UserType, UserTag } from "@/lib/supabase/types";
import Image from 'next/image';

const k2d = K2D({ weight: "600", subsets: ["latin"] });

interface ProfileCardImageProps {
  user: UserType | null;
  imageIndex: number;
  isLoading: boolean;
  animateFrame: boolean;
  onImagePrevious: () => void;
  onImageNext: () => void;
  onAnimationComplete: () => void;
}

const ProfileCardImage: React.FC<ProfileCardImageProps> = ({
  user,
  imageIndex,
  isLoading,
  animateFrame,
  onImagePrevious,
  onImageNext,
  onAnimationComplete
}) => {
  const ImageContent = () => (
    <>
      <Image src={user!.profile_pictures[imageIndex]} alt={user!.name} className="w-full h-full object-cover" width={400} height={400} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent flex items-end">
        <div className="flex flex-col w-full p-2 gap-1">
          <h2 className={cn(`flex items-center text-3xl font-bold text-primary-foreground ${k2d.className}`)}>
            <span className="mb-1">{user!.name}</span>
          </h2>
          <Tags />
        </div>
      </div>
    </>
  );

  const Tags = () => (
    <div className="flex flex-wrap gap-2">
      {user!.tags.map((tag: UserTag, index: number) => (
        <span
          key={index}
          className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm"
        >
          {tag.charAt(0).toUpperCase() + tag.slice(1)}
        </span>
      ))}
      {user!.events!.map((event) => (
        <span
          key={event.slug}
          className="bg-gradient-to-r from-[#f5acac] to-[#8ec5d4] text-primary-foreground px-2 py-1 rounded-full text-sm flex"
        >
          <CheckCircle2 className="mr-2 h-5 w-5" />
          <p className="font-bold">{event.name}</p>
        </span>
      ))}
    </div>
  );

  const NavigationButton = ({ direction, onClick }: { direction: 'left' | 'right', onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`absolute ${direction}-0 top-0 bottom-0 w-1/2 flex items-center justify-${direction === 'left' ? 'start' : 'end'} p-4 text-primary-foreground opacity-0 hover:opacity-100 transition-opacity`}
      aria-label={`${direction === 'left' ? 'Previous' : 'Next'} image`}
      disabled={isLoading || !user}
    >
      {direction === 'left' ? <ChevronLeft size={40} /> : <ChevronRight size={40} />}
    </button>
  );

  return (
    <motion.div
      key="1"
      className="w-full"
      initial={{ x: animateFrame ? 400 : 0, opacity: animateFrame ? 0 : 1 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: animateFrame ? -400 : 0, opacity: animateFrame ? 0 : 1 }}
      transition={{ type: "spring", duration: 0.55 }}
      onAnimationComplete={onAnimationComplete}
    >
      <div className="relative h-[400px]">
        {isLoading ? (
          <div className="w-full h-full bg-gray-300 animate-pulse"></div>
        ) : user ? (
          <ImageContent />
        ) : null}
        <NavigationButton direction="left" onClick={onImagePrevious} />
        <NavigationButton direction="right" onClick={onImageNext} />
      </div>
    </motion.div>
  );
};

export default ProfileCardImage;