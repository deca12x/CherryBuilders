"use client";

import React from "react";
import { IDKitWidget, VerificationLevel, ISuccessResult } from "@worldcoin/idkit";
import { useAccount } from "wagmi";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { updateUser } from "@/lib/supabase/utils";

const WorldIDVerification: React.FC<{ onVerificationSuccess: () => void; redirect: boolean }> = ({
  onVerificationSuccess,
  redirect,
}) => {
  const { address } = useAccount();
  const { toast } = useToast();

  const router = useRouter();

  const handleVerify = async (proof: ISuccessResult) => {
    if (!address) {
      console.error("No EVM address available");
      toast({
        title: "Error",
        description: "No EVM address available. Please connect your wallet.",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateVerificationStatus(address, true);
      console.log("Verification status updated successfully");
      toast({
        title: "Verification Successful",
        description: "Your World ID verification has been successfully recorded.",
        variant: "default",
      });
      onVerificationSuccess();
    } catch (error) {
      console.error("Failed to update verification status:", error);
      toast({
        title: "Verification Failed",
        description: "An error occurred while updating your verification status.",
        variant: "destructive",
      });
    }
  };

  async function updateVerificationStatus(address: string, isVerified: boolean): Promise<void> {
    try {
      const updatedUser = await updateUser(address, { verified: isVerified });
      if (redirect) {
        router.push("/matching");
      }
      if (!updatedUser.success) throw Error(updatedUser.error);

      console.log("Verification status updated successfully");
    } catch (error) {
      console.error("Error updating verification status:", error);
      throw error;
    }
  }

  const onSuccess = () => {
    console.log("World ID verification successful");
  };

  return (
    <IDKitWidget
      app_id="app_staging_7d26c50ddab0158cffc489820fa335fd"
      action="sign-in-with-world-id"
      onSuccess={onSuccess}
      handleVerify={handleVerify}
      verification_level={VerificationLevel.Device}
    >
      {({ open }) => (
        <Button onClick={open} className="rounded-2xl bg-white text-black hover:bg-slate-300">
          Verify with World ID
        </Button>
      )}
    </IDKitWidget>
  );
};

export default WorldIDVerification;
