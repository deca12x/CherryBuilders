import { supabase } from ".";
import { UserData } from "./types";

/**
 * Check if a specific user is in the database
 * @param address The address of the user
 * @returns An object {data: any | null, error: boolean}
 **/
export const isUserInDatabase = async (address: string): Promise<{ data: any | null; error: boolean }> => {
  try {
    const { data, error } = await supabase
      .from("user_data")
      .select("*")
      .eq("evm_address", address)
      .single();

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
