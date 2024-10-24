import React, { useState } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { UserType } from "@/lib/supabase/types";
import ConnectButton from "@/components/ui/connectButton";
import { updateUser } from "@/lib/supabase/utils";
import ProfileForm from "@/components/profile/ProfileForm";

interface ProfileEditParentProps {
  initialProfileData: UserType;
  jwt: string | null;
  userAddress: string;
}

const ProfileEditParent: React.FC<ProfileEditParentProps> = ({ initialProfileData, jwt, userAddress }) => {
  const [profileData, setProfileData] = useState<UserType>(initialProfileData);
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
    <motion.div
      className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.h1 className="text-3xl font-bold text-primary mb-8" variants={itemVariants}>
        Edit Your Profile
      </motion.h1>
      <ConnectButton />

      <ProfileForm
        initialData={profileData}
        onSubmit={handleSubmit}
        submitButtonText="Save changes"
        showTalentScore={true}
        jwt={jwt}
      />
    </motion.div>
  );
};

export default ProfileEditParent;

