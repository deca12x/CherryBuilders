"use client";
import { useEffect, useState } from "react";
import { Smile, Frown } from "lucide-react";
import { K2D } from "next/font/google";
import { motion, AnimatePresence } from "framer-motion";
import BottomNavigationBar from "@/components/navbar/BottomNavigationBar";
import MatchModal from "@/components/matching/MatchModal";
import ProfilesEndedModal from "@/components/matching/ProfilesEndedModal";
import { usePrivy } from "@privy-io/react-auth";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  createChat,
  createMatch,
  getPartialMatch,
  getFilteredUsers,
  getSpecificChat,
  updateMatch,
} from "@/lib/supabase/utils";
import ErrorCard from "@/components/ui/error-card";
import { UserTag, UserType } from "@/lib/supabase/types";
import FiltersModal from "@/components/matching/FiltersModal";
import ActionAndFiltersButtons from "@/components/matching/ActionButtons";
import NoUsersFound from "@/components/matching/NoUsersFound";
import ProfileCardSkeleton from "@/components/matching/ProfileCardSkeleton";
import ProfileCardContent from "@/components/matching/ProfileCardContent";
import ProfileCardImage from "@/components/matching/ProfileCardImage";
import { FiltersProp } from "@/lib/types";

const k2d = K2D({ weight: "600", subsets: ["latin"] });

interface MatchingContentProps {
  jwt: string | null;
  address: string;
  userFilters: FiltersProp;
}

export default function MatchingParent({
  jwt,
  address,
  userFilters,
}: MatchingContentProps) {
  const [users, setUsers] = useState<UserType[]>([]);
  const { user, ready } = usePrivy();
  const [error, setError] = useState(false);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [animateFrame, setAnimateFrame] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isProfilesEndedModalOpen, setIsProfilesEndedModalOpen] =
    useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [matchedChatId, setMatchedChatId] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingAction, setProcessingAction] = useState<
    "accept" | "reject" | null
  >(null);
  const [filters, setFilters] = useState<FiltersProp>(userFilters);

  // A useEffect that fetches users only when the connected user
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const activeTags = Object.keys(filters.tags).filter(
          (key) => filters.tags[key as UserTag]
        );
        const activeEvents = Object.keys(filters.events).filter(
          (key) => filters.events[key].selected
        );

        const foundFilteredUsers = await getFilteredUsers(
          activeTags,
          activeEvents,
          0,
          200,
          jwt
        );
        if (!foundFilteredUsers.success) throw foundFilteredUsers.error;

        setUsers(foundFilteredUsers.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [filters, jwt]);

  const currentUser = users[currentUserIndex];

  const checkMatch = async () => {
    if (!address || !currentUser) return;

    try {
      const partialMatch = await getPartialMatch(
        currentUser.evm_address,
        address,
        jwt
      );

      if (!partialMatch.success && partialMatch.error)
        throw new Error(partialMatch.error);

      // If no partial match is found create one
      if (partialMatch.data.length === 0) {
        const newMatch = await createMatch(
          address,
          currentUser.evm_address,
          jwt
        );
        if (!newMatch.success) throw Error(newMatch.error);
      }

      // If a match is found, update it
      else if (partialMatch.data.length > 0) {
        const updatedMatch = await updateMatch(
          currentUser.evm_address,
          address,
          true,
          jwt
        );
        if (!updatedMatch.success) throw Error(updatedMatch.error);

        // Create a chat between the two users
        const newChat = await createChat(address, currentUser.evm_address, jwt);
        if (!newChat.success) throw Error(newChat.error);

        // Get the chat ID
        const specificChat = await getSpecificChat(
          address,
          currentUser.evm_address,
          jwt
        );
        if (!specificChat.success) throw new Error(specificChat.error);

        // SEND EMAIL NOTIFICATIONS TO MATCHES
        // CREATE A sendEmailNotification FUNCTION

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
    setCurrentImageIndex(
      (prev) => (prev + 1) % currentUser.profile_pictures.length
    );
  };

  const handleImagePrevious = () => {
    if (!currentUser) return;
    setCurrentImageIndex(
      (prev) =>
        (prev - 1 + currentUser.profile_pictures.length) %
        currentUser.profile_pictures.length
    );
  };

  const ProfileCard = ({
    user,
    imageIndex,
    isLoading,
  }: {
    user: UserType | null;
    imageIndex: number;
    isLoading: boolean;
  }) => {
    return user || isLoading ? (
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
          <ProfileCardImage
            user={users[currentUserIndex] || null}
            imageIndex={currentImageIndex}
            isLoading={isLoading}
            animateFrame={animateFrame}
            onImagePrevious={handleImagePrevious}
            onImageNext={handleImageNext}
            onAnimationComplete={() => setAnimateFrame(false)}
          />

          {/* Content */}
          <motion.div
            key="2"
            className="w-full"
            initial={{
              x: animateFrame ? 400 : 0,
              opacity: animateFrame ? 0 : 1,
            }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: animateFrame ? -400 : 0, opacity: animateFrame ? 0 : 1 }}
            transition={{ type: "spring", duration: 0.7 }}
          >
            {isLoading ? (
              <ProfileCardSkeleton />
            ) : user ? (
              <ProfileCardContent
                user={user}
                onOpenFilters={() => setIsFiltersModalOpen(true)}
              />
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>
    ) : (
      <NoUsersFound onOpenFilters={() => setIsFiltersModalOpen(true)} />
    );
  };

  if (error) {
    return <ErrorCard />;
  } else if (user && address && ready) {
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
        {users.length > 0 && (
          <ActionAndFiltersButtons
            onReject={handleReject}
            onAccept={handleAccept}
            isLoading={isLoading}
            onOpenFilters={() => setIsFiltersModalOpen(true)}
          />
        )}

        {/* Navigation */}
        <BottomNavigationBar />

        {/* Match Modal */}
        <MatchModal
          isOpen={isMatchModalOpen}
          onClose={() => setIsMatchModalOpen(false)}
          chatId={matchedChatId}
        />

        {/* Filters Modal */}
        <FiltersModal
          isOpen={isFiltersModalOpen}
          onClose={() => setIsFiltersModalOpen(false)}
          parentFilters={filters}
          setParentFilters={setFilters}
          jwt={jwt}
        />

        {/* Profiles Ended Modal */}
        <ProfilesEndedModal
          isOpen={isProfilesEndedModalOpen}
          onClose={() => setIsProfilesEndedModalOpen(false)}
        />
      </div>
    );
  } else {
    return <LoadingSpinner />;
  }
}
