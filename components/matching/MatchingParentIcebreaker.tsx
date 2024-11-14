"use client";
import { useEffect, useState } from "react";
import BottomNavigationBar from "@/components/navbar/BottomNavigationBar";
import MatchModal from "@/components/matching/MatchModal";
import { usePrivy } from "@privy-io/react-auth";
import LoadingSpinner from "@/components/ui/loading-spinner";
import {
  createChat,
  createMatch,
  getPartialMatch,
  getSpecificChat,
  updateMatch,
} from "@/lib/supabase/utils";
import ErrorCard from "@/components/ui/error-card";
import { UserType } from "@/lib/supabase/types";
import ProfileCard from "./ProfileCard";
import { sendMatchingEmail } from "@/lib/email/sendMatchingEmail";

interface MatchingParentIcebreakerProps {
  jwt: string | null;
  address: string;
  loggedInUserData: UserType | null;
  specificUser: UserType | null;
  icebreakerMessage: string | null;
  onComplete: () => void;
}

export default function MatchingParentIcebreaker({ 
  jwt, 
  address, 
  loggedInUserData,
  specificUser,
  icebreakerMessage,
  onComplete 
}: MatchingParentIcebreakerProps) {
  const { user, ready } = usePrivy();
  const [error, setError] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [animateFrame, setAnimateFrame] = useState(false);
  const [isMatchModalOpen, setIsMatchModalOpen] = useState(false);
  const [matchedChatId, setMatchedChatId] = useState<string>("");
  const [processingAction, setProcessingAction] = useState<"accept" | "reject" | "icebreaker" | null>(null);

  const checkMatch = async () => {
    if (!address || !specificUser) return;

    try {
      const partialMatch = await getPartialMatch(specificUser.evm_address, address, jwt);
      if (!partialMatch.success && partialMatch.error) throw new Error(partialMatch.error);

      // If no partial match is found create one
      if (partialMatch.data.length === 0) {
        const newMatch = await createMatch(address, specificUser.evm_address, jwt);
        if (!newMatch.success) throw Error(newMatch.error);
      }
      // If a match is found, update it
      else if (partialMatch.data.length > 0) {
        const updatedMatch = await updateMatch(specificUser.evm_address, address, true, jwt);
        if (!updatedMatch.success) throw Error(updatedMatch.error);

        // Create a chat between the two users
        const newChat = await createChat(address, specificUser.evm_address, jwt);
        if (!newChat.success) throw Error(newChat.error);

        // Get the chat ID
        const specificChat = await getSpecificChat(address, specificUser.evm_address, jwt);
        if (!specificChat.success) throw new Error(specificChat.error);

        setIsMatchModalOpen(true);
        setMatchedChatId(specificChat.data?.id);


          await sendMatchingEmail({
            matchedWith: loggedInUserData?.name as string,
            matchedWithImage: loggedInUserData?.profile_pictures[0] || "",
            matchedWithBio: loggedInUserData?.bio as string,
            chatLink: `https://cherry.builders/chat/${matchedChatId}`,
            receiverEmail: specificUser.email || "",
            jwt: jwt as string,
            message: icebreakerMessage || undefined,
            isMatchComplete: true
        });
      }
    } catch (error) {
      console.error("Error in checkMatch:", error);
    }
  };

  const handleAccept = async () => {
    setProcessingAction("accept");
    await checkMatch();
    await new Promise(resolve => setTimeout(resolve, 1000));
    onComplete();
    setProcessingAction(null);
  };

  const handleReject = async () => {
    setProcessingAction("reject");
    await new Promise(resolve => setTimeout(resolve, 1000));
    onComplete();
    setProcessingAction(null);
  };

  const handleIcebreaker = async (message: string) => {
    setProcessingAction("icebreaker");
    try {
      await checkMatch();
      await new Promise(resolve => setTimeout(resolve, 1000));
      onComplete();
    } catch (error) {
      console.error("Error in handleIcebreaker:", error);
    } finally {
      setProcessingAction(null);
    }
  };

  if (error) {
    return <ErrorCard />;
  } else if (user && address && ready) {
    return (
      <div className="flex sm:flex-row flex-col items-center justify-center min-h-screen bg-gradient-to-br from-primary to-secondary">
        {/* Profile Card */}
        <ProfileCard
          user={specificUser}
          imageIndex={currentImageIndex}
          isLoading={isLoading}
          animateFrame={animateFrame}
          processingAction={processingAction}
          setAnimateFrame={setAnimateFrame}
          setIsFiltersModalOpen={() => {}} // No-op since we don't need filters for icebreaker
          handleAccept={handleAccept}
          handleReject={handleReject}
          handleIcebreaker={handleIcebreaker}
          icebreakerMessage={icebreakerMessage}
          onShowNoEmailModal={() => {}} 
        />

        {/* Navigation */}
        <BottomNavigationBar />

        {/* Match Modal */}
        <MatchModal 
          isOpen={isMatchModalOpen} 
          onClose={() => {
            setIsMatchModalOpen(false);
            onComplete();
          }} 
          chatId={matchedChatId} 
        />
      </div>
    );
  } else {
    return <LoadingSpinner />;
  }
} 