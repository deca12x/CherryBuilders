"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Heart, Link } from "lucide-react";
import { K2D } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { user_tag, UserType } from "@/lib/types";
import BottomNavigationBar from "@/components/navbar/BottomNavigationBar";
import { supabase } from "@/lib/supabase";
import { useAccount } from "wagmi";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

export default function Matching() {
  const [users, setUsers] = useState<UserType[]>([]);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [direction, setDirection] = useState(0);
  const [bioDirection, setBioDirection] = useState(0);
  const [animateFrame, setAnimateFrame] = useState(false);

  const { address } = useAccount();

  useEffect(() => {
    const fetchUsers = async () => {
      if (!address) return;

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/get-random-users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setUsers(data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError("Failed to load users. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [address]);

  const currentUser = users[currentUserIndex];

  const checkMatch = async () => {
    if (!address || !currentUser) return;

    try {
      const { data, error } = await supabase
        .from("matches")
        .select("*")
        .eq("user_2", address)
        .eq("user_1", currentUser.evm_address)
        .neq("matched", true);

      if (error) throw error;

      if (data.length === 0) {
        console.log("No matches found, creating a new match");
        const { error: insertError } = await supabase
          .from("matches")
          .insert([{ user_1: address, user_2: currentUser.evm_address }]);

        if (insertError) throw insertError;
      } else if (data.length > 0) {
        console.log("Match exists");
        const { error: updateError } = await supabase
          .from("matches")
          .update({ matched: true })
          .eq("user_1", currentUser.evm_address)
          .eq("user_2", address);

        if (updateError) throw updateError;

        const { error: chatError } = await supabase
          .from("chats")
          .insert([{ user_1: address, user_2: currentUser.evm_address }]);

        if (chatError) throw chatError;
      }
    } catch (error) {
      console.error("Error in checkMatch:", error);
    }
  };

  const handleNext = () => {
    if (users.length === 0) return;
    checkMatch();
    setDirection(1);
    setBioDirection(1);
    setAnimateFrame(true);
    setCurrentUserIndex((prev) => (prev + 1) % users.length);
    setCurrentImageIndex(0);
  };

  const handlePrevious = () => {
    if (users.length === 0) return;
    setDirection(-1);
    setBioDirection(-1);
    setAnimateFrame(true);
    setCurrentUserIndex((prev) => (prev - 1 + users.length) % users.length);
    setCurrentImageIndex(0);
  };

  const handleImageNext = () => {
    if (!currentUser) return;
    setCurrentImageIndex((prev) => (prev + 1) % currentUser.profile_pictures.length);
  };

  const handleImagePrevious = () => {
    if (!currentUser) return;
    setCurrentImageIndex(
      (prev) => (prev - 1 + currentUser.profile_pictures.length) % currentUser.profile_pictures.length
    );
  };

  const ProfileCard = ({ user, imageIndex, isLoading }: { user: UserType | null; imageIndex: number; isLoading: boolean }) => (
    <div className="w-full max-w-xl bg-background shadow-lg overflow-hidden relative flex-grow pb-28">
      <AnimatePresence>
        <motion.div
          key="1"
          className="w-full"
          initial={{ x: animateFrame ? direction * 400 : 0, opacity: animateFrame ? 0 : 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: animateFrame ? direction * -400 : 0, opacity: animateFrame ? 0 : 1 }}
          transition={{ type: "spring", duration: 0.55 }}
          onAnimationComplete={() => setAnimateFrame(false)}
        >
          {/* Image */}
          <div className="relative h-[400px]">
            {isLoading ? (
              <div className="w-full h-full bg-gray-300 animate-pulse"></div>
            ) : user ? (
              <>
                <img src={user.profile_pictures[imageIndex]} alt={user.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-transparent flex items-end">
                  <div className="flex flex-col w-full p-2 gap-1">
                    <h2 className={`text-3xl font-bold text-primary-foreground ${k2d.className}`}>{user.name}</h2>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {user.tags.map((tag: user_tag, index: number) => (
                        <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm">
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center">
                <p className="text-gray-500">No user data available</p>
              </div>
            )}
            <button
              onClick={handleImagePrevious}
              className="absolute left-0 top-0 bottom-0 w-1/2 flex items-center justify-start p-4 text-primary-foreground opacity-0 hover:opacity-100 transition-opacity"
              aria-label="Previous image"
              disabled={isLoading || !user}
            >
              <ChevronLeft size={40} />
            </button>
            <button
              onClick={handleImageNext}
              className="absolute right-0 top-0 bottom-0 w-1/2 flex items-center justify-end p-4 text-primary-foreground opacity-0 hover:opacity-100 transition-opacity"
              aria-label="Next image"
              disabled={isLoading || !user}
            >
              <ChevronRight size={40} />
            </button>
          </div>
        </motion.div>
  
        {/* Content */}
        <motion.div
          key="2"
          className="w-full"
          initial={{ x: animateFrame ? bioDirection * 400 : 0, opacity: animateFrame ? 0 : 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: animateFrame ? bioDirection * -400 : 0, opacity: animateFrame ? 0 : 1 }}
          transition={{ type: "spring", duration: 0.7 }}
        >
          {isLoading ? (
            <div className="flex flex-col p-4 gap-3">
              {/* Stats Skeleton */}
              <div className="flex flex-row gap-3">
                <div className="flex flex-grow flex-col items-center bg-card rounded-xl p-3">
                  <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 w-16 bg-gray-300 rounded"></div>
                </div>
                <div className="flex flex-col items-center bg-card rounded-xl p-3">
                  <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                  <div className="h-4 w-16 bg-gray-300 rounded"></div>
                </div>
              </div>
              {/* Bio Skeleton */}
              <div className="flex flex-col gap-2 bg-card rounded-xl p-3">
                <div className="h-4 w-24 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 w-full bg-gray-300 rounded mb-1"></div>
                <div className="h-4 w-full bg-gray-300 rounded mb-1"></div>
                <div className="h-4 w-3/4 bg-gray-300 rounded"></div>
              </div>
              {/* Links Skeleton */}
              <div className="flex flex-col gap-3 bg-card rounded-xl p-3">
                <div className="h-4 w-16 bg-gray-300 rounded mb-2"></div>
                <div className="flex justify-between sm:px-14">
                  <div className="h-6 w-24 bg-gray-300 rounded"></div>
                  <div className="h-6 w-24 bg-gray-300 rounded"></div>
                </div>
                <div className="flex justify-between sm:px-14">
                  <div className="h-6 w-24 bg-gray-300 rounded"></div>
                  <div className="h-6 w-24 bg-gray-300 rounded"></div>
                </div>
              </div>
            </div>
          ) : user ? (
            <div className="flex flex-col p-4 gap-3">
              {/* Stats */}
              <div className="flex flex-row gap-3">
                {/* Worldcoin ID */}
                <div className="flex flex-grow flex-col items-center bg-card rounded-xl p-3">
                  <p className="font-bold text-foreground">Worldcoin ID</p>
                  <p className={user.verified ? "text-green-500" : "text-red-500"}>
                    {user.verified ? "Confirmed" : "Unconfirmed"}
                  </p>
                </div>
                {/* Talent score */}
                <div className="flex flex-col items-center bg-card rounded-xl p-3">
                  <p className="font-bold text-foreground">Talent Score</p>
                  <p className="text-muted-foreground">{user.talent_score}</p>
                </div>
              </div>
              {/* Bio */}
              <div className="flex flex-col gap-2 bg-card rounded-xl p-3">
                <p className="font-bold text-foreground">Who am I?</p>
                <p className="text-muted-foreground">{user.bio}</p>
              </div>
  
              {/* Links */}
              <div className="flex flex-col gap-3 bg-card rounded-xl p-3">
                <p className="font-bold text-foreground">Links</p>
                <div className="flex justify-between sm:px-14">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <img height={26} width={26} src="/images/github.png" alt="github logo" />
                    <a href={user.github_link} target="_blank" className="text-muted-foreground hover:underline">
                      Github
                    </a>
                  </p>
                  <p className="flex text-muted-foreground items-center gap-2">
                    <img height={20} width={20} src="/images/x_logo.svg" alt="x logo" />
                    <a href={user.twitter_link} target="_blank" className="text-muted-foreground hover:underline">
                      (Twitter)
                    </a>
                  </p>
                </div>
                <div className="flex justify-between sm:px-14">
                  <p className="text-muted-foreground flex items-center gap-2">
                    <img height={23} width={23} src="/images/farcaster.svg" alt="farcaster logo" />
                    <a href={user.farcaster_link} target="_blank" className="text-muted-foreground hover:underline">
                      Farcaster
                    </a>
                  </p>
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Link size={24} />
                    <a href={user.other_link} target="_blank" className="text-muted-foreground hover:underline">
                      Other
                    </a>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col p-4 gap-3 items-center justify-center">
              <p className="text-gray-500">No user data available</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );

  const renderContent = () => {
    if (isLoading) {
      return <div className="text-center text-xl">Loading...</div>;
    }

    if (error) {
      return <div className="text-center text-xl text-red-500">{error}</div>;
    }

    if (users.length === 0) {
      return <div className="text-center text-xl">No users available</div>;
    }

    return <ProfileCard user={currentUser} imageIndex={currentImageIndex} isLoading={isLoading} />;
  };
  return (
    <div className="flex sm:flex-row flex-col items-stretch min-h-screen bg-gradient-to-br from-primary to-secondary">
      {/* Profile Card */}
      <div className="flex-grow flex justify-center items-center">
        <div className="w-full max-w-xl">
          <ProfileCard 
            user={users[currentUserIndex] || null} 
            imageIndex={currentImageIndex}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Buttons */}
      <div className="fixed bottom-16 left-0 right-0 flex justify-center space-x-4">
        <button
          onClick={handlePrevious}
          className="bg-primary text-destructive-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
          aria-label="Dislike"
          disabled={isLoading || users.length === 0}
        >
          <X size={24} />
        </button>
        <button
          onClick={handleNext}
          className="bg-green-500 text-primary-foreground rounded-full p-4 shadow-lg hover:bg-green-500/90 transition-colors disabled:opacity-50"
          aria-label="Like"
          disabled={isLoading || users.length === 0}
        >
          <Heart size={24} />
        </button>
      </div>

      {/* Navigation */}
      <BottomNavigationBar />
    </div>
  );
}