"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { UserType } from "@/lib/supabase/types";
import { usePrivy } from "@privy-io/react-auth";

interface UserGithubContributionsProps {
  user: UserType;
  itemVariants: any;
}

interface ContributionDay {
  contributionCount: number;
  date: string;
  color: string;
}

interface ContributionWeek {
  contributionDays: ContributionDay[];
}

interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

const UserGithubContributions: React.FC<UserGithubContributionsProps> = ({
  user,
  itemVariants,
}) => {
  const { getAccessToken } = usePrivy();
  const [contributionData, setContributionData] =
    useState<ContributionCalendar | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Check if screen is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    if (!user.github_link) {
      setLoading(false);
      return;
    }

    const fetchContributions = async () => {
      try {
        // Extract username from GitHub URL
        const username = user.github_link
          ? user.github_link
              .replace(/^https?:\/\/github\.com\//, "")
              .split("/")[0]
          : "";

        if (!username) {
          setLoading(false);
          return;
        }

        // Get the authentication token
        const token = await getAccessToken();

        // Make the API request with authentication
        const response = await fetch(`/api/github/${username}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const data = await response.json();
          setContributionData(data);
        } else {
          console.error(
            "GitHub API error:",
            response.status,
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching GitHub contributions:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContributions();
  }, [user.github_link, getAccessToken]);

  // Scroll to right side when contribution data loads
  useEffect(() => {
    if (contributionData && scrollContainerRef.current) {
      // Small delay to ensure rendering is complete
      setTimeout(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollLeft =
            scrollContainerRef.current.scrollWidth;
        }
      }, 100);
    }
  }, [contributionData]);

  // Don't render anything if loading or no GitHub data
  if (loading || !contributionData) return null;

  // Calculate how many weeks to display based on screen size
  const weeksToShow = isMobile ? 25 : 37;

  // Get the most recent weeks
  const recentWeeks = [...contributionData.weeks].slice(-weeksToShow);

  return (
    <motion.div
      className="flex flex-col gap-2 bg-card rounded-xl p-3"
      variants={itemVariants}
    >
      <div className="flex flex-row justify-between items-center">
        <p className="font-bold text-white">GitHub Contributions</p>
      </div>
      <a
        href={user.github_link}
        target="_blank"
        rel="noopener noreferrer"
        className="hover:opacity-90 transition-opacity"
      >
        <div className="w-full py-2">
          <div className="flex flex-col w-full">
            <div className="relative w-full">
              <div
                ref={scrollContainerRef}
                className="flex gap-[2px] overflow-x-auto sm:overflow-x-hidden scrollbar-thin scrollbar-thumb-dark-grey scrollbar-track-transparent sm:justify-end"
              >
                {/* Column-based layout (each column is a week) */}
                {recentWeeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {/* Render each day in the week (already ordered Sunday to Saturday) */}
                    {week.contributionDays.map((day, dayIndex) => (
                      <div
                        key={dayIndex}
                        className={`w-3 h-3 ${day.contributionCount === 0 ? "bg-dark-grey" : ""}`}
                        style={{
                          backgroundColor:
                            day.contributionCount > 0 ? day.color : undefined,
                          borderRadius: "3px",
                        }}
                        title={`${day.date}: ${day.contributionCount} contributions`}
                      />
                    ))}
                  </div>
                ))}
              </div>

              <div className="relative w-full mt-2 text-xs text-gray-400">
                <span className="absolute left-0">
                  {isMobile ? "6 months ago" : "9 months ago"}
                </span>
                <span className="absolute right-0">today</span>
              </div>
            </div>
          </div>
        </div>
      </a>
    </motion.div>
  );
};

export default UserGithubContributions;
