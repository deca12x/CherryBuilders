import { Link, Copy, CheckCircle } from "lucide-react";
import UserEvents from "../matching/UserEvents";
import { UserTag, UserType } from "@/lib/supabase/types";
import Image from "next/image";
import { Avatar, AvatarImage } from "../ui/avatar";
import { shortenAddress } from "@/lib/utils";
import { useState, useEffect } from "react";

interface ContactProfileCardProps {
  user: UserType;
}

export default function ContactProfileCard({ user }: ContactProfileCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy: () => void = () => {
    navigator.clipboard.writeText(user.evm_address);
    setCopied(true);
  };

  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  return (
    <div className="flex flex-col items-center min-w-full w-full space-y-4 pb-10">
      <Avatar className="h-28 w-28">
        <AvatarImage
          src={
            user.profile_pictures.length > 0
              ? user.profile_pictures[0]
              : "/images/default_propic.jpeg"
          }
          alt="Other Users Propic"
        />
      </Avatar>
      <div className="flex flex-col justify-center items-center gap-1 mb-5">
        <h3 className="text-2xl font-semibold">{user.name}</h3>
        <div className="flex justify-center items-center gap-2 text-sm text-grey-foreground">
          <label>{shortenAddress(user.evm_address)}</label>
          <button onClick={handleCopy} className="focus:outline-none">
            {copied ? <CheckCircle size={15} /> : <Copy size={15} />}
          </button>
        </div>
        <div className="flex flex-wrap justify-center gap-1.5">
          {user.tags.map((tag: UserTag, index: number) => (
            <div
              key={index}
              className="flex text-nowrap bg-dark-grey text-dark-grey-foreground px-2 py-1 rounded-full text-sm"
            >
              {tag.charAt(0).toUpperCase() + tag.slice(1)}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col w-full gap-3">
        {/* Bio */}
        <div className="flex flex-col gap-2 bg-card rounded-xl p-3">
          <p className="font-bold text-white">Who am I?</p>
          <p className="text-grey-foreground break-words text-wrap">
            {user.bio}
          </p>
        </div>

        {/* Events */}
        {user.events && user.events.length > 0 && (
          <div className="flex flex-col gap-2 bg-card rounded-xl p-3">
            <p className="font-bold text-white">You can find me at</p>
            <UserEvents user={user} />
          </div>
        )}

        {/* Talent score */}
        {user.talent_score && user.talent_score > 0 ? (
          <div className="flex flex-col items-center bg-card rounded-xl p-3">
            <p className="font-bold text-white">Talent Score</p>
            <p className="text-grey-foreground">{user.talent_score}</p>
          </div>
        ) : null}

        {/* Links */}
        {(user.twitter_link ||
          user.github_link ||
          user.farcaster_link ||
          user.other_link) && (
          <div className="flex flex-col gap-3 bg-card rounded-xl p-3">
            <p className="font-bold text-white">Links</p>
            <div className="grid grid-cols-2 gap-4 sm:px-14">
              {user.github_link && (
                <p className="text-grey-foreground flex items-center gap-2">
                  <Image
                    height={26}
                    width={26}
                    src="/images/github.png"
                    alt="github logo"
                  />
                  <a
                    href={user.github_link}
                    target="_blank"
                    className="text-grey-foreground hover:underline"
                  >
                    Github
                  </a>
                </p>
              )}
              {user.twitter_link && (
                <p className="text-grey-foreground flex items-center gap-2">
                  <Image
                    height={20}
                    width={20}
                    src="/images/x_logo.svg"
                    alt="x logo"
                  />
                  <a
                    href={user.twitter_link}
                    target="_blank"
                    className="text-grey-foreground hover:underline"
                  >
                    Twitter
                  </a>
                </p>
              )}
              {user.farcaster_link && (
                <p className="text-grey-foreground flex items-center gap-2">
                  <Image
                    height={23}
                    width={23}
                    src="/images/farcaster.svg"
                    alt="farcaster logo"
                  />
                  <a
                    href={user.farcaster_link}
                    target="_blank"
                    className="text-grey-foreground hover:underline"
                  >
                    Farcaster
                  </a>
                </p>
              )}
              {user.other_link && (
                <p className="text-grey-foreground flex items-center gap-2">
                  <Link size={24} />
                  <a
                    href={user.other_link}
                    target="_blank"
                    className="text-grey-foreground hover:underline"
                  >
                    Other
                  </a>
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
