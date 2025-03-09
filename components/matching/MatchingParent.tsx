"use client";
import { useEffect, useState, useRef } from "react";
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

import { sendMatchingEmail } from "@/lib/email/sendMatchingEmail";
import NoEmailModal from "@/components/matching/NoEmailModal";

interface MatchingContentProps {
  jwt: string | null;
  address: string;
  userFilters: FiltersProp;
  loggedInUserData: UserType | null;
}

export default function MatchingParent({
  jwt,
  address,
  userFilters,
  loggedInUserData,
}: MatchingContentProps) {
  const [fetchedUsers, setFetchedUsers] = useState<UserType[]>([]);
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
  const [processingAction, setProcessingAction] = useState<
    "accept" | "reject" | "icebreaker" | null
  >(null);
  const [filters, setFilters] = useState<FiltersProp>(userFilters);
  const [isNoEmailModalOpen, setIsNoEmailModalOpen] = useState(false);
  const mounted = useRef(false);

  const currentUser = fetchedUsers[currentUserIndex];

  // A useEffect that fetches users based on the filters (avoiding first render double fetch)
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }

    console.log("£££££££££££££££££££ Dependencies changed:", { filters, jwt });
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        console.log("1. Starting fetch");
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
        console.log("2. API Response:", foundFilteredUsers);
        if (!foundFilteredUsers.success) throw foundFilteredUsers.error;

        console.log("3. Setting fetchedUsers:", foundFilteredUsers.data);
        setFetchedUsers(foundFilteredUsers.data);
        console.log("4. Current index:", currentUserIndex);
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
      const partialMatch = await getPartialMatch(
        currentUser.evm_address,
        address,
        jwt
      );

      if (!partialMatch.success && partialMatch.error)
        throw new Error(partialMatch.error);
      // If no partial match is found create one
      if (partialMatch.data.length === 0) {
        console.log("Creating new match", {
          address,
          currentUserAddress: currentUser.evm_address,
        });
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

        if (fetchedUsers[currentUserIndex].emailNotifications) {
          console.log("6. Checking email conditions:", {
            hasNotifications: fetchedUsers[currentUserIndex].emailNotifications,
            email: fetchedUsers[currentUserIndex]?.email,
          });
          console.log("7. Sending match completion email");
          await sendMatchingEmail({
            matchedWith: loggedInUserData?.name as string,
            matchedWithImage: loggedInUserData?.profile_pictures[0] || "",
            matchedWithBio: loggedInUserData?.bio as string,
            matchedWithBuilding: loggedInUserData?.building as string,
            matchedWithLookingFor: loggedInUserData?.looking_for as string,
            matchedWithAddress: address,
            chatLink: `https://cherry.builders/chat/${specificChat.data?.id}`,
            receiverEmail: fetchedUsers[currentUserIndex].email || "",
            jwt: jwt as string,
            isMatchComplete: true,
          });
        }
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
    if (fetchedUsers.length === 0) {
      // Truly no more profiles
      setIsProfilesEndedModalOpen(true);
    } else if (currentUserIndex >= fetchedUsers.length - 1) {
      // We've reached the end of current batch
      setCurrentUserIndex(0); // Start over from beginning
      setCurrentImageIndex(0);
    } else {
      // More profiles to show
      setAnimateFrame(true);
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentImageIndex(0);
    }
    setProcessingAction(null);
  };

  const handleIcebreaker = async (message: string) => {
    console.log("1. Starting handleIcebreaker");
    if (!address || !currentUser) {
      console.log("2. Early return - missing address or currentUser");
      return;
    }
    setProcessingAction("icebreaker");
    let isPartialMatch;

    try {
      const partialMatch = await getPartialMatch(
        currentUser.evm_address,
        address,
        jwt
      );
      if (!partialMatch.success && partialMatch.error)
        throw new Error(partialMatch.error);

      // If no partial match is found, set flag
      if (partialMatch.data.length === 0) {
        isPartialMatch = true;
      }

      // Send email before creating/updating match
      if (currentUser.emailNotifications && currentUser.email) {
        const chatLink = isPartialMatch
          ? `https://cherry.builders/complete-match/${currentUser.evm_address}`
          : `https://cherry.builders/chat/${matchedChatId}`;

        console.log("JWT being sent:", jwt);
        console.log("Full email data:", {
          matchedWith: loggedInUserData?.name,
          matchedWithImage: loggedInUserData?.profile_pictures[0],
          matchedWithBio: loggedInUserData?.bio,
          matchedWithBuilding: loggedInUserData?.building,
          matchedWithLookingFor: loggedInUserData?.looking_for,
          chatLink,
          receiverEmail: fetchedUsers[currentUserIndex]?.email,
          jwt,
          message,
        });
        await sendMatchingEmail({
          matchedWith: loggedInUserData?.name as string,
          matchedWithImage: loggedInUserData?.profile_pictures[0] || "",
          matchedWithBio: loggedInUserData?.bio as string,
          matchedWithBuilding: loggedInUserData?.building as string,
          matchedWithLookingFor: loggedInUserData?.looking_for as string,
          matchedWithAddress: address,
          chatLink: chatLink,
          receiverEmail: fetchedUsers[currentUserIndex]?.email || "",
          jwt: jwt as string,
          message: message,
        });
      }

      // If no partial match is found create one
      if (partialMatch.data.length === 0) {
        const newMatch = await createMatch(
          address,
          currentUser.evm_address,
          jwt
        );
        if (!newMatch.success) throw Error(newMatch.error);
      }
      // If a match is found, update it and create chat
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

        // Show match modal and set chat ID
        isPartialMatch = false;
        setIsMatchModalOpen(true);
        setIsProfilesEndedModalOpen(false);
        setMatchedChatId(specificChat.data?.id);
      }

      // Move to next profile
      if (currentUserIndex !== fetchedUsers.length - 1) {
        setAnimateFrame(true);
        setCurrentUserIndex((prev) => prev + 1);
        setCurrentImageIndex(0);
      } else {
        setIsProfilesEndedModalOpen(true);
      }
    } catch (error) {
      console.error("Error in handleIcebreaker:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  const handleShowNoEmailModal = () => {
    setIsNoEmailModalOpen(true);
  };

  const handleLikeAnyway = async () => {
    setIsNoEmailModalOpen(false);
    await handleAccept();
  };

  const handleSkip = async () => {
    setIsNoEmailModalOpen(false);
    await handleReject();
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
          handleIcebreaker={handleIcebreaker}
          onShowNoEmailModal={() => setIsNoEmailModalOpen(true)}
        />

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

        <NoEmailModal
          isOpen={isNoEmailModalOpen}
          onClose={() => setIsNoEmailModalOpen(false)}
          onLikeAnyway={handleLikeAnyway}
          onSkip={handleSkip}
        />
      </div>
    );
  } else {
    return <LoadingSpinner />;
  }
}
