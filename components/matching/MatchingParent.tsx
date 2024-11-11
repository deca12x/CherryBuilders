"use client";
import { useEffect, useState } from "react";
import { K2D } from "next/font/google";
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
import { FiltersProp } from "@/lib/types";
import ProfileCard from "./ProfileCard";
import ActionButtons from "./ActionButtons";
import { sendMatchingEmail } from "@/lib/email/sendMatchingEmail";
import NoEmailModal from "@/components/matching/NoEmailModal";

interface MatchingContentProps {
  jwt: string | null;
  address: string;
  userFilters: FiltersProp;
  loggedInUserData: UserType | null;
}

export default function MatchingParent({ jwt, address, userFilters, loggedInUserData }: MatchingContentProps) {
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
  const [processingAction, setProcessingAction] = useState<"accept" | "reject" | "icebreaker" | null>(null);
  const [filters, setFilters] = useState<FiltersProp>(userFilters);
  const [isNoEmailModalOpen, setIsNoEmailModalOpen] = useState(false);

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

        
        if(fetchedUsers[currentUserIndex].emailMarketing) {
          await sendMatchingEmail({
            matchedWith: loggedInUserData?.name as string,
            matchedWithImage: loggedInUserData?.profile_pictures[0] || "",
            matchedWithBio: loggedInUserData?.bio as string,
            chatLink: `https://cherry.builders/chat/${specificChat.data?.id}`,
            receiverEmail: fetchedUsers[currentUserIndex].email || "" as string,
            jwt: jwt as string
          });
        }
      }
    } catch (error) {
      console.error("Error in checkMatch:", error);
    }
  };


  const checkMatchWithIceBreaker = async (message: string) => {
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

        
        if(fetchedUsers[currentUserIndex].emailMarketing) {
          await sendMatchingEmail({
            matchedWith: loggedInUserData?.name as string,
            matchedWithImage: loggedInUserData?.profile_pictures[0] || "",
            matchedWithBio: loggedInUserData?.bio as string,
            chatLink: `https://cherry.builders/chat/${specificChat.data?.id}`,
            receiverEmail: fetchedUsers[currentUserIndex]?.email || "" as string,
            jwt: jwt as string
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
    if (fetchedUsers.length === 0 || currentUserIndex === fetchedUsers.length - 1) {
      setIsProfilesEndedModalOpen(true);
    } else {
      setAnimateFrame(true);
      setCurrentUserIndex((prev) => prev + 1);
      setCurrentImageIndex(0);
    }
    setProcessingAction(null);
  };

  const handleIcebreaker = async (message: string) => {
    if (!address || !currentUser) return;
    setProcessingAction("icebreaker");
    let isPartialMatch;
    let completeMatch;

    try {
      const partialMatch = await getPartialMatch(currentUser.evm_address, address, jwt);
      if (!partialMatch.success && partialMatch.error) throw new Error(partialMatch.error);

      // If no partial match is found create one
      if (partialMatch.data.length === 0) {
        const newMatch = await createMatch(address, currentUser.evm_address, jwt);
        if (!newMatch.success) throw Error(newMatch.error);
        isPartialMatch = true;
      }
      // If a match is found, update it and create chat
      else if (partialMatch.data.length > 0) {
        const updatedMatch = await updateMatch(currentUser.evm_address, address, true, jwt);
        if (!updatedMatch.success) throw Error(updatedMatch.error);

        // Create a chat between the two users
        const newChat = await createChat(address, currentUser.evm_address, jwt);
        if (!newChat.success) throw Error(newChat.error);

        // Get the chat ID
        const specificChat = await getSpecificChat(address, currentUser.evm_address, jwt);
        if (!specificChat.success) throw new Error(specificChat.error);

        // Show match modal and set chat ID
        isPartialMatch = false;
        completeMatch = specificChat.data?.id;
        setIsMatchModalOpen(true);
        setIsProfilesEndedModalOpen(false);
        setMatchedChatId(specificChat.data?.id);
        
    
      }


          // Send email notification if user has opted in


           const chatLink = isPartialMatch ? `https://cherry.builders/matching-icebreaker?profile=${currentUser.evm_address}&message=${message}` : `https://cherry.builders/chat/${matchedChatId}` ;
          if (currentUser.emailNotifications && currentUser.email) {
            await sendMatchingEmail({
              matchedWith: loggedInUserData?.name as string,
              matchedWithImage: loggedInUserData?.profile_pictures[0] || "",
              matchedWithBio: loggedInUserData?.bio as string,
              chatLink: chatLink,
              receiverEmail: fetchedUsers[currentUserIndex]?.email || "",
              jwt: jwt as string,
              message: message // Include the icebreaker message
            });
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

        {/* Navigation */}
        <BottomNavigationBar />

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
