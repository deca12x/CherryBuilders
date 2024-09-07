"use client";

import React, { useRef, useState } from "react";
import { useAccount } from "wagmi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import WorldIDVerification from "@/components/verify";
import { createClient } from "@supabase/supabase-js";
import { motion } from 'framer-motion'
import { ConnectButton } from "@rainbow-me/rainbowkit";
type Tag = "frontend dev" | "backend dev" | "solidity dev" | "ui/ux";

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
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_ANON_KEY as string
  );
  const { address } = useAccount();
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const availableTags: Tag[] = [
    "frontend dev",
    "backend dev",
    "solidity dev",
    "ui/ux",
  ];

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
    if (!files || files.length === 0) return;

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
    } catch (error) {
      console.error("Error uploading images:", error);
      // TODO: Show error message to user
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
      console.error("No EVM address available");
      return;
    }

    try {
      await updateProfileData(address, profileData);
      console.log("Profile saved successfully");
      // TODO: Show success message to user
    } catch (error) {
      console.error("Error saving profile:", error);
      // TODO: Show error message to user
    }
  };

  async function updateProfileData(
    address: string,
    profileData: ProfileData
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("user_data")
        .upsert(
          {
            evm_address: address,
            name: profileData.name,
            bio: profileData.bio || null,
            tags: profileData.tags,
            github_link: profileData.github_link || null,
            twitter_link: profileData.twitter_link || null,
            farcaster_link: profileData.farcaster_link || null,
            other_link: profileData.other_link || null,
            profile_pictures: profileData.profile_pictures,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "evm_address",
          }
        );

      if (error) throw error;

      console.log("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1
    }
  }

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
          Create Your Profile
        </motion.h1>
        <ConnectButton />
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <motion.div variants={itemVariants}>
            <Label className="text-sm font-medium mb-2 block">
              Verification (Optional)
            </Label>
            <WorldIDVerification />
          </motion.div>
        </form>
      </div>
      <motion.div 
        className="p-6 md:p-8 max-w-3xl mx-auto w-full"
        variants={itemVariants}
      >
        <Button type="submit" className="w-full" onClick={handleSubmit}>
          Save Profile
        </Button>
      </motion.div>
    </motion.main>
  )
};

export default ProfilePage;