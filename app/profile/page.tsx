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
import Image from "next/image";
 
type Tag = "frontend dev" | "backend dev" | "solidity dev" | "ui/ux dev";
 
interface ProfilePicture {
  file: File;
  preview: string;
}
 
interface ProfileData {
  name: string;
  bio: string | null;
  tags: Tag[];
  github_link: string | null;
  twitter_link: string | null;
  farcaster_link: string | null;
  other_link: string | null;
  profile_pictures: ProfilePicture[];
 
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
    "ui/ux dev",
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
 
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages: ProfilePicture[] = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setProfileData((prev) => ({
        ...prev,
        profile_pictures: [...prev.profile_pictures, ...newImages],
      }));
    }
  };
 
  const removeImage = (index: number) => {
    setProfileData((prev) => ({
      ...prev,
      profile_pictures: prev.profile_pictures.filter((_, i) => i !== index),
    }));
  };
 
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address) {
      console.error("No EVM address available");
      return;
    }
 
    try {
      const uploadedImageUrls = await uploadImages(
        profileData.profile_pictures
      );
      const updatedProfileData = {
        ...profileData,
        profile_pictures: uploadedImageUrls,
      };
      await updateProfileData(address, updatedProfileData);
      console.log("Profile saved successfully");
      // TODO: Show success message to user
    } catch (error) {
      console.error("Error saving profile:", error);
      // TODO: Show error message to user
    }
  };
 
  async function uploadImages(images: ProfilePicture[]): Promise<string[]> {
    const uploadPromises = images.map(async (image) => {
      const fileName = `${address}/${Date.now()}-${image.file.name}`;
      const { data, error } = await supabase.storage
        .from("profile-pictures")
        .upload(fileName, image.file);
 
      if (error) throw error;
 
      const { data: urlData } = supabase.storage
        .from("profile-pictures")
        .getPublicUrl(fileName);
 
      return urlData.publicUrl;
    });
 
    return Promise.all(uploadPromises);
  }
 
  async function updateProfileData(
    address: string,
    profileData: Omit<ProfileData, "profile_pictures"> & {
      profile_pictures: string[];
    }
  ): Promise<void> {
    try {
      const { error } = await supabase.from("user_data").upsert(
        {
          evm_address: address,
          name: profileData.name,
          bio: profileData.bio,
          tags: profileData.tags,
          github_link: profileData.github_link,
          twitter_link: profileData.twitter_link,
          farcaster_link: profileData.farcaster_link,
          other_link: profileData.other_link,
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
 
  return (
    <main className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold text-primary mb-4">
          Create Your Profile
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label className="text-sm font-medium">Profile Pictures</Label>
            <div className="mt-1 flex flex-wrap gap-2">
              {profileData.profile_pictures.map((image, index) => (
                <div key={index} className="relative">
                  <Image
                    src={image.preview}
                    alt={`Profile picture ${index + 1}`}
                    width={100}
                    height={100}
                    className="object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                  >
                    X
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-400"
              >
                +
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                multiple
                className="hidden"
              />
            </div>
          </div>
 
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              value={profileData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              maxLength={255}
              required
              className="mt-1"
            />
          </div>
 
          <div>
            <Label htmlFor="bio" className="text-sm font-medium">
              Bio
            </Label>
            <Textarea
              id="bio"
              value={profileData.bio || ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              className="mt-1"
            />
          </div>
 
          <div>
            <Label className="text-sm font-medium">Tags</Label>
            <div className="mt-1 space-y-2">
              {availableTags.map((tag) => (
                <div key={tag} className="flex items-center">
                  <Checkbox
                    id={tag}
                    checked={profileData.tags.includes(tag)}
                    onCheckedChange={() => handleTagToggle(tag)}
                  />
                  <label htmlFor={tag} className="ml-2 text-sm">
                    {tag}
                  </label>
                </div>
              ))}
            </div>
          </div>
 
          <div>
            <Input
              placeholder="GitHub"
              value={profileData.github_link || ""}
              onChange={(e) => handleChange("github_link", e.target.value)}
              maxLength={255}
              className="mt-1"
            />
          </div>
 
          <div>
            <Input
              placeholder="X (Twitter)"
              value={profileData.twitter_link || ""}
              onChange={(e) => handleChange("twitter_link", e.target.value)}
              maxLength={255}
              className="mt-1"
            />
          </div>
 
          <div>
            <Input
              placeholder="Farcaster"
              value={profileData.farcaster_link || ""}
              onChange={(e) => handleChange("farcaster_link", e.target.value)}
              maxLength={255}
              className="mt-1"
            />
          </div>
 
          <div>
            <Input
              placeholder="Other link"
              value={profileData.other_link || ""}
              onChange={(e) => handleChange("other_link", e.target.value)}
              maxLength={255}
              className="mt-1"
            />
          </div>
 
          <div>
            <Label className="text-sm font-medium">
              Verification (Optional)
            </Label>
            <WorldIDVerification />
          </div>
        </form>
      </div>
      <div className="p-4">
        <Button type="submit" className="w-full" onClick={handleSubmit}>
          Save Profile
        </Button>
      </div>
    </main>
  );
};
 
export default ProfilePage;