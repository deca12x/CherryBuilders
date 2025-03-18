"use client";
import React, { Suspense, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { UserType } from "@/lib/supabase/types";
import ConnectButton from "@/components/ui/connectButton";
import { useRouter } from "next/navigation";
import {
  createUserEvent,
  setUserFilters,
  updateUser,
} from "@/lib/supabase/utils";
import ProfileForm from "./ProfileForm";
import { ProfileQuery } from "@/lib/airstack/types";
import { Skeleton } from "../ui/skeleton";
import SearchParamsComponent from "../searchparams";

interface ProfileCreationProps {
  jwt: string;
  address: string;
  userProfile: ProfileQuery | null;
}

const ProfileCreation: React.FC<ProfileCreationProps> = ({
  jwt,
  address,
  userProfile,
}) => {
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

  const handleSubmit = async (data: UserType, selectedEvent: string) => {
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
      await createUserEvent(address, selectedEvent, jwt);
      toast({
        title: "Success",
        description: "Profile saved successfully.",
        variant: "default",
      });
      await setUserFilters([], [], jwt);
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
    const passportScore: number = response.ok ? await response.json() : 0;

    const updatedUser = await updateUser(
      address,
      {
        ...profileData,
        evm_address: address,
        talent_score: passportScore || 0,
      },
      jwt
    );

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
        <motion.h1 className="text-3xl font-bold text-primary mb-8">
          Create Your Profile
        </motion.h1>
        <ConnectButton />
        <ProfileForm
          initialData={profileData}
          onSubmit={handleSubmit}
          submitButtonText="Save & Continue"
          jwt={jwt}
          userProfile={userProfile}
          initialSelectedEvent="neither"
        />
      </div>
    </motion.main>
  );
};

export default ProfileCreation;
