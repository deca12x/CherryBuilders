import { Link } from "lucide-react";
import UserEvents from "../matching/UserEvents";
import { UserType } from "@/lib/supabase/types";
import Image from "next/image";
import { Avatar, AvatarImage } from "../ui/avatar";
import UserTags from "../matching/UserTags";

interface ContactProfileCardProps {
  user: UserType;
}

export default function ContactProfileCard({ user }: ContactProfileCardProps) {
  return (
    <div className="flex flex-col items-center min-w-full w-full space-y-4 pb-10">
      <Avatar className="h-28 w-28">
        <AvatarImage
          src={user.profile_pictures.length > 0 ? user.profile_pictures[0] : "/images/default_propic.jpeg"}
          alt="Other Users Propic"
        />
      </Avatar>
      <div className="flex flex-col justify-center items-center gap-1 mb-5">
        <h3 className="text-2xl font-semibold">{user.name}</h3>
        <div className="text-sm text-muted-foreground">{user.evm_address}</div>
        <UserTags user={user} />
      </div>
      <div className="flex flex-col w-full gap-3">
        {/* Bio */}
        <div className="flex flex-col gap-2 bg-card rounded-xl p-3">
          <p className="font-bold text-foreground">Who am I?</p>
          <p className="text-muted-foreground">{user.bio}</p>
        </div>

        {/* Events */}
        {user.events && user.events.length > 0 && (
          <div className="flex flex-col gap-2 bg-card rounded-xl p-3">
            <p className="font-bold text-foreground">You can find me at</p>
            <UserEvents user={user} />
          </div>
        )}

        {/* Talent score */}
        {user.talent_score && user.talent_score > 0 ? (
          <div className="flex flex-col items-center bg-card rounded-xl p-3">
            <p className="font-bold text-foreground">Talent Score</p>
            <p className="text-muted-foreground">{user.talent_score}</p>
          </div>
        ) : null}

        {/* Links */}
        {(user.twitter_link || user.github_link || user.farcaster_link || user.other_link) && (
          <div className="flex flex-col gap-3 bg-card rounded-xl p-3">
            <p className="font-bold text-foreground">Links</p>
            <div className="grid grid-cols-2 gap-4 sm:px-14">
              {user.github_link && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Image height={26} width={26} src="/images/github.png" alt="github logo" />
                  <a href={user.github_link} target="_blank" className="text-muted-foreground hover:underline">
                    Github
                  </a>
                </p>
              )}
              {user.twitter_link && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Image height={20} width={20} src="/images/x_logo.svg" alt="x logo" />
                  <a href={user.twitter_link} target="_blank" className="text-muted-foreground hover:underline">
                    Twitter
                  </a>
                </p>
              )}
              {user.farcaster_link && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Image height={23} width={23} src="/images/farcaster.svg" alt="farcaster logo" />
                  <a href={user.farcaster_link} target="_blank" className="text-muted-foreground hover:underline">
                    Farcaster
                  </a>
                </p>
              )}
              {user.other_link && (
                <p className="text-muted-foreground flex items-center gap-2">
                  <Link size={24} />
                  <a href={user.other_link} target="_blank" className="text-muted-foreground hover:underline">
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
