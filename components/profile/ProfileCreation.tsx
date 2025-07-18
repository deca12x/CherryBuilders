"use client";
import React, { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { UserType } from "@/lib/supabase/types";
import ConnectButton from "@/components/ui/connectButton";
import { useRouter } from "next/navigation";
import { createUserEvent, updateUser } from "@/lib/supabase/utils";
import ProfileForm from "./ProfileForm";
import { Skeleton } from "../ui/skeleton";
import SearchParamsComponent from "../searchparams";

interface ProfileCreationProps {
  jwt: string;
  address: string;
}

const ProfileCreation: React.FC<ProfileCreationProps> = ({ jwt, address }) => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UserType>({
    name: "",
    bio: "",
    building: "",
    looking_for: "",
    profile_pictures: [],
    tags: [],
    github_link: "",
    twitter_link: "",
    farcaster_link: "",
    other_link: "",
    evm_address: address,
    emailNotifications: false,
    emailMarketing: false,
  });

  const router = useRouter();
  const [passcode, setPasscode] = useState<string | null>(null);
  const [eventSlug, setEventSlug] = useState<string | null>(null);
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);

  const handleSubmit = async (data: UserType, selectedEvents: string[]) => {
    if (!data.emailNotifications) {
      toast({
        title: "🙉 We know, emails are annoying",
        description:
          "Email notifications for matches and messages are required for core functionality",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateProfileData(address, data);

      // Create events for all selected events
      for (const eventSlug of selectedEvents) {
        await createUserEvent(address, eventSlug, jwt);
      }

      toast({
        title: "Success",
        description: "Profile saved successfully.",
        variant: "default",
      });
      if (passcode && eventSlug) {
        router.push(
          `/verify/event?passcode=${passcode}&event-slug=${eventSlug}`
        );
        return;
      } else {
        router.push("/matching");
      }
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  async function updateProfileData(
    address: string,
    profileData: UserType
  ): Promise<void> {
    // Get the talent passport if the user has one
    const response = await fetch("/api/talent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({ address }),
    });

    // Parse the response
    const talentScore = response.ok ? await response.json() : null;

    // Only include talent_score in the profile data if it's not null
    const profileDataToUpdate = {
      ...profileData,
      evm_address: address,
    };

    // Add talent_score only if it exists
    if (talentScore !== null) {
      profileDataToUpdate.talent_score = talentScore.toString();
    }

    const updatedUser = await updateUser(address, profileDataToUpdate, jwt);

    if (!updatedUser.success) throw updatedUser.error;
  }

  const handleParamsChange = (
    passcode: string | null,
    eventSlug: string | null
  ) => {
    setPasscode(passcode);
    setEventSlug(eventSlug);
  };

  return (
    <motion.main className="flex flex-col min-h-screen bg-background mb-12">
      <Suspense fallback={<Skeleton className="h-8 w-3/4 mx-auto" />}>
        <SearchParamsComponent onParamsChange={handleParamsChange} />
      </Suspense>
      <div className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
        <motion.h1 className="text-3xl font-bold text-red mb-8">
          Create Your Profile
        </motion.h1>
        <ConnectButton />
        <ProfileForm
          initialData={profileData}
          onSubmit={handleSubmit}
          submitButtonText="Save & Continue"
          jwt={jwt}
          initialSelectedEvents={selectedEvents}
        />
      </div>
    </motion.main>
  );
};

export default ProfileCreation;
