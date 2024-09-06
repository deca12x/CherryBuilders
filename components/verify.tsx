'use client' // for Next.js app router
import React from 'react';
import { IDKitWidget, VerificationLevel, ISuccessResult } from '@worldcoin/idkit'

const WorldIDVerification: React.FC = () => {
	const handleVerify = async (proof: ISuccessResult) => {

        console.log('proof :', proof)
		const res = await fetch("/api/verify", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify(proof),
		})
		if (!res.ok) {
			throw new Error("Verification failed.");
		}
        console.log(res);
	}

	const onSuccess = () => {
		console.log('SUCCESS')
		// Perform actions after modal is closed (e.g., redirect user)
	};

	return (
		<IDKitWidget
			app_id="app_staging_7d26c50ddab0158cffc489820fa335fd"
			action="sign-in-with-world-id"
			onSuccess={onSuccess}
			handleVerify={handleVerify}
			verification_level={VerificationLevel.Device}
		>
			{({ open }) => 
				<button onClick={open}>Verify with World ID</button>
			}
		</IDKitWidget>
	);
}

export default WorldIDVerification;
