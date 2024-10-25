"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { UserType } from "@/lib/supabase/types";
import ConnectButton from "@/components/ui/connectButton";
import { useRouter } from "next/navigation";
import { setUserFilters, updateUser } from "@/lib/supabase/utils";
import ProfileForm from "./ProfileForm";
import { ProfileQuery } from "@/lib/airstack/types";

interface ProfileCreationProps {
  jwt: string | null;
  address: string;
  userProfile: ProfileQuery | null;
}

const ProfileCreation: React.FC<ProfileCreationProps> = ({ jwt, address, userProfile }) => {
  const { toast } = useToast();
  const [profileData, setProfileData] = useState<UserType>({
    name: "",
    bio: "",
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

  const handleSubmit = async (data: UserType) => {
    try {
      await updateProfileData(address, data);
      toast({
        title: "Success",
        description: "Profile saved successfully.",
        variant: "default",
      });
      await setUserFilters([], [], jwt);
      router.push("/matching");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  async function updateProfileData(address: string, profileData: UserType): Promise<void> {
    // Get the talent passport if the user has one
    const response = await fetch("/api/talent", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
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

  return (
    <motion.main className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
        <motion.h1 className="text-3xl font-bold text-primary mb-8">Create Your Profile</motion.h1>
        <ConnectButton />
        <ProfileForm
          initialData={profileData}
          onSubmit={handleSubmit}
          submitButtonText="Save & Continue"
          jwt={jwt}
          userProfile={userProfile}
        />
      </div>
    </motion.main>
  );
};

export default ProfileCreation;
