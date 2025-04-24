import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { UserType } from "@/lib/supabase/types";
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

  // Don't render anything if loading or no GitHub data
  if (loading || !contributionData) return null;

  // Get the most recent 37 weeks (approximately 6 months)
  const recentWeeks = [...contributionData.weeks].slice(-37);

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
              <div className="flex gap-[2px]">
                {recentWeeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-[2px]">
                    {week.contributionDays.map((day, dayIndex) => (
                      <div
                        key={`${weekIndex}-${dayIndex}`}
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
                <span className="absolute left-0">9 months ago</span>
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
