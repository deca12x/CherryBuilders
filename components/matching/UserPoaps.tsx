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
  console.log("1poap: UserPoaps component mounted", { username: user.name });

  const [poaps, setPoaps] = useState<PoapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("2poap: UserPoaps effect triggered", {
      has_address: !!user.evm_address,
      address: user.evm_address,
    });

    if (!user.evm_address) {
      console.log("3poap: No address found, skipping fetch");
      setLoading(false);
      return;
    }

    const fetchPoaps = async () => {
      try {
        console.log("4poap: Starting fetch for address:", user.evm_address);
        console.log("5poap: API endpoint:", `/api/poap/${user.evm_address}`);

        const response = await fetch(`/api/poap/${user.evm_address}`);
        console.log("6poap: Response status:", response.status);

        if (response.ok) {
          const data = await response.json();
          console.log(
            "7poap: POAPs count:",
            Array.isArray(data) ? data.length : "not an array"
          );
          console.log("8poap: Response data type:", typeof data);
          console.log(
            "9poap: First POAP (if any):",
            data[0] ? JSON.stringify(data[0]).substring(0, 100) : "no data"
          );
          setPoaps(data);
        } else {
          console.log("7poap: Error response:", response.statusText);
          try {
            const errorText = await response.text();
            console.log("8poap: Error details:", errorText);
          } catch (e) {
            console.log("8poap: Could not get error details");
          }
        }
      } catch (error) {
        console.log("7poap: Fetch error:", error);
      } finally {
        console.log("9poap: Fetch completed, setting loading to false");
        setLoading(false);
      }
    };

    fetchPoaps();
  }, [user.evm_address, user.name]);

  console.log("10poap: Render state:", {
    loading,
    poapsCount: poaps.length,
  });

  // Don't render anything if loading or no POAPs
  if (loading) {
    console.log("11poap: Still loading, not rendering");
    return null;
  }

  if (poaps.length === 0) {
    console.log("12poap: No POAPs found, not rendering");
    return null;
  }

  // Sort by created date (most recent first)
  const sortedPoaps = [...poaps].sort(
    (a, b) => new Date(b.created).getTime() - new Date(a.created).getTime()
  );

  // Limit to maxDisplayedPoaps
  const displayedPoaps = sortedPoaps.slice(0, maxDisplayedPoaps);
  console.log("13poap: Displaying POAPs:", displayedPoaps.length);

  // Helper function to get collector URL for a specific token
  const getTokenCollectorUrl = (tokenId: string) => {
    return `https://collectors.poap.xyz/token/${tokenId}`;
  };

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
