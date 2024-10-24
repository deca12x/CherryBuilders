'use client'
import React, { useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { UserTag, UserType } from "@/lib/supabase/types";
import { supabase } from "@/lib/supabase/supabase-client";
import { RefreshCcw, Info } from "lucide-react";
import { uploadProfilePicture } from "@/lib/supabase/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

interface ProfileFormProps {
  initialData: UserType;
  onSubmit: (data: UserType) => Promise<void>;
  submitButtonText: string;
  showTalentScore?: boolean;
  jwt: string | null;
  showPrivacyInfo?: boolean;
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  submitButtonText,
  showTalentScore = false,
  jwt,
}) => {
  const [profileData, setProfileData] = useState<UserType>(initialData);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateTalentScoreLoading, setUpdateTalentScoreLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);

  const availableTags: UserTag[] = [
    "Frontend dev",
    "Backend dev",
    "Solidity dev",
    "Designer",
    "Talent scout",
    "Business dev",
  ];

  const handleChange = (field: keyof UserType, value: string | UserTag[] | string[] | boolean) => {
    setProfileData((prev) => ({ ...prev, [field]: value }));
  };

  const handleTagToggle = (tag: UserTag) => {
    const newTags = profileData.tags.includes(tag)
      ? profileData.tags.filter((t) => t !== tag)
      : [...profileData.tags, tag];
    handleChange("tags", newTags);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !profileData.evm_address) return;

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;

        const uploadedFile = await uploadProfilePicture(profileData.evm_address, fileName, file, jwt);
        if (!uploadedFile.success) throw Error(uploadedFile.error);

        const {
          data: { publicUrl },
        } = supabase.storage.from("profile-pictures").getPublicUrl(`${profileData.evm_address}/${fileName}`);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(profileData);
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

  const handleUpdateTalentScore = async (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setUpdateTalentScoreLoading(true);
    try {
      const response = await fetch("/api/talent", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${jwt}` },
        body: JSON.stringify({ address: profileData.evm_address }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch Talent Passport");
      }

      const passportScore: number = await response.json();
      handleChange("talent_score", passportScore.toString());
      toast({
        title: "Success",
        description: "Talent Score updated successfully.",
        variant: "default",
      });
    } catch (error) {
      console.error("Error updating Talent Score:", error);
      toast({
        title: "Error",
        description: "Failed to update Talent Score. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUpdateTalentScoreLoading(false);
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
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-6 mt-6"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
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
          required
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="email" className="text-sm font-medium mb-2 block">
          Email
        </Label>
        <Input
          id="email"
          type="email"
          value={profileData.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
          maxLength={255}
          placeholder="mymail@mail.com"
          className="w-full"
          required
        />
      </motion.div>

      {showTalentScore && (
        <motion.div className="flex items-center mt-6 gap-2" variants={itemVariants}>
          <Label className="text-md font-medium block items-center justify-center underline">
            <a
              href="https://talentprotocol.notion.site/Builder-Score-FAQ-4e07c8df13514ce79661ed0d776d4741"
              target="_blank"
              rel="noopener noreferrer"
            >
              Talent Score:
            </a>
          </Label>
          <span className="text-md mr-3 text-primary">{profileData.talent_score ?? "N/A"}</span>
          <button className="flex items-center hover:text-primary" onClick={handleUpdateTalentScore}>
            <RefreshCcw className={updateTalentScoreLoading ? "animate-reverse-spin" : ""} />
            <span className="text-xs ml-1">Update</span>
          </button>
        </motion.div>
      )}


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

      
      <motion.div variants={itemVariants} className="space-y-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="emailNotifications"
            checked={profileData.emailNotifications}
            onCheckedChange={(checked) => handleChange("emailNotifications", checked)}
          />
          <label htmlFor="emailNotifications" className="text-sm">
            I agree to receive essential notifications about matches and messages
            (required for core app functionality)
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="emailMarketing"
            checked={profileData.emailMarketing}
            onCheckedChange={(checked) => handleChange("emailMarketing", checked)}
          />
          <label htmlFor="emailMarketing" className="text-sm">
            I would like to receive marketing emails about new features and special offers
            (optional)
          </label>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <button
          type="button"
          onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
          className="text-sm text-muted-foreground flex items-center space-x-1"
        >
          <Info size={16} />
          <span>Privacy Policy Details</span>
        </button>

        {showPrivacyInfo && (
          <Alert className="mt-4">
            <AlertTitle>Privacy Policy</AlertTitle>
            <AlertDescription>
              <div className="space-y-2 text-sm">
                <p>We use your email address for:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Essential notifications about your matches and messages</li>
                  <li>Marketing communications (only if you opt-in)</li>
                </ul>
                <p>You can update your preferences at any time in account settings.</p>
                <p>We never share your email with third parties.</p>
                <p>For marketing emails, you can unsubscribe at any time via the link in the email footer.</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </motion.div>

      <motion.div className="mt-6" variants={itemVariants}>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitButtonText}
        </Button>
      </motion.div>
    </motion.form>
  );
};

export default ProfileForm;
