interface PoapEvent {
  id: number;
  fancy_id: string;
  name: string;
  event_url: string;
  image_url: string;
  country: string;
  city: string;
  description: string;
  year: number;
  start_date: string;
  end_date: string;
  expiry_date: string;
  supply: number;
}

export interface PoapItem {
  event: PoapEvent;
  tokenId: string;
  owner: string;
  chain: string;
  created: string;
}

/**
 * Fetches POAPs for a given wallet address from the POAP API
 * @param address - Wallet address to fetch POAPs for
 * @returns Array of POAP items or empty array if none found or error occurs
 */
export const getUserPoaps = async (address: string): Promise<PoapItem[]> => {
  try {
    const apiKey = process.env.POAP_API_KEY;
    const authToken = process.env.POAP_AUTH_TOKEN;

    if (!apiKey || !authToken) {
      console.error("POAP API credentials not configured");
      return [];
    }

    const response = await fetch(
      `https://api.poap.tech/actions/scan/${address}`,
      {
        headers: {
          "x-api-key": apiKey,
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      console.error(
        `POAP API returned ${response.status}: ${response.statusText}`
      );
      return [];
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching POAPs:", error);
    return [];
  }
};

/**
 * Returns the POAP collector URL for a given wallet address
 * @param address - Wallet address
 * @returns POAP collector URL
 */
export const getPoapCollectorUrl = (address: string): string => {
  return `https://collectors.poap.xyz/scan/${address}`;
};
