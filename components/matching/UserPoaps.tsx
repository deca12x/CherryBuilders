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
      } catch (error) {
        console.error("Error fetching POAPs:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPoaps();
  }, [user.evm_address]);

  // Don't render anything if loading or no POAPs
  if (loading || poaps.length === 0) return null;

  // Sort by created date (most recent first)
  const sortedPoaps = [...poaps].sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );

  // Limit to maxDisplayedPoaps
  const displayedPoaps = sortedPoaps.slice(0, maxDisplayedPoaps);

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
            href={poap.event.event_url}
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
            />
          </a>
        ))}

        {/* Profile link with three dots */}
        <a
          href={getPoapCollectorUrl(user.evm_address)}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 bg-card w-12 h-12 rounded-full flex items-center justify-center border-2 border-card hover:opacity-80 transition-opacity"
        >
          <div className="flex gap-1">
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
            <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          </div>
        </a>
      </div>
    </motion.div>
  );
};

export default UserPoaps;
