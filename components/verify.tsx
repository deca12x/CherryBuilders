"use client"; // for Next.js app router
import React, { useEffect } from "react";
import {
  IDKitWidget,
  VerificationLevel,
  ISuccessResult,
} from "@worldcoin/idkit";
import { useAccount } from "wagmi";
import { createClient } from "@supabase/supabase-js";
import { Button } from "./ui/button";

const WorldIDVerification: React.FC = () => {
  const { address } = useAccount();
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL as string,
    process.env.NEXT_PUBLIC_ANON_KEY as string
  );

  useEffect(() => {
    console.log("address", address);
  }, [address]);

  const handleVerify = async (proof: ISuccessResult) => {
    if (!address) {
      console.error("No EVM address available");
      return;
    }

    try {
      await updateVerificationStatus(address, true);
      console.log("Verification status updated successfully");
    } catch (error) {
      console.error("Failed to update verification status:", error);
    }
  };

  async function updateVerificationStatus(
    address: string,
    isVerified: boolean
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from("profiles") // Adjust this to match your table name
        .upsert(
          {
            evm_address: address,
            is_world_id_verified: isVerified,
            updated_at: new Date().toISOString(),
          },
          {
            onConflict: "evm_address",
          }
        );

      if (error) throw error;

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
      {({ open }) => <Button onClick={open} className="rounded-2xl bg-white text-black hover:bg-slate-300">Verify with World ID</Button>}
    </IDKitWidget>
  );
};

export default WorldIDVerification;
