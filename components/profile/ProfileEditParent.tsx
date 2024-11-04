import React, { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EventType, UserType } from "@/lib/supabase/types";
import ConnectButton from "@/components/ui/connectButton";
import { updateUser } from "@/lib/supabase/utils";
import ProfileForm from "@/components/profile/ProfileForm";
import OverwriteModal from "./OverwriteModal";
import { ProfileQuery } from "@/lib/airstack/types";

interface ProfileEditParentProps {
  initialProfileData: UserType;
  jwt: string | null;
  userAddress: string;
  userEvents: EventType[];
}

const ProfileEditParent: React.FC<ProfileEditParentProps> = ({ initialProfileData, jwt, userAddress, userEvents }) => {
  const [profileData, setProfileData] = useState<UserType>(initialProfileData);
  const [isOverwriteModalOpen, setIsOverwriteModalOpen] = useState(false);
  const [isFetchingFromAirstack, setIsFetchingFromAirstack] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (updatedData: UserType) => {
    try {
      const updatedUser = await updateUser(userAddress, updatedData, jwt);
      if (!updatedUser.success) throw Error(updatedUser.error);
      setProfileData(updatedData);
      toast({
        title: "Success",
        description: "Profile saved successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleFetchFromAirstack = async () => {
    setIsFetchingFromAirstack(true);
    const response = await fetch("/api/airstack/user", {
      method: "GET",
      headers: { Authorization: `Bearer ${jwt}` },
    });
    if (!response.ok) {
      toast({
        title: "Error",
        description: "No Farcaster profile was found for this address!",
        variant: "destructive",
      });
      setIsFetchingFromAirstack(false);
      return;
    }
    const { data }: { data: ProfileQuery } = await response.json();
    // I'm sure that userProfile.Socials!.Social![0] exists (check function in /lib/airstack/index.ts)
    const user = data.Socials!.Social![0];
    const profilePicture = user.profileImage;

    console.log("Fetched profile data:", user);

    setProfileData((prev) => ({
      ...prev,
      name: user.profileName || prev.name,
      bio: user.profileBio || prev.bio,
      profile_pictures: profilePicture ? [profilePicture] : prev.profile_pictures,
    }));

    toast({
      title: "Success",
      description: "Profile fetched successfully!",
      variant: "default",
    });
    setIsFetchingFromAirstack(false);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  return (
    <>
      <motion.div
        className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1 className="text-3xl font-bold text-primary mb-8" variants={itemVariants}>
          Edit Your Profile
        </motion.h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <ConnectButton />
          <button
            className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-red-700 py-3 px-10 text-white rounded-lg text-lg font-semibold shadow-md"
            onClick={() => setIsOverwriteModalOpen(true)}
            disabled={isFetchingFromAirstack}
          >
            Fetch From Airstack
          </button>
        </div>

        <ProfileForm
          initialData={profileData}
          onSubmit={handleSubmit}
          submitButtonText="Save changes"
          showTalentScore={true}
          jwt={jwt}
          userEvents={userEvents}
        />
      </motion.div>

      {/* Overwrite Modal */}
      <OverwriteModal
        isOpen={isOverwriteModalOpen}
        onClose={() => setIsOverwriteModalOpen(false)}
        parentHandleFetchFromAirstack={handleFetchFromAirstack}
      />
    </>
  );
};

export default ProfileEditParent;
