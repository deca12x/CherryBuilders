"use client";
import React, { useState, useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/supabase/utils";
import LoadingSpinner from "@/components/ui/loading-spinner";
import ErrorCard from "@/components/ui/error-card";
import ProfileEditParent from "@/components/profile/ProfileEditParent";
import BottomNavigationBar from "@/components/navbar/BottomNavigationBar";
import { UserType } from "@/lib/supabase/types";

const ProfilePage: React.FC = () => {
  const { user, ready, getAccessToken } = usePrivy();
  const [profileData, setProfileData] = useState<UserType | null>(null);
  const [jwt, setJwt] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      if (!ready) return;

      if (!user || !user.wallet?.address) {
        router.push("/");
        return;
      }

      const token = await getAccessToken();
      setJwt(token);

      const { success, data, error } = await getUser(user.wallet.address, token);

      if (!success && error) {
        setError(true);
      } else if (!data) {
        router.push("/profile/creation");
      } else {
        setProfileData(data as UserType);
      }
      setLoading(false);
    };

    checkUser();
  }, [user, ready, router]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <ErrorCard />;
  }

  if (!profileData || !user?.wallet?.address || !jwt) {
    return null;
  }

  return (
    <>
      <main className="flex flex-col min-h-screen bg-background pb-16">
        <ProfileEditParent
          initialProfileData={profileData}
          jwt={jwt}
          userAddress={user.wallet.address}
        />
      </main>
      <BottomNavigationBar />
    </>
  );
};

export default ProfilePage;
