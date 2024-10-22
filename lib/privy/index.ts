import { User, PrivyClient } from "@privy-io/server-auth";

if (!process.env.NEXT_PUBLIC_PRIVY_APP_ID) {
  throw new Error("Please provide your Privy App ID");
}

if (!process.env.PRIVY_APP_SECRET) {
  throw new Error("Please provide your Privy App Secret");
}

const privy = new PrivyClient(process.env.NEXT_PUBLIC_PRIVY_APP_ID, process.env.PRIVY_APP_SECRET!);

export const verifyAuthToken = async (
  authToken: string
): Promise<{
  user?: User;
  isValid: boolean;
}> => {
  let retries = 0;

  while (retries < 5) {
    try {
      const verifiedClaims = await privy.verifyAuthToken(authToken);
      const user = await privy.getUserById(verifiedClaims.userId);
      return {
        isValid: true,
        user,
      };
    } catch (error: any) {
      console.log(`\nError verifying token at try #${retries + 1}: ${error.message}\n`);
      // wait for 1.5 seconds before retrying
      await new Promise((resolve) => setTimeout(resolve, 1500));
      retries++;
    }
  }
  // If this doesn't work after 5 retries, return that the token is invalid
  return {
    isValid: false,
  };
};
