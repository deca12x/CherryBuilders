"use client";

import React, { useRef, useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import WorldIDVerification from "@/components/verify";
import { motion } from 'framer-motion';
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";


type Tag = "frontend dev" | "backend dev" | "solidity dev" | "ui/ux dev";

interface ProfileData {
  name: string;
  bio: string | null;
  tags: Tag[];
  github_link: string | null;
  twitter_link: string | null;
  farcaster_link: string | null;
  other_link: string | null;
  profile_pictures: string[];
}

const ProfilePage: React.FC = () => {
  const { address } = useAccount();
  const [step, setStep] = useState(0);
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    bio: "",
    tags: [],
    github_link: "",
    twitter_link: "",
    farcaster_link: "",
    other_link: "",
    profile_pictures: [],
  });
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const availableTags: Tag[] = [
    "frontend dev",
    "backend dev",
    "solidity dev",
    "ui/ux dev",
  ];

  useEffect(() => {
    if (address) {
      fetchExistingProfile();
    }
  }, [address]);

  const fetchExistingProfile = async () => {
    if (!address) return;

    try {
      const { data, error } = await supabase
        .from("user_data")
        .select("*")
        .eq("evm_address", address)
        .single();

      if (error) throw error;

      if (data) {
        setProfileData(data as ProfileData);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleChange = (field: keyof ProfileData, value: string | Tag[] | string[]) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: Tag) => {
    const newTags = profileData.tags.includes(tag)
      ? profileData.tags.filter((t) => t !== tag)
      : [...profileData.tags, tag];
    handleChange("tags", newTags);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !address) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const { error } = await supabase.storage
          .from('profile-pictures')
          .upload(`${address}/${fileName}`, file);

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(`${address}/${fileName}`);

        return publicUrl;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      setProfileData(prev => ({
        ...prev,
        profile_pictures: [...prev.profile_pictures, ...uploadedUrls]
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
    setProfileData(prev => ({
      ...prev,
      profile_pictures: prev.profile_pictures.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
        description: "Profile saved successfully. Please proceed to World ID verification.",
        variant: "default",
      });
      setStep(1);
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

  async function updateProfileData(
    address: string,
    profileData: ProfileData
  ): Promise<void> {
    const { error } = await supabase
      .from("user_data")
      .upsert(
        {
          evm_address: address,
          ...profileData,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "evm_address",
        }
      );

    if (error) throw error;
  }

  const handleWorldIDSuccess = () => {
    toast({
      title: "Verification Successful",
      description: "Your profile is now complete with World ID verification!",
      variant: "default",
    });
    // Optionally, you can redirect the user or perform any other action here
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  };

  return (
    <motion.main
      className="flex flex-col min-h-screen bg-background"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="flex-1 p-6 md:p-8 max-w-3xl mx-auto w-full">
        <motion.h1 
          className="text-3xl font-bold text-primary mb-8"
          variants={itemVariants}
        >
          {step === 0 ? "Create Your Profile" : "Verify with World ID"}
        </motion.h1>
        <ConnectButton />
        
        {step === 0 ? (
          <form onSubmit={handleSubmit} className="space-y-6 mt-6">
            <motion.div variants={itemVariants}>
              <Label htmlFor="profilePictures" className="text-sm font-medium mb-2 block">
                Profile Pictures
              </Label>
              <div className="flex flex-wrap items-center gap-4">
                {profileData.profile_pictures.map((url, index) => (
                  <motion.div key={url} className="relative" variants={itemVariants}>
                    <img
                      src={url}
                      alt={`Profile ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg shadow-md"
                    />
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

            <motion.div 
              className="mt-6"
              variants={itemVariants}
            >
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Next: Verify with World ID"}
              </Button>
            </motion.div>
          </form>
        ) : (
          <motion.div 
            className="space-y-6 mt-6"
            variants={itemVariants}
          >
            <p className="text-lg">
              Your profile has been saved. Please complete the World ID verification to finalize your profile.
            </p>
            <WorldIDVerification onVerificationSuccess={handleWorldIDSuccess} />
            <Button onClick={() => setStep(0)} className="w-full mt-4">
              Back to Profile
            </Button>
          </motion.div>
        )}
      </div>
    </motion.main>
  );
};

export default ProfilePage;