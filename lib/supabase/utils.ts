import { FiltersProp } from "../types";
import { ChatMessageType, EventType, UserType } from "./types";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function to get a specific partial match from the database
 * @param user_1_address - The address of the first user of the match
 * @param user_2_address - The address of the second user of the match
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getPartialMatch = async (
  user_1_address: string,
  user_2_address: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(
    `/api/matches/partial?user_1_address=${user_1_address}&user_2_address=${user_2_address}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function to update a match inside the database
 * @param user_1_address - The address of the first user of the match
 * @param user_2_address - The address of the second user of the match
 * @param value - The boolean value that must be set in the database record
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const updateMatch = async (
  user_1_address: string,
  user_2_address: string,
  value: boolean,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch("/api/matches", {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_1_address,
      user_2_address,
      value,
    }),
  });

  const body = await response.json();

  if (!response.ok)
    return {
      success: false,
      data: null,
      error: body.error,
    };

  console.log("Match updated:", {
    user_1: user_1_address,
    user_2: user_2_address,
    matched: value,
    timestamp: value ? new Date().toISOString() : "not set",
  });

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
 * @param jwt - The jwt needed to authorize the call
 * @param icebreaker_message - The icebreaker message for the match
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const createMatch = async (
  user_1_address: string,
  user_2_address: string,
  jwt: string | null,
  icebreaker_message?: string
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  console.log(
    "createMatch called with icebreaker_message:",
    icebreaker_message
  );
  const response = await fetch("/api/matches", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_1_address,
      user_2_address,
      icebreaker_message,
    }),
  });

  const body = await response.json();

  if (!response.ok)
    return {
      success: false,
      data: null,
      error: body.error,
    };

  console.log("New match created:", {
    user_1: user_1_address,
    user_2: user_2_address,
    timestamp: new Date().toISOString(),
    has_icebreaker: !!icebreaker_message,
  });

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
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const createChat = async (
  user_1_address: string,
  user_2_address: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch("/api/chats", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      user_1_address,
      user_2_address,
    }),
  });

  const body = await response.json();

  if (!response.ok)
    return {
      success: false,
      data: null,
      error: body.error,
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
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getChatFromId = async (
  chatId: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/chats/${chatId}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function that, given a user address, gets the chat from the database
 * @param userAddress - The address of one of the two user that participate to the chat
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getChatsFromUserAddress = async (
  userAddress: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/chats/user/${userAddress}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function to get a specific chat from the database
 * @param user_1_address - The address of the first user of the chat
 * @param user_2_address - The address of the second user of the chat
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getSpecificChat = async (
  user_1_address: string,
  user_2_address: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(
    `/api/chats/specific?user_1_address=${user_1_address}&user_2_address=${user_2_address}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function to upload a profile picture inside the database
 * @param address - The address of the user
 * @param fileName - The name of the file
 * @param file - The file to upload
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const uploadProfilePicture = async (
  address: string,
  fileName: string,
  file: File,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const formData = new FormData();
  formData.append("fileName", fileName);
  formData.append("file", file);

  const response = await fetch(`/api/bucket/profile-pictures/${address}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
    body: formData,
  });

  const body = await response.json();

  if (!response.ok)
    return {
      success: false,
      data: null,
      error: body.error,
    };

  return {
    success: true,
    data: null,
    error: undefined,
  };
};

/**
 * A utility function to get filtered users based on tags and events
 * @param tags - Array of tags to filter by (using AND logic - users must have ALL specified tags)
 * @param events - Array of events to filter by (using AND logic - users must have ALL specified events)
 * @param offset - Pagination offset
 * @param limit - Pagination limit
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getFilteredUsers = async (
  tags: string[],
  events: string[],
  offset: number,
  limit: number,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  // Create a search param string from the tags and events and encodes it
  // Tags are filtered with AND logic - users must have ALL specified tags
  // Events are filtered with AND logic - users must have ALL specified events
  const eventsSearchParam = events.map(encodeURIComponent).join(",");
  const tagsSearchParam = tags.map(encodeURIComponent).join(",");

  const response = await fetch(
    `/api/users/get-by-filter?limit=${limit}&offset=${offset}&tags=${tagsSearchParam}&events=${eventsSearchParam}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function that, given a user address, gets their profile from the database
 * @param address - The address of the target user
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getUser = async (
  address: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/users/${address}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function to update a user profile inside the database
 * @param profileData - The data of the user to update
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const updateUser = async (
  address: string,
  profileData: Partial<UserType>,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/users/${address}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      profileData,
    }),
  });

  const body = await response.json();

  if (!response.ok)
    return {
      success: false,
      data: null,
      error: body.error,
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
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getChatMessages = async (
  chatId: string,
  ascending: boolean,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(
    `/api/messages/${chatId}?ascending=${ascending}`,
    {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    }
  );

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function that, given a chat id, gets the last message of the chat from the database
 * @param chatId - the unique id of the chat
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getLastChatMessage = async (
  chatId: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/messages/${chatId}/last-message`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function to create a new message inside the database
 * @param newMessage - The new message to be added to the database
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const createMessage = async (
  newMessage: ChatMessageType,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch("/api/messages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      newMessage,
    }),
  });

  const body = await response.json();

  if (!response.ok)
    return {
      success: false,
      data: null,
      error: body.error,
    };

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function to update the read value of all the messages of a chat inside the database
 * @param chatId - The chat id of the chat whose messages must be updated
 * @param readValue - The boolean value that must be set for all the messages of the chat
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const updateMessagesReadValue = async (
  chatId: string,
  readValue: boolean,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/messages/read`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chatId,
      readValue,
    }),
  });

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function to update a message containing a request inside the database
 * @param requestId - The request id that identifies a request message
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const updateRequestMessage = async (
  requestId: string,
  paid: boolean,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/requests/${requestId}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      paid,
    }),
  });

  const body = await response.json();

  if (!response.ok)
    return {
      success: false,
      data: null,
      error: body.error,
    };

  return {
    success: true,
    data: null,
    error: undefined,
  };
};

/**
 * A utility function that, given a code, retrieves a passcode item from the database
 * @param code - The unique passcode's code
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getPasscodeByCode = async (
  code: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/passcodes/${code}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function to update a passcode inside the database
 * @param code - The passcode's code
 * @param userAddress - The address of the user that will be associated with the passcode
 * @param eventSlug - The event's slug for the creation of a record in the users_events_rel table
 * @param consumedValue - The boolean value that must be set in the database record
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const updatePasscodeByCode = async (
  code: string,
  userAddress: string,
  eventSlug: string,
  consumedValue: boolean,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/passcodes/${code}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${jwt}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userAddress,
      eventSlug,
      consumedValue: consumedValue.toString(),
    }),
  });

  const body = await response.json();

  if (!response.ok)
    return {
      success: false,
      data: null,
      error: body.error,
    };

  return {
    success: true,
    data: null,
    error: undefined,
  };
};

/**
 * A utility function that, given an event slug, retrieves the corresponding event item from the database
 * @param eventSlug - The event's slug
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getEventBySlug = async (
  eventSlug: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/events/${eventSlug}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function that, given a user address, retrieves all the events the user is attending from the database
 * @param address - The address of the user
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: EventType[] | null; error: any | undefined }
 */
export const getEventsByAddress = async (
  address: string,
  jwt: string | null
): Promise<{
  success: boolean;
  data: EventType[] | null;
  error: any | undefined;
}> => {
  const response = await fetch(`/api/events/user/${address}`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

export async function getSpecificUser(address: string, jwt: string) {
  try {
    const response = await fetch(`/api/users/${address}`, {
      headers: {
        Authorization: `Bearer ${jwt}`,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    return { success: true, data: data.data, error: null };
  } catch (error) {
    return { success: false, data: null, error };
  }
}

export async function createUserEvent(
  address: string,
  event: string,
  jwt: string
) {
  if (event === "none") return;
  try {
    const response = await fetch("/api/user-events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${jwt}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userAddress: address, eventSlug: event }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error);
    }

    return { success: true, data: data.data, error: null };
  } catch (error) {
    return { success: false, data: null, error };
  }
}

export async function updateUserEvent(
  address: string,
  selectedEvents: string[],
  jwt: string
) {
  const response = await fetch("/api/user-events", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      userAddress: address,
      selectedEvents: selectedEvents,
    }),
  });

  if (!response.ok) {
    throw new Error("Failed to update event selection");
  }
}

/**
 * A utility function that retrieves all events from the database, regardless of active status
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: EventType[] | null; error: any | undefined }
 */
export const getAllEvents = async (
  jwt: string | null
): Promise<{
  success: boolean;
  data: EventType[] | null;
  error: any | undefined;
}> => {
  const response = await fetch(`/api/events/all`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * A utility function that retrieves all active events from the database
 * @param jwt - The jwt needed to authorize the call
 * @returns An object representing the response { success: boolean; data: EventType[] | null; error: any | undefined }
 */
export const getActiveEvents = async (
  jwt: string | null
): Promise<{
  success: boolean;
  data: EventType[] | null;
  error: any | undefined;
}> => {
  const response = await fetch(`/api/events/active`, {
    headers: {
      Authorization: `Bearer ${jwt}`,
    },
  });

  const body = await response.json();

  if (!response.ok) {
    if (response.status === 404) {
      return {
        success: true,
        data: null,
        error: undefined,
      };
    }
    return {
      success: false,
      data: null,
      error: body.error,
    };
  }

  return {
    success: true,
    data: body.data,
    error: undefined,
  };
};

/**
 * Calculate profile completeness percentage based on filled fields
 * @param user User profile data
 * @param hasPOAPs Boolean indicating if user has POAPs
 * @returns Number between 0-100 representing completeness percentage
 */
export const calculateProfileCompleteness = (
  user: Partial<UserType>,
  hasPOAPs: boolean = false
): number => {
  let score = 0;

  // 1. Has email (10%)
  if (user.email) score += 10;

  // 2. Bio has more than 4 characters (10%)
  if (user.bio && user.bio.length > 4) score += 10;

  // 3. Looking for has more than 4 characters (10%)
  if (user.looking_for && user.looking_for.length > 4) score += 10;

  // 4. Building has more than 4 characters (10%)
  if (user.building && user.building.length > 4) score += 10;

  // 5. Has GitHub link (10%)
  if (user.github_link) score += 10;

  // 6. Has Twitter link (10%)
  if (user.twitter_link) score += 10;

  // 7. Has Farcaster link (10%)
  if (user.farcaster_link) score += 10;

  // 8. Has other link (10%)
  if (user.other_link) score += 10;

  // 9. Has between 1 and 4 tags (10%)
  if (user.tags && user.tags.length >= 1 && user.tags.length <= 4) score += 10;

  // 10. Has POAPs (10%)
  if (hasPOAPs) score += 10;

  return score;
};
