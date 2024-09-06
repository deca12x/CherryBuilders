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
  const [links, setLinks] = useState<Link[]>([]);
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
    if (newLink.url && newLink.platform) {
      setLinks((prev) => [...prev, newLink]);
      setNewLink({ url: "", platform: "" });
    }
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
                  <span>{link.platform}:</span>
                  <span>{link.url}</span>
                </div>
              ))}
              <div className="flex items-center space-x-2">
                <Input
                  placeholder="Platform"
                  value={newLink.platform}
                  onChange={(e) =>
                    setNewLink((prev) => ({
                      ...prev,
                      platform: e.target.value,
                    }))
                  }
                />
                <Input
                  placeholder="URL"
                  value={newLink.url}
                  onChange={(e) =>
                    setNewLink((prev) => ({ ...prev, url: e.target.value }))
                  }
                />
                <Button type="button" onClick={addLink}>
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="evmAddress" className="text-sm font-medium">
              EVM Address
            </Label>
            <Input
              id="evmAddress"
              value={customAddress || address || ""}
              onChange={(e) => setCustomAddress(e.target.value)}
              placeholder="Enter EVM address"
              className="mt-1"
            />
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
