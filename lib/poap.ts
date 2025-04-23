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
  console.log("40poap: getUserPoaps called with address:", address);

  try {
    const apiKey = process.env.POAP_API_KEY;
    console.log("41poap: POAP API key exists:", !!apiKey);
    console.log("42poap: POAP API key length:", apiKey?.length || 0);

    if (!apiKey) {
      console.error("43poap: POAP API credentials not configured");
      return [];
    }

    console.log("44poap: Making request to POAP API for address:", address);
    const response = await fetch(
      `https://api.poap.tech/actions/scan/${address}`,
      {
        headers: {
          "x-api-key": apiKey,
          "Content-Type": "application/json",
        },
      }
    );

    console.log("45poap: POAP API response status:", response.status);

    if (!response.ok) {
      console.error(
        `46poap: POAP API returned ${response.status}: ${response.statusText}`
      );
      return [];
    }

    const data = await response.json();
    console.log(
      "47poap: POAP API returned data count:",
      Array.isArray(data) ? data.length : "not an array"
    );
    return data;
  } catch (error) {
    console.error("48poap: Error fetching POAPs:", error);
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
