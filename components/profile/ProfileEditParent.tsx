import React, { useState, useMemo, useEffect } from "react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EventType, UserType } from "@/lib/supabase/types";
import ConnectButton from "@/components/ui/connectButton";
import { updateUser, updateUserEvent } from "@/lib/supabase/utils";
import ProfileForm from "@/components/profile/ProfileForm";
import LoadingSpinner from "@/components/ui/loading-spinner";
import { getActiveEvents } from "@/lib/supabase/utils";
import { supabase } from "@/lib/supabase/supabase-client";

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
  const [selectedEvents, setSelectedEvents] = useState<string[]>([]);
  const { toast } = useToast();
  const [activeEvents, setActiveEvents] = useState<EventType[]>([]);

  useEffect(() => {
    const fetchActiveEvents = async () => {
      const { success, data, error } = await getActiveEvents(jwt);
      if (success && data) {
        setActiveEvents(data);
      } else if (error) {
        console.error("Error fetching active events:", error);
        toast({
          title: "Error",
          description: "Failed to load available events. Please try again.",
          variant: "destructive",
        });
      }
    };
    fetchActiveEvents();
  }, [jwt, toast]);

  useEffect(() => {
    // If user has no events at all, they're in "none" state
    if (!userEvents || userEvents.length === 0) {
      setSelectedEvents([]);
      return;
    }
    // Get all current active events the user is registered for
    const userCurrentEvents = userEvents
      .filter((event) =>
        activeEvents.some((currentEvent) => currentEvent.slug === event.slug)
      )
      .map((event) => event.slug);

    setSelectedEvents(userCurrentEvents);
  }, [userEvents, activeEvents]);

  const handleSubmit = async (
    updatedData: UserType,
    selectedEvents: string[]
  ) => {
    try {
      // First update the user profile
      const updatedUser = await updateUser(userAddress, updatedData, jwt);
      if (!updatedUser.success) throw Error(updatedUser.error);

      // Update events - the new updateUserEvent function handles both adding and removing events
      await updateUserEvent(userAddress, selectedEvents, jwt);

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
          className="text-3xl font-bold text-red mb-8"
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
          initialSelectedEvent={
            selectedEvents.length > 0 ? selectedEvents[0] : "none"
          }
        />
      </motion.div>
    </>
  );
};

export default ProfileEditParent;
