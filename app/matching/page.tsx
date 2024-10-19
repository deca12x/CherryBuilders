"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X, Heart, Link, Smile, Frown, CheckCircle2 } from "lucide-react";
import { K2D } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import { UserTag, UserType } from "@/lib/types";
import BottomNavigationBar from "@/components/navbar/BottomNavigationBar";
import MatchModal from "@/components/matching/MatchModal";
import ProfilesEndedModal from "@/components/matching/ProfilesEndedModal";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/loadingSpinner";
import {
  createChat,
  createMatch,
  getPartialMatch,
  getRandomUsers,
  getSpecificChat,
  getUser,
  updateMatch,
} from "@/lib/supabase/utils";
import { cn } from "@/lib/utils";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

export default function Matching() {
  const [users, setUsers] = useState<UserType[]>([]);
  const { user, ready, getAccessToken } = usePrivy();
  const router = useRouter();
  const [error, setError] = useState(false);
  const [jwt, setJwt] = useState<string | null>(null);
  const [wasUserChecked, setWasUserChecked] = useState(false);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [animateFrame, setAnimateFrame] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isProfilesEndedModalOpen, setIsProfilesEndedModalOpen] = useState(false);
  const [matchedChatId, setMatchedChatId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<"accept" | "reject" | null>(null);

  const address = user?.wallet?.address;

  useEffect(() => {
    const checkUser = async () => {
      if (!ready) return;

      // If no address or no user are found, push the user to log in
      if (!user || !address) {
        router.push("/");
        return;
      }

      const token = await getAccessToken();
      setJwt(token);

      // If no error occurs but the user is not in the database
      // push it toward the profile creation page
      const { success, data, error } = await getUser(address, token);
      if (!success && error) {
        setError(true);
        return;
      } else if (!data) {
        router.push("/profile/creation");
        return;
      }
      setWasUserChecked(true);
    };

    checkUser();
  }, [user, ready, router]);

  // A useEffect that fetches users only when the connected user
  // was correctly checked
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const foundRandomUsers = await getRandomUsers(false, 20, jwt);
        if (!foundRandomUsers.success) throw foundRandomUsers.error;

        setUsers(foundRandomUsers.data);
        // TODO: Remove this log in production
        console.log("-------USER DATA -------");
        console.log(foundRandomUsers.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (wasUserChecked) fetchUsers();
  }, [wasUserChecked]);

  const currentUser = users[currentUserIndex];

  const checkMatch = async () => {
    if (!address || !currentUser) return;

    try {
      const partialMatch = await getPartialMatch(currentUser.evm_address, address, jwt);

      if (!partialMatch.success && partialMatch.error) throw new Error(partialMatch.error);
      console.log(partialMatch.data);

      // If no partial match is found create one
      if (partialMatch.data.length === 0) {
        console.log("No matches found, creating a new match if it doesn't exist");
        const newMatch = await createMatch(address, currentUser.evm_address, jwt);
        if (!newMatch.success) throw Error(newMatch.error);
      }

      // If a match is found, update it
      else if (partialMatch.data.length > 0) {
        console.log("Match exists, update it");
        const updatedMatch = await updateMatch(currentUser.evm_address, address, true, jwt);
        if (!updatedMatch.success) throw Error(updatedMatch.error);

        // Create a chat between the two users
        const newChat = await createChat(address, currentUser.evm_address, jwt);
        if (!newChat.success) throw Error(newChat.error);

        // Get the chat ID
        const specificChat = await getSpecificChat(address, currentUser.evm_address, jwt);
        if (!specificChat.success) throw new Error(specificChat.error);

        setIsMatchModalOpen(true);
        setIsProfilesEndedModalOpen(false);
        setMatchedChatId(specificChat.data?.id);
      }
    } catch (error) {
      console.error("Error in checkMatch:", error);
    }
  };

  const handleAccept = async () => {
    if (users.length === 0) return;
    setIsProcessing(true);
    setProcessingAction("accept");
    await checkMatch();
    // If the current user is the last user in the list, do not animate
    if (currentUserIndex !== users.length - 1) {
      setAnimateFrame(true);
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentImageIndex(0);
    } else {
      setIsProfilesEndedModalOpen(true);
    }
    setIsProcessing(false);
    setProcessingAction(null);
  };

  const handleReject = async () => {
    setIsProcessing(true);
    setProcessingAction("reject");
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (users.length === 0 || currentUserIndex === users.length - 1) {
      setIsProfilesEndedModalOpen(true);
    } else {
      setAnimateFrame(true);
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentImageIndex(0);
    }
    setIsProcessing(false);
    setProcessingAction(null);
  };

  const handleImageNext = () => {
    if (!currentUser) return;
    setCurrentImageIndex((prev) => (prev + 1) % currentUser.profile_pictures.length);
  };

  const handleImagePrevious = () => {
    if (!currentUser) return;
    setCurrentImageIndex((prev) => (prev - 1 + currentUser.profile_pictures.length) % currentUser.profile_pictures.length);
  };

  const ProfileCard = ({
    user,
    imageIndex,
    isLoading,
  }: {
    user: UserType | null;
    imageIndex: number;
    isLoading: boolean;
  }) => (
    <div className="w-full max-w-xl bg-background shadow-lg overflow-hidden relative flex-grow pb-28">
      <AnimatePresence>
        {isProcessing ? (
          <motion.div
            key="processing"
            className="absolute inset-0 flex items-center justify-center bg-background/80 z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {processingAction === "accept" ? (
              <Smile size={64} className="text-green-500" />
            ) : (
              <Frown size={64} className="text-gray-500" />
            )}
          </motion.div>
        ) : null}
        <motion.div
          key="1"
          className="w-full"
          initial={{ x: animateFrame ? 400 : 0, opacity: animateFrame ? 0 : 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: animateFrame ? -400 : 0, opacity: animateFrame ? 0 : 1 }}
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
                    <h2 className={cn(`flex items-center text-3xl font-bold text-primary-foreground ${k2d.className}`)}>
                      <span className="mb-1">{user.name}</span>
                    </h2>
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {user.tags.map((tag: UserTag, index: number) => (
                        <span key={index} className="bg-secondary text-secondary-foreground px-2 py-1 rounded-full text-sm">
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </span>
                      ))}
                      {user.LANNA_2024 && (
                        <span className="bg-gradient-to-r from-[#f5acac] to-[#8ec5d4] text-primary-foreground px-2 py-1 rounded-full text-sm flex">
                          <CheckCircle2 className="mr-2 h-5 w-5" />
                          <p className="font-bold">Lanna 2024 Confirmed</p>
                        </span>
                      )}
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
          initial={{ x: animateFrame ? 400 : 0, opacity: animateFrame ? 0 : 1 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: animateFrame ? -400 : 0, opacity: animateFrame ? 0 : 1 }}
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
              <div className="w-full gap-3">
                {/* Talent score */}
                <div className="flex flex-col items-center bg-card rounded-xl p-3">
                  <p className="font-bold text-foreground">Talent Score</p>
                  <p className="text-muted-foreground">{user.talent_score ?? "N/A"}</p>
                </div>
              </div>
              {/* Bio */}
              <div className="flex flex-col gap-2 bg-card rounded-xl p-3">
                <p className="font-bold text-foreground">Who am I?</p>
                <p className="text-muted-foreground">{user.bio}</p>
              </div>

              {/* Links */}
              {(user.twitter_link || user.github_link || user.farcaster_link || user.other_link) && (
                <div className="flex flex-col gap-3 bg-card rounded-xl p-3">
                  <p className="font-bold text-foreground">Links</p>
                  <div className="grid grid-cols-2 gap-4 sm:px-14">
                    {user.github_link && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <img height={26} width={26} src="/images/github.png" alt="github logo" />
                        <a href={user.github_link} target="_blank" className="text-muted-foreground hover:underline">
                          Github
                        </a>
                      </p>
                    )}
                    {user.twitter_link && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <img height={20} width={20} src="/images/x_logo.svg" alt="x logo" />
                        <a href={user.twitter_link} target="_blank" className="text-muted-foreground hover:underline">
                          Twitter
                        </a>
                      </p>
                    )}
                    {user.farcaster_link && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <img height={23} width={23} src="/images/farcaster.svg" alt="farcaster logo" />
                        <a href={user.farcaster_link} target="_blank" className="text-muted-foreground hover:underline">
                          Farcaster
                        </a>
                      </p>
                    )}
                    {user.other_link && (
                      <p className="text-muted-foreground flex items-center gap-2">
                        <Link size={24} />
                        <a href={user.other_link} target="_blank" className="text-muted-foreground hover:underline">
                          Other
                        </a>
                      </p>
                    )}
                  </div>
                </div>
              )}
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

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-primary text-2xl">
        An unexpected error occured, please try again!
      </div>
    );
  } else if (user && address && ready) {
    return (
      <div className="flex sm:flex-row flex-col items-stretch min-h-screen bg-gradient-to-br from-primary to-secondary">
        {/* Profile Card */}
        <div className="flex-grow flex justify-center items-center">
          <div className="w-full max-w-xl">
            <ProfileCard user={users[currentUserIndex] || null} imageIndex={currentImageIndex} isLoading={isLoading} />
          </div>
        </div>

        {/* Buttons */}
        <div className="fixed bottom-16 left-0 right-0 flex justify-center space-x-4">
          <button
            onClick={handleReject}
            className="bg-primary text-destructive-foreground rounded-full p-4 shadow-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
            aria-label="Dislike"
            disabled={isLoading || users.length === 0}
          >
            <X size={24} />
          </button>
          <button
            onClick={handleAccept}
            className="bg-green-500 text-primary-foreground rounded-full p-4 shadow-lg hover:bg-green-500/90 transition-colors disabled:opacity-50"
            aria-label="Like"
            disabled={isLoading || users.length === 0}
          >
            <Heart size={24} />
          </button>
        </div>

        {/* Navigation */}
        <BottomNavigationBar />

        {/* Match Modal */}
        <MatchModal isOpen={isMatchModalOpen} onClose={() => setIsMatchModalOpen(false)} chatId={matchedChatId} />

        {/* Profiles Ended Modal */}
        <ProfilesEndedModal isOpen={isProfilesEndedModalOpen} onClose={() => setIsProfilesEndedModalOpen(false)} />
      </div>
    );
  } else {
    return <LoadingSpinner />;
  }
}
