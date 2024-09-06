"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

type Tag = "Javascript" | "Typescript" | "React" | "Solidity";

interface Link {
  url: string;
  platform: string;
}

const ProfilePage: React.FC = () => {
  const { address } = useAccount();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [tags, setTags] = useState<Tag[]>([]);
  const [links, setLinks] = useState<Link[]>([{ url: "", platform: "" }]);
  const [newLink, setNewLink] = useState({ url: "", platform: "" });
  const [customAddress, setCustomAddress] = useState("");

  const availableTags: Tag[] = [
    "Javascript",
    "Typescript",
    "React",
    "Solidity",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log({ name, bio, tags, links, address: customAddress || address });
  };

  const handleTagToggle = (tag: Tag) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addLink = () => {
    if (links.length < 10) {
      setLinks((prev) => [...prev, { url: "", platform: "" }]);
    }
  };

  const updateLink = (
    index: number,
    field: "url" | "platform",
    value: string
  ) => {
    setLinks((prev) =>
      prev.map((link, i) => (i === index ? { ...link, [field]: value } : link))
    );
  };

  return (
    <main className="flex flex-col min-h-screen bg-background">
      <div className="flex-1 p-4">
        <h1 className="text-2xl font-bold text-primary mb-4">
          Create Your Profile
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={50}
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
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              maxLength={250}
              required
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
                    checked={tags.includes(tag)}
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
            <Label className="text-sm font-medium">Links</Label>
            <div className="mt-1 space-y-2">
              {links.map((link, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    placeholder="Platform"
                    value={link.platform}
                    onChange={(e) =>
                      updateLink(index, "platform", e.target.value)
                    }
                  />
                  <Input
                    placeholder="URL"
                    value={link.url}
                    onChange={(e) => updateLink(index, "url", e.target.value)}
                  />
                </div>
              ))}
              {links.length < 10 && (
                <Button
                  type="button"
                  onClick={addLink}
                  className="mt-2 p-2 h-auto"
                  variant="outline"
                >
                  +
                </Button>
              )}
            </div>
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
