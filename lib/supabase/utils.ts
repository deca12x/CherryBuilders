import { supabase } from ".";
import { UserData } from "./types";

/**
 * Check if a specific user is in the database
 * @param address The address of the user
 * @returns An object {data: any | null, error: boolean}
 **/
export const isUserInDatabase = async (address: string): Promise<{ data: any | null; error: boolean }> => {
  try {
    const { data, error } = await supabase.from("user_data").select("*").eq("evm_address", address).single();

    if (error) {
      // Check if the error is due to no rows found
      if (error.code === "PGRST116") {
        return {
          data: null,
          error: false,
        };
      }
      throw error;
    }

    return {
      data,
      error: false,
    };
  } catch (error) {
    console.error("Error checking address:", error);
    return {
      data: null,
      error: true,
    };
  }
};

export const fetchUserData = async (address: string): Promise<UserData | null> => {
  const { data, error } = await supabase
    .from("user_data")
    .select("name, profile_pictures")
    .eq("evm_address", address)
    .single();

  if (error) {
    console.error("Error fetching user data:", error);
    return null;
  }

  return data;
};

/**
 * A utility function to update a match inside the database
 * @param user_1_address - The address of the first user of the match
 * @param user_2_address - The address of the second user of the match
 * @param value - The boolean value that must be set in the database record
 * @returns An object representing the response { success: boolean; data: any | null; error: string | undefined }
 */
export const updateMatch = async (
  user_1_address: string,
  user_2_address: string,
  value: boolean
): Promise<{ success: boolean; data: any | null; error: string | undefined }> => {
  const response = await fetch("/api/matches", {
    method: "PUT",
    headers: {
      Authorization: `Bearer jwt`, // TODO: add the correct jwt
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_1_address,
      user_2_address,
      value,
    }),
  });

  const responseJson = await response.json();

  if (!responseJson.ok)
    return {
      success: false,
      data: null,
      error: responseJson.error,
    };

  return {
    success: true,
    data: null,
    error: undefined,
  };
};

/**
 * A utility function to create a new match inside the database
 * @param user_1_address - The address of the first user of the match
 * @param user_2_address - The address of the second user of the match
 * @returns An object representing the response { success: boolean; data: any | null; error: string | undefined }
 */
export const createMatch = async (
  user_1_address: string,
  user_2_address: string
): Promise<{ success: boolean; data: any | null; error: string | undefined }> => {
  const response = await fetch("/api/matches", {
    method: "POST",
    headers: {
      Authorization: `Bearer jwt`, // TODO: add the correct jwt
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_1_address,
      user_2_address,
    }),
  });

  const responseJson = await response.json();

  if (!responseJson.ok)
    return {
      success: false,
      data: null,
      error: responseJson.error,
    };

  return {
    success: true,
    data: null,
    error: undefined,
  };
};

/**
 * A utility function to create a new chat inside the database
 * @param user_1_address - The address of the first user of the chat
 * @param user_2_address - The address of the second user of the chat
 * @returns An object representing the response { success: boolean; data: any | null; error: string | undefined }
 */
export const createChat = async (
  user_1_address: string,
  user_2_address: string
): Promise<{ success: boolean; data: any | null; error: string | undefined }> => {
  const response = await fetch("/api/chats", {
    method: "POST",
    headers: {
      Authorization: `Bearer jwt`, // TODO: add the correct jwt
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_1_address,
      user_2_address,
    }),
  });

  const responseJson = await response.json();

  if (!responseJson.ok)
    return {
      success: false,
      data: null,
      error: responseJson.error,
    };

  return {
    success: true,
    data: null,
    error: undefined,
  };
};

/**
 * A utility function to get a specific chat from the database
 * @param user_1_address - The address of the first user of the chat
 * @param user_2_address - The address of the second user of the chat
 * @returns An object representing the response { success: boolean; data: any | null; error: string | undefined }
 */
export const getSpecificChat = async (
  user_1_address: string,
  user_2_address: string
): Promise<{ success: boolean; data: any | null; error: string | undefined }> => {
  const response = await fetch(`/api/chats/specific?user_1_address=${user_1_address}&user_2_address=${user_2_address}`);

  const responseJson = await response.json();

  if (!responseJson.ok)
    return {
      success: false,
      data: null,
      error: responseJson.error,
    };

  return {
    success: true,
    data: responseJson.data,
    error: undefined,
  };
};
