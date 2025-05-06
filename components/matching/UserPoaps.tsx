"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { UserType } from "@/lib/supabase/types";
import { PoapItem, getPoapCollectorUrl } from "@/lib/poap";

interface UserPoapsProps {
  user: UserType;
  itemVariants: any;
  maxDisplayedPoaps?: number;
}

const UserPoaps: React.FC<UserPoapsProps> = ({
  user,
  itemVariants,
  maxDisplayedPoaps = 5,
}) => {
  const [poaps, setPoaps] = useState<PoapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user.evm_address) {
      setLoading(false);
      return;
    }

    const fetchPoaps = async () => {
      try {
        const response = await fetch(`/api/poap/${user.evm_address}`);

        if (response.ok) {
          const data = await response.json();
          setPoaps(data);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPoaps();
  }, [user.evm_address, user.name]);

  // Don't render anything if loading or no POAPs
  if (loading) {
    return null;
  }

  if (poaps.length === 0) {
    return null;
  }

  // Sort by created date (most recent first)
  const sortedPoaps = [...poaps].sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );

  // Limit to maxDisplayedPoaps
  const displayedPoaps = sortedPoaps.slice(0, maxDisplayedPoaps);

  // Helper function to get collector URL for a specific token
  const getTokenCollectorUrl = (tokenId: string) => {
    return `https://collectors.poap.xyz/token/${tokenId}`;
  };

  // Helper function to check if URL is a GIF
  const isGif = (url: string) => url.toLowerCase().endsWith(".gif");

  return (
    <motion.div
      className="flex flex-col gap-2 bg-card rounded-xl p-3"
      variants={itemVariants}
    >
      <p className="font-bold text-white">POAPs</p>
      <div className="flex items-center gap-2 overflow-x-auto py-2">
        {displayedPoaps.map((poap: PoapItem) => (
          <a
            key={poap.tokenId}
            href={getTokenCollectorUrl(poap.tokenId)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0"
          >
            <Image
              src={poap.event.image_url}
              alt={poap.event.name}
              width={48}
              height={48}
              className="rounded-full border-2 border-card hover:opacity-80 transition-opacity"
              unoptimized={isGif(poap.event.image_url)}
            />
          </a>
        ))}

        {/* Profile link with three dots */}
        <a
          href={getPoapCollectorUrl(user.evm_address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
        >
          <div className="w-12 h-12 rounded-full border-2 border-card animated-gradient-bg hover:opacity-80 transition-opacity flex items-center justify-center">
            <div className="flex gap-1">
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
              <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            </div>
          </div>
        </a>
      </div>
    </motion.div>
  );
};

export default UserPoaps;
