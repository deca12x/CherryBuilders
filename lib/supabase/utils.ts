import { RealtimeChannel } from "@supabase/supabase-js";
import { ChatMessage, UserType } from "../types";
import { MutableRefObject } from "react";

/**
 * Check if a specific user is in the database
 * @param address The address of the user
 * @returns An object {data: any | null, error: boolean}
 **/
export const isUserInDatabase = async (address: string): Promise<{ data: any | null; error: boolean }> => {
  try {
    const foundUser = await getUser(address);

    if (!foundUser.success) {
      // Check if the error is due to no rows found
      if (foundUser.error?.code === "PGRST116") {
        return {
          data: null,
          error: false,
        };
      }
      throw foundUser.error;
    }

    return {
      data: foundUser.data,
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

/**
 * A utility function to get a specific partial match from the database
 * @param user_1_address - The address of the first user of the match
 * @param user_2_address - The address of the second user of the match
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getPartialMatch = async (
  user_1_address: string,
  user_2_address: string
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/matches/partial?user_1_address=${user_1_address}&user_2_address=${user_2_address}`);

  const responseJson = await response.json();

  if (!response.ok)
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

/**
 * A utility function to update a match inside the database
 * @param user_1_address - The address of the first user of the match
 * @param user_2_address - The address of the second user of the match
 * @param value - The boolean value that must be set in the database record
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const updateMatch = async (
  user_1_address: string,
  user_2_address: string,
  value: boolean
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
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

  if (!response.ok)
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
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const createMatch = async (
  user_1_address: string,
  user_2_address: string
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
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

  if (!response.ok)
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
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const createChat = async (
  user_1_address: string,
  user_2_address: string
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
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

  if (!response.ok)
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
 * A utility function that, given a chat id, gets the chat from the database
 * @param chatId - the unique id of the chat
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getChatFromId = async (
  chatId: string
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/chats/${chatId}`);

  const responseJson = await response.json();

  if (!response.ok)
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

/**
 * A utility function that, given a user address, gets the chat from the database
 * @param userAddress - The address of one of the two user that participate to the chat
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getChatsFromUserAddress = async (
  userAddress: string
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/chats?userAddress=${userAddress}`);

  const responseJson = await response.json();

  if (!response.ok)
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

/**
 * A utility function to get a specific chat from the database
 * @param user_1_address - The address of the first user of the chat
 * @param user_2_address - The address of the second user of the chat
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getSpecificChat = async (
  user_1_address: string,
  user_2_address: string
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/chats/specific?user_1_address=${user_1_address}&user_2_address=${user_2_address}`);

  const responseJson = await response.json();

  if (!response.ok)
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

/**
 * A utility function to upload a profile picture inside the database
 * @param address - The address of the user
 * @param fileName - The name of the file
 * @param file - The file to upload
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const uploadProfilePicture = async (
  address: string,
  fileName: string,
  file: File
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/bucket/profile-pictures/${address}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer jwt`, // TODO: add the correct jwt
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName,
      file,
    }),
  });

  const responseJson = await response.json();

  if (!response.ok)
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
 * A utility function that, given a user address, gets their profile from the database
 * @param userAddress - The address of the target user
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getUser = async (address: string): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/users/${address}`);

  const responseJson = await response.json();

  if (!response.ok)
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

/**
 * A utility function to update a user profile inside the database
 * @param profileData - The data of the user to update
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const updateUser = async (
  address: string,
  profileData: Partial<UserType>
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/users/${address}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer jwt`, // TODO: add the correct jwt
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      profileData,
    }),
  });

  const responseJson = await response.json();

  if (!response.ok)
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
 * A utility function that, given a chat id, gets the messages of the chat from the database
 * @param chatId - the unique id of the chat
 * @param ascending - if the messages should be get in an ascending way
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getChatMessages = async (
  chatId: string,
  ascending: boolean
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/messages/${chatId}?ascending=${ascending}`);

  const responseJson = await response.json();

  if (!response.ok)
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

/**
 * A utility function that, given a chat id, gets the last message of the chat from the database
 * @param chatId - the unique id of the chat
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getLastChatMessage = async (
  chatId: string
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/messages/${chatId}/last-message`);

  const responseJson = await response.json();

  if (!response.ok)
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

/**
 * A utility function to create a new message inside the database
 * @param newMessage - The new message to be added to the database
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const createMessage = async (
  newMessage: ChatMessage
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer jwt`, // TODO: add the correct jwt
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      newMessage,
    }),
  });

  const responseJson = await response.json();

  if (!response.ok)
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

/**
 * A utility function to update a message containing a request inside the database
 * @param requestId - The request id that identifies a request message
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const updateRequestMessage = async (
  requestId: string,
  paid: boolean
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/requests/${requestId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer jwt`, // TODO: add the correct jwt
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paid,
    }),
  });

  const responseJson = await response.json();

  if (!response.ok)
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
