"use client";
import React, { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { EventType, UserTag, UserType } from "@/lib/supabase/types";
import { supabase } from "@/lib/supabase/supabase-client";
import { RefreshCcw, Info, CheckCircle2 } from "lucide-react";
import { uploadProfilePicture } from "@/lib/supabase/utils";
import { getActiveEvents } from "@/lib/supabase/utils";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { checkForBadWords } from "@/utils/language/badWordChecker";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface ProfileFormProps {
  initialData: UserType;
  onSubmit: (data: UserType, selectedEvents: string[]) => Promise<void>;
  submitButtonText: string;
  showTalentScore?: boolean;
  jwt: string | null;
  showPrivacyInfo?: boolean;
  userEvents?: EventType[];
  initialSelectedEvents: string[];
}

const ProfileForm: React.FC<ProfileFormProps> = ({
  initialData,
  onSubmit,
  submitButtonText,
  showTalentScore = false,
  jwt,
  userEvents,
  initialSelectedEvents = [],
}) => {
  const [profileData, setProfileData] = useState<UserType>(initialData);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [updateTalentScoreLoading, setUpdateTalentScoreLoading] =
    useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [showPrivacyInfo, setShowPrivacyInfo] = useState(false);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    initialSelectedEvents
  );
  const [activeEvents, setActiveEvents] = useState<EventType[]>([]);

  const availableTags: UserTag[] = [
    "Frontend dev",
    "Backend dev",
    "Smart contract dev",
    "Designer",
    "Talent scout",
    "Biz dev",
    "Artist",
    "Here for the lolz",
  ];

  useEffect(() => {
    setProfileData(initialData);
  }, [initialData]);

  useEffect(() => {
    setSelectedEvents(initialSelectedEvents);
  }, [initialSelectedEvents]);

  useEffect(() => {
    const fetchActiveEvents = async () => {
      if (!jwt) return;

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

  const handleChange = (
    field: keyof UserType,
    value: string | UserTag[] | string[] | boolean
  ) => {
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

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const invalidFiles = Array.from(files).filter(
      (file) => !allowedTypes.includes(file.type)
    );
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Only JPG, JPEG, PNG, or WEBP images are allowed.",
        variant: "destructive",
      });
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${Math.random()
          .toString(36)
          .substring(2, 15)}.${fileExt}`;

        const uploadedFile = await uploadProfilePicture(
          profileData.evm_address,
          fileName,
          file,
          jwt
        );
        if (!uploadedFile.success) throw Error(uploadedFile.error);

        const {
          data: { publicUrl },
        } = supabase.storage
          .from("profile-pictures")
          .getPublicUrl(`${profileData.evm_address}/${fileName}`);

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

  const handleEventToggle = (eventSlug: string) => {
    setSelectedEvents((prev) => {
      if (prev.includes(eventSlug)) {
        return prev.filter((slug) => slug !== eventSlug);
      } else {
        return [...prev, eventSlug];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      checkForBadWords(profileData.name) ||
      checkForBadWords(profileData.bio || "") ||
      checkForBadWords(profileData.building || "") ||
      checkForBadWords(profileData.looking_for || "")
    ) {
      toast({
        title: "🙈 Oops!",
        description: "Please keep it friendly - no bad words allowed!",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(profileData, selectedEvents);
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

  const handleUpdateTalentScore = async (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.preventDefault();
    setUpdateTalentScoreLoading(true);
    try {
      const response = await fetch("/api/talent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${jwt}`,
        },
        body: JSON.stringify({ address: profileData.evm_address }),
      });

      if (!response.ok) {
        if (response.status === 404) {
          toast({
            title: "Error",
            description: "No Talent Passport found for this address.",
            variant: "destructive",
          });
          return;
        }
        throw new Error("Failed to fetch Talent Score");
      }

      const data = await response.json();
      if (typeof data.score === "number") {
        handleChange("talent_score", data.score);
        toast({
          title: "Success",
          description: "Talent Score updated successfully.",
          variant: "default",
        });
      } else {
        throw new Error("Invalid score response");
      }
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

  const formatSocialLink = (
    value: string,
    platform: "github" | "twitter" | "farcaster"
  ) => {
    if (!value) return "";

    // Remove @ if present and trim whitespace
    let handle = value.trim();
    handle = handle.startsWith("@") ? handle.substring(1) : handle;

    // If it's already a full URL with http/https, return as is
    if (handle.startsWith("http")) return handle;

    // Extract handle from various URL formats and clean it
    if (platform === "github") {
      if (handle.includes("github.com/")) {
        handle = handle.split("github.com/").pop() || handle;
      }
      return `https://github.com/${handle}`;
    }

    if (platform === "twitter") {
      if (handle.includes("twitter.com/") || handle.includes("x.com/")) {
        handle = handle.split(/(?:twitter\.com\/|x\.com\/)/).pop() || handle;
      }
      return `https://twitter.com/${handle}`;
    }

    if (platform === "farcaster") {
      if (handle.includes("warpcast.com/")) {
        handle = handle.split("warpcast.com/").pop() || handle;
      }
      return `https://warpcast.com/${handle}`;
    }

    return value;
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
        <Label
          htmlFor="profilePictures"
          className="text-sm font-medium mb-2 block"
        >
          Profile Pictures
        </Label>
        <div className="flex flex-wrap items-center gap-4">
          {profileData.profile_pictures.map((url, index) => (
            <motion.div key={url} className="relative" variants={itemVariants}>
              <img
                src={url}
                alt={`Profile ${index + 1}`}
                className="user-image-set w-24 h-24 rounded-lg shadow-md"
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
          Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={profileData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          maxLength={20} // The max length is also checked in the backend
          required
          className="w-full"
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="bio" className="text-sm font-medium mb-2 block">
          Bio <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="bio"
          value={profileData.bio || ""}
          onChange={(e) => handleChange("bio", e.target.value)}
          className="w-full min-h-[50px]"
          maxLength={140}
          required
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="building" className="text-sm font-medium mb-2 block">
          What I'm building <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="building"
          value={profileData.building || ""}
          onChange={(e) => handleChange("building", e.target.value)}
          className="w-full min-h-[50px]"
          maxLength={140}
          required
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="looking_for" className="text-sm font-medium mb-2 block">
          Who I'm looking for <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="looking_for"
          value={profileData.looking_for || ""}
          onChange={(e) => handleChange("looking_for", e.target.value)}
          className="w-full min-h-[50px]"
          maxLength={140}
          required
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <Label htmlFor="email" className="text-sm font-medium mb-2 block">
          Email <span className="text-red-500">*</span>
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
        <motion.div
          className="flex items-center mt-6 gap-2"
          variants={itemVariants}
        >
          <Label className="text-md font-medium block items-center justify-center underline">
            <a
              href="https://talentprotocol.notion.site/Builder-Score-FAQ-4e07c8df13514ce79661ed0d776d4741"
              target="_blank"
              rel="noopener noreferrer"
            >
              Talent Score:
            </a>
          </Label>
          <span className="text-md mr-3 text-red">
            {profileData.talent_score ?? "N/A"}
          </span>
          <button
            className="flex items-center hover:text-red"
            onClick={handleUpdateTalentScore}
          >
            <RefreshCcw
              className={updateTalentScoreLoading ? "animate-reverse-spin" : ""}
            />
            <span className="text-xs ml-1">Update</span>
          </button>
        </motion.div>
      )}
      {/* {userEvents && userEvents.length > 0 ? (
        <motion.div
          className="flex flex-col items-start my-6"
          variants={itemVariants}
        >
          <Label htmlFor="tags" className="text-sm font-medium mb-2 block">
            Your events
          </Label>
          <div className="flex flex-wrap gap-2">
            {userEvents.map((event) => (
              <span
                key={event.slug}
                className="bg-gradient-to-r from-[#f5acac] to-[#8ec5d4] text-red-foreground px-2 py-1 rounded-full text-sm flex"
              >
                <CheckCircle2 className="mr-2 h-5 w-5" />
                <p className="font-bold">{event.name}</p>
              </span>
            ))}
          </div>
        </motion.div>
      ) : null} */}

      <motion.div variants={itemVariants}>
        <Label className="text-sm font-medium mb-2 block">What am I</Label>
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

      <motion.div variants={itemVariants}>
        <Label className="text-sm font-medium mb-2 block">I'm going to</Label>
        <div className="grid grid-cols-2 gap-2 text-white">
          {activeEvents.map((event) => (
            <div key={event.slug} className="flex items-center space-x-2">
              <Checkbox
                id={event.slug}
                checked={selectedEvents.includes(event.slug)}
                onCheckedChange={() => handleEventToggle(event.slug)}
              />
              <Label htmlFor={event.slug}>{event.name}</Label>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="space-y-4">
        <Input
          placeholder="GitHub"
          value={profileData.github_link || ""}
          onChange={(e) =>
            handleChange(
              "github_link",
              formatSocialLink(e.target.value, "github")
            )
          }
          maxLength={255}
        />
        <Input
          placeholder="X (Twitter)"
          value={profileData.twitter_link || ""}
          onChange={(e) =>
            handleChange(
              "twitter_link",
              formatSocialLink(e.target.value, "twitter")
            )
          }
          maxLength={255}
        />
        <Input
          placeholder="Farcaster"
          value={profileData.farcaster_link || ""}
          onChange={(e) =>
            handleChange(
              "farcaster_link",
              formatSocialLink(e.target.value, "farcaster")
            )
          }
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
            onCheckedChange={(checked) =>
              handleChange("emailNotifications", checked)
            }
          />
          <label htmlFor="emailNotifications" className="text-sm">
            Main functionality: I agree to receive emails when I get a match
          </label>
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="emailMarketing"
            checked={profileData.emailMarketing}
            onCheckedChange={(checked) =>
              handleChange("emailMarketing", checked)
            }
          />
          <label htmlFor="emailMarketing" className="text-sm">
            Optional: I want to receive emails about hackathons
          </label>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <button
          type="button"
          onClick={() => setShowPrivacyInfo(!showPrivacyInfo)}
          className="text-sm text-grey-foreground flex items-center space-x-1"
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
                  <li>
                    Essential notifications about your matches and messages
                  </li>
                  <li>Info on relevant future events (only if you opt-in)</li>
                </ul>
                <p>You can unsubscribe from both checkboxes at any time</p>
                <p>We never share your email with third parties.</p>
              </div>
            </AlertDescription>
          </Alert>
        )}
      </motion.div>

      <motion.div variants={itemVariants}>
        <Accordion type="single" collapsible>
          <AccordionItem value="data-storage">
            <AccordionTrigger>Data Storage Disclaimer</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2 text-sm text-grey-foreground">
                <p>
                  By using this app, you agree to the storage of certain
                  personal data, including:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Chat messages exchanged within the app</li>
                  <li>Profile information that you provide</li>
                  <li>Data related to matches made on the platform</li>
                </ul>
                <p className="mt-2">
                  We prioritize your privacy and handle your data securely.
                </p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
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
