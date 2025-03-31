import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EventType, UserType } from "@/lib/supabase/types";
import ConnectButton from "@/components/ui/connectButton";
import { updateUser, updateUserEvent } from "@/lib/supabase/utils";
import ProfileForm from "@/components/profile/ProfileForm";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { CURRENT_EVENTS } from "@/lib/supabase/eventData";

interface ProfileEditParentProps {
  initialProfileData: UserType;
  jwt: string;
  userAddress: string;
  userEvents: EventType[];
}

const ProfileEditParent: React.FC<ProfileEditParentProps> = ({
  initialProfileData,
  jwt,
  userAddress,
  userEvents,
}) => {
  const [profileData, setProfileData] = useState<UserType>(initialProfileData);
  const [selectedEvent, setSelectedEvent] = useState<string>("neither");
  const { toast } = useToast();

  useEffect(() => {
    console.log("useEffect triggered with userEvents:", userEvents);

    // If user has no events at all, they're in "neither" state
    if (!userEvents || userEvents.length === 0) {
      console.log("No events found, setting to neither");
      setSelectedEvent("neither");
      return;
    }

    // From the user's registered events, find one that matches a current event
    const userCurrentEvent = userEvents.find((event) =>
      CURRENT_EVENTS.some((currentEvent) => currentEvent.slug === event.slug)
    );

    if (userCurrentEvent) {
      console.log(`Setting event to ${userCurrentEvent.slug}`);
      setSelectedEvent(userCurrentEvent.slug);
    } else {
      console.log("No matching current events found, setting to neither");
      setSelectedEvent("neither");
    }
  }, [userEvents]);

  const handleSubmit = async (updatedData: UserType, selectedEvent: string) => {
    try {
      console.log("Handling submit with data:", updatedData);
      console.log("Selected event:", selectedEvent);

      // First update the user profile
      const updatedUser = await updateUser(userAddress, updatedData, jwt);
      if (!updatedUser.success) throw Error(updatedUser.error);
      console.log("User profile updated successfully");

      await updateUserEvent(userAddress, selectedEvent, jwt);

      setProfileData(updatedData);
      toast({
        title: "Success",
        description: "Profile saved successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error in handleSubmit:", error);
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
    <>
      <motion.div
        className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <motion.h1
          className="text-3xl font-bold text-primary mb-8"
          variants={itemVariants}
        >
          Edit Your Profile
        </motion.h1>
        <div className="flex flex-col sm:flex-row gap-3">
          <ConnectButton />
        </div>

        <ProfileForm
          initialData={profileData}
          onSubmit={handleSubmit}
          submitButtonText="Save changes"
          showTalentScore={true}
          jwt={jwt}
          userEvents={userEvents}
          initialSelectedEvent={selectedEvent}
        />
      </motion.div>
    </>
  );
};

export default ProfileEditParent;
