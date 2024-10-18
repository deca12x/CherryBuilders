"use client";
import React, { useRef, useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { UserTag, UserType } from "@/lib/types";
import { supabaseAnonClient as supabase } from "@/lib/supabase";
import ConnectButton from "@/components/ui/connectButton";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { isUserInDatabase, updateUser, uploadProfilePicture } from "@/lib/supabase/utils";
import LoadingSpinner from "@/components/loadingSpinner";
import { useSearchParams } from "next/navigation";

const ProfileCreation: React.FC = () => {
  const { user, ready } = usePrivy();
  const [step, setStep] = useState(0);
  const [unlockPage, setUnlockPage] = useState(false);
  const [profileData, setProfileData] = useState<UserType>({
    name: "",
    bio: "",
    tags: [],
    github_link: "",
    twitter_link: "",
    farcaster_link: "",
    other_link: "",
    profile_pictures: [],
    evm_address: user?.wallet?.address || "",
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(false);
  const [isLannaConfirmed, setIsLannaConfirmed] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { toast } = useToast();
  const searchParams = useSearchParams();
  const isNewUser = searchParams.get("newUser") === "true";

  const availableTags: UserTag[] = ["frontend dev", "backend dev", "solidity dev", "ui/ux dev"];

  const address = user?.wallet?.address;

  useEffect(() => {
    const fetchExistingProfile = async () => {
      if (!ready) return;

      if (!user || !address) {
        router.push("/");
        return;
      }

      if (isNewUser) {
        setUnlockPage(true);
        return;
      }

      const { data, error } = await isUserInDatabase(address);
      if (error) {
        setError(true);
        return;
      } else if (data) {
        router.push("/matching");
        return;
      } else {
        setUnlockPage(true);
      }
    };

    fetchExistingProfile();
  }, [address, user, ready, router, isNewUser]);

  const handleChange = (field: keyof UserType, value: string | UserTag[] | string[]) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: UserTag) => {
    const newTags = profileData.tags.includes(tag) ? profileData.tags.filter((t) => t !== tag) : [...profileData.tags, tag];
    handleChange("tags", newTags);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !address) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

        // Uploading the file of the profile picture to the database
        const uploadedFile = await uploadProfilePicture(address, fileName, file);
        if (!uploadedFile.success) throw Error(uploadedFile.error);

        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-pictures").getPublicUrl(`${address}/${fileName}`);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setProfileData((prev) => ({
        ...prev,
        profile_pictures: [...prev.profile_pictures, ...uploadedUrls],
      }));
      toast({
        title: "Success",
        description: "Images uploaded successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error uploading images:", error);
      toast({
        title: "Error",
        description: "Failed to upload images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      profile_pictures: prev.profile_pictures.filter((_, i) => i !== index),
    }));
  };

  const handleSaveAndContinue = async () => {
    if (!address) {
      toast({
        title: "Error",
        description: "No EVM address available. Please connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfileData(address, profileData);
      toast({
        title: "Success",
        description: "Profile saved successfully.",
        variant: "default",
      });
      router.push("/profile/creation/confirm-Hackathon");
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  async function updateProfileData(address: string, profileData: UserType): Promise<void> {
    // Get the talent passport if the user has one
    const response = await fetch("/api/talent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address }),
    });
    const passportScore: number = response.ok ? await response.json() : 0;

    const updatedUser = await updateUser(address, {
      ...profileData,
      evm_address: address,
      talent_score: passportScore || 0,
    });

    if (!updatedUser.success) throw updatedUser.error;
  }

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

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24 bg-background text-primary text-2xl">
        An unexpected error occured, please try again!
      </div>
    );
  } else if (address && user && ready && unlockPage) {
    return (
      <motion.main
        className="flex flex-col min-h-screen bg-background"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <div className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
          <motion.h1 className="text-3xl font-bold text-primary mb-8" variants={itemVariants}>
            Create Your Profile
          </motion.h1>
          <ConnectButton />

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSaveAndContinue();
            }}
            className="space-y-6 mt-6"
          >
            <motion.div variants={itemVariants}>
              <Label htmlFor="profilePictures" className="text-sm font-medium mb-2 block">
                Profile Pictures
              </Label>
              <div className="flex flex-wrap items-center gap-4">
                {profileData.profile_pictures.map((url, index) => (
                  <motion.div key={url} className="relative" variants={itemVariants}>
                    <img src={url} alt={`Profile ${index + 1}`} className="w-24 h-24 object-cover rounded-lg shadow-md" />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center shadow-md hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </motion.div>
                ))}
                <Button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="h-24 w-24"
                >
                  {isUploading ? "Uploading..." : "Insert image"}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label htmlFor="name" className="text-sm font-medium mb-2 block">
                Name
              </Label>
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => handleChange("name", e.target.value)}
                maxLength={255}
                required
                className="w-full"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label htmlFor="bio" className="text-sm font-medium mb-2 block">
                Bio
              </Label>
              <Textarea
                id="bio"
                value={profileData.bio || ""}
                onChange={(e) => handleChange("bio", e.target.value)}
                className="w-full min-h-[100px]"
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <Label className="text-sm font-medium mb-2 block">Tags</Label>
              <div className="grid grid-cols-2 gap-2">
                {availableTags.map((tag) => (
                  <div key={tag} className="flex items-center space-x-2">
                    <Checkbox
                      id={tag}
                      checked={profileData.tags.includes(tag)}
                      onCheckedChange={() => handleTagToggle(tag)}
                    />
                    <label htmlFor={tag} className="text-sm cursor-pointer">
                      {tag}
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* <EnterPasswordDialog /> */}

            <motion.div variants={itemVariants} className="space-y-4">
              <Input
                placeholder="GitHub"
                value={profileData.github_link || ""}
                onChange={(e) => handleChange("github_link", e.target.value)}
                maxLength={255}
              />
              <Input
                placeholder="X (Twitter)"
                value={profileData.twitter_link || ""}
                onChange={(e) => handleChange("twitter_link", e.target.value)}
                maxLength={255}
              />
              <Input
                placeholder="Farcaster"
                value={profileData.farcaster_link || ""}
                onChange={(e) => handleChange("farcaster_link", e.target.value)}
                maxLength={255}
              />
              <Input
                placeholder="Other link"
                value={profileData.other_link || ""}
                onChange={(e) => handleChange("other_link", e.target.value)}
                maxLength={255}
              />
            </motion.div>

            <motion.div className="mt-6" variants={itemVariants}>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save & Continue"}
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.main>
    );
  } else {
    return <LoadingSpinner />;
  }
};

export default ProfileCreation;
