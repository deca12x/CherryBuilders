"use client";
import { useEffect, useState } from "react";
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
import { FiltersProp } from "@/lib/types";
import ProfileCard from "./ProfileCard";

interface MatchingContentProps {
  jwt: string | null;
  address: string;
  userFilters: FiltersProp;
}

export default function MatchingParent({ jwt, address, userFilters }: MatchingContentProps) {
  const [fetchedUsers, setFetchedUsers] = useState<UserType[]>([]);
  const { user, ready } = usePrivy();
  const [error, setError] = useState(false);
  const [currentUserIndex, setCurrentUserIndex] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [animateFrame, setAnimateFrame] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [isProfilesEndedModalOpen, setIsProfilesEndedModalOpen] = useState(false);
  const [isFiltersModalOpen, setIsFiltersModalOpen] = useState(false);
  const [matchedChatId, setMatchedChatId] = useState<string>("");
  const [processingAction, setProcessingAction] = useState<"accept" | "reject" | null>(null);
  const [filters, setFilters] = useState<FiltersProp>(userFilters);

  const currentUser = fetchedUsers[currentUserIndex];

  // A useEffect that fetches users based on the filters
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const activeTags = Object.keys(filters.tags).filter((key) => filters.tags[key as UserTag]);
        const activeEvents = Object.keys(filters.events).filter((key) => filters.events[key].selected);

        const foundFilteredUsers = await getFilteredUsers(activeTags, activeEvents, 0, 200, jwt);
        if (!foundFilteredUsers.success) throw foundFilteredUsers.error;

        setFetchedUsers(foundFilteredUsers.data);
      } catch (error) {
        console.error("Error fetching users:", error);
        setError(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, [filters, jwt]);

  const checkMatch = async () => {
    if (!address || !currentUser) return;

    try {
      const partialMatch = await getPartialMatch(currentUser.evm_address, address, jwt);

      if (!partialMatch.success && partialMatch.error) throw new Error(partialMatch.error);

      // If no partial match is found create one
      if (partialMatch.data.length === 0) {
        const newMatch = await createMatch(address, currentUser.evm_address, jwt);
        if (!newMatch.success) throw Error(newMatch.error);
      }

      // If a match is found, update it
      else if (partialMatch.data.length > 0) {
        const updatedMatch = await updateMatch(currentUser.evm_address, address, true, jwt);
        if (!updatedMatch.success) throw Error(updatedMatch.error);

        // Create a chat between the two users
        const newChat = await createChat(address, currentUser.evm_address, jwt);
        if (!newChat.success) throw Error(newChat.error);

        // Get the chat ID
        const specificChat = await getSpecificChat(address, currentUser.evm_address, jwt);
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
    if (fetchedUsers.length === 0) return;
    setProcessingAction("accept");
    await checkMatch();
    // If the current user is the last user in the list, do not animate
    if (currentUserIndex !== fetchedUsers.length - 1) {
      setAnimateFrame(true);
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentImageIndex(0);
    } else {
      setIsProfilesEndedModalOpen(true);
    }
    setProcessingAction(null);
  };

  const handleReject = async () => {
    setProcessingAction("reject");
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (fetchedUsers.length === 0 || currentUserIndex === fetchedUsers.length - 1) {
      setIsProfilesEndedModalOpen(true);
    } else {
      setAnimateFrame(true);
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentImageIndex(0);
    }
    setProcessingAction(null);
  };

  if (error) {
    return <ErrorCard />;
  } else if (user && address && ready) {
    return (
      <div className="flex sm:flex-row flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary to-secondary">
        {/* Profile Card */}
        <ProfileCard
          user={fetchedUsers[currentUserIndex] || null}
          imageIndex={currentImageIndex}
          isLoading={isLoading}
          animateFrame={animateFrame}
          processingAction={processingAction}
          setAnimateFrame={setAnimateFrame}
          setIsFiltersModalOpen={setIsFiltersModalOpen}
          handleAccept={handleAccept}
          handleReject={handleReject}
        />

        {/* Match Modal */}
        <MatchModal isOpen={isMatchModalOpen} onClose={() => setIsMatchModalOpen(false)} chatId={matchedChatId} />

        {/* Filters Modal */}
        <FiltersModal
          isOpen={isFiltersModalOpen}
          onClose={() => setIsFiltersModalOpen(false)}
          parentFilters={filters}
          setParentFilters={setFilters}
          jwt={jwt}
        />

        {/* Profiles Ended Modal */}
        <ProfilesEndedModal isOpen={isProfilesEndedModalOpen} onClose={() => setIsProfilesEndedModalOpen(false)} />
      </div>
    );
  } else {
    return <LoadingSpinner />;
  }
}
