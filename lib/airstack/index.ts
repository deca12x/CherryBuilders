import { fetchQuery, init } from "@airstack/node";
import { ProfileQuery } from "./types";
import { profileQuery } from "./queries";

if (!process.env.AIRSTACK_API_KEY) {
  throw new Error("AIRSTACK_API_KEY is missing");
}

init(process.env.AIRSTACK_API_KEY!);

interface ProfileQueryResponse {
  data: ProfileQuery | null;
  error: { message: string } | null;
}

/**
 * A function to fetch the farcaster profile of a user, given their addresss
 * @param address - The address of the user whose profile is to be fetched
 * @returns The profile of the user, if it exists, otherwise null
 */
export const fetchFarcasterProfile = async (address: string): Promise<ProfileQuery | null> => {
  const { data, error }: ProfileQueryResponse = await fetchQuery(profileQuery, {
    address,
  });
  if (error || !data || !data.Socials || !data.Socials.Social || data.Socials.Social.length === 0) {
    return null;
  }
  return data;
};
