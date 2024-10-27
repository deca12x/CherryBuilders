import React from "react";
import { Filter, Link } from "lucide-react";
import { UserType } from "@/lib/supabase/types";
import Image from "next/image";

interface ProfileCardContentProps {
  user: UserType;
}

const ProfileCardContent: React.FC<ProfileCardContentProps> = ({ user }) => {
  return (
    <div className="flex flex-col p-4 gap-3">
      {/* Stats */}
      <div className="w-full gap-3">
        {/* Talent score */}
        <div className="flex flex-col items-center bg-card rounded-xl p-3">
          <p className="font-bold text-foreground">Talent Score</p>
          <p className="text-muted-foreground">{user.talent_score ?? "N/A"}</p>
        </div>
      </div>

      {/* Bio */}
      <div className="flex flex-col gap-2 bg-card rounded-xl p-3">
        <p className="font-bold text-foreground">Who am I?</p>
        <p className="text-muted-foreground">{user.bio}</p>
      </div>

      {/* Links */}
      {(user.twitter_link ||
        user.github_link ||
        user.farcaster_link ||
        user.other_link) && (
        <div className="flex flex-col gap-3 bg-card rounded-xl p-3">
          <p className="font-bold text-foreground">Links</p>
          <div className="grid grid-cols-2 gap-4 sm:px-14">
            {user.github_link && (
              <p className="text-muted-foreground flex items-center gap-2">
                <Image
                  height={26}
                  width={26}
                  src="/images/github.png"
                  alt="github logo"
                />
                <a
                  href={user.github_link}
                  target="_blank"
                  className="text-muted-foreground hover:underline"
                >
                  Github
                </a>
              </p>
            )}
            {user.twitter_link && (
              <p className="text-muted-foreground flex items-center gap-2">
                <Image
                  height={20}
                  width={20}
                  src="/images/x_logo.svg"
                  alt="x logo"
                />
                <a
                  href={user.twitter_link}
                  target="_blank"
                  className="text-muted-foreground hover:underline"
                >
                  Twitter
                </a>
              </p>
            )}
            {user.farcaster_link && (
              <p className="text-muted-foreground flex items-center gap-2">
                <Image
                  height={23}
                  width={23}
                  src="/images/farcaster.svg"
                  alt="farcaster logo"
                />
                <a
                  href={user.farcaster_link}
                  target="_blank"
                  className="text-muted-foreground hover:underline"
                >
                  Farcaster
                </a>
              </p>
            )}
            {user.other_link && (
              <p className="text-muted-foreground flex items-center gap-2">
                <Link size={24} />
                <a
                  href={user.other_link}
                  target="_blank"
                  className="text-muted-foreground hover:underline"
                >
                  Other
                </a>
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileCardContent;
