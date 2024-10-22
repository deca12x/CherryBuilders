import { NextRequest } from "next/server";
import { isApiKeyModeValid } from "./utils";
import { HttpMethod } from "./types";
import { supabase } from "../supabase/supabase-server";
import { ApiKeyType } from "../supabase/types";

/**
 * A function that creates an API request log in the database
 * @param keyId - The ID of the API key
 * @param path - The path of the request
 * @param method - The HTTP method of the request
 */
export const createApiKeyLog = async (keyId: number, path: string, method: HttpMethod, api_key_owner: string) => {
  try {
    // Create an API request log in the database
    const { error } = await supabase.from("api_requests").insert([{ api_key_id: keyId, path, method, api_key_owner }]);
    if (error) {
      throw error;
    }
  } catch {
    console.error("Could not create the API request log");
  }
};

/**
 * A function that validates an API key
 * @param req - The NextRequest object
 * @param expected_owner - The expected owner of the API key
 * @returns An object containing the API key and whether it is valid
 */
export const validateApiKey = async (
  req: NextRequest,
  expected_owner: string
): Promise<{ apiKey: ApiKeyType | null; valid: boolean }> => {
  try {
    // Get the API key from the headers and check if it exists
    const apiKey = req.headers.get("x-api-key");

    if (!apiKey) {
      return {
        apiKey: null,
        valid: false,
      };
    }

    // Check if the API key exists in the database
    const { data: keyData, error: keyError } = await supabase.from("api_keys").select("*").eq("key", apiKey).single();

    // Get the HTTP method of the request
    const method = req.method as HttpMethod;

    // If the API key doesn't exist in the database, the owner is incorrect,
    // there's an error or the mode is incorrect, return false
    if (keyError || !keyData || keyData.owner_entity !== expected_owner || !isApiKeyModeValid(keyData.mode, method)) {
      return {
        apiKey: null,
        valid: false,
      };
    }

    // Create an API request log in the database
    await createApiKeyLog(keyData.id, `/api${req.url.split("/api")[1]}`, method, keyData.owner_entity);

    // Return the API key and that it is valid
    return {
      apiKey: keyData,
      valid: true,
    };
  } catch (error) {
    console.error("Could not validate the API key, error: ", error);
    return {
      apiKey: null,
      valid: false,
    };
  }
};
