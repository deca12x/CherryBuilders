import { FiltersProp } from "../types";
import { ChatMessageType, UserTag, UserType } from "./types";

/**
 * A utility function to get a specific partial match from the database
 * @param user_1_address - The address of the first user of the match
 * @param user_2_address - The address of the second user of the match
 * @param jwt - The jwt needed to authotize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getPartialMatch = async (
  user_1_address: string,
  user_2_address: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/matches/partial?user_1_address=${user_1_address}&user_2_address=${user_2_address}`, {
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
 * A utility function to update a match inside the database
 * @param user_1_address - The address of the first user of the match
 * @param user_2_address - The address of the second user of the match
 * @param value - The boolean value that must be set in the database record
 * @param jwt - The jwt needed to authotize the call
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
 * @param jwt - The jwt needed to authotize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const createMatch = async (
  user_1_address: string,
  user_2_address: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch("/api/matches", {
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
 * A utility function to create a new chat inside the database
 * @param user_1_address - The address of the first user of the chat
 * @param user_2_address - The address of the second user of the chat
 * @param jwt - The jwt needed to authotize the call
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
 * @param jwt - The jwt needed to authotize the call
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
 * @param jwt - The jwt needed to authotize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getChatsFromUserAddress = async (
  userAddress: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/chats?userAddress=${userAddress}`, {
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

// SEND EMAIL NOTIFICATIONS TO MATCHES
// CREATE A sendEmailNotification FUNCTION
// CREATE API ROUTE  /api/email/send-notification

/**
 * A utility function to get a specific chat from the database
 * @param user_1_address - The address of the first user of the chat
 * @param user_2_address - The address of the second user of the chat
 * @param jwt - The jwt needed to authotize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getSpecificChat = async (
  user_1_address: string,
  user_2_address: string,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/chats/specific?user_1_address=${user_1_address}&user_2_address=${user_2_address}`, {
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
 * A utility function to upload a profile picture inside the database
 * @param address - The address of the user
 * @param fileName - The name of the file
 * @param file - The file to upload
 * @param jwt - The jwt needed to authotize the call
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
 * A utility function that fetches a given number of filtered users from the database
 * @param tags - The tags that the users must have
 * @param events - The events that the users must have attended
 * @param offset - The number of users that must be skipped. It's used for pagination
 * @param limit - The number of users that must be fetched
 * @param jwt - The jwt needed to authotize the call
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
  // e.g. solidity%20dev,backend%20dev and event_1,event_2,event_3
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
 * @param jwt - The jwt needed to authotize the call
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
 * @param jwt - The jwt needed to authotize the call
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
 * @param jwt - The jwt needed to authotize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getChatMessages = async (
  chatId: string,
  ascending: boolean,
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/messages/${chatId}?ascending=${ascending}`, {
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
 * A utility function that, given a chat id, gets the last message of the chat from the database
 * @param chatId - the unique id of the chat
 * @param jwt - The jwt needed to authotize the call
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
 * @param jwt - The jwt needed to authotize the call
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
 * A utility function to update a message containing a request inside the database
 * @param requestId - The request id that identifies a request message
 * @param jwt - The jwt needed to authotize the call
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
 * @param jwt - The jwt needed to authotize the call
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
 * @param jwt - The jwt needed to authotize the call
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
 * @param jwt - The jwt needed to authotize the call
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
 * A utility function that gets the connected user's memorized filters from the database
 * @param jwt - The jwt needed to authotize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const getUserFilters = async (
  jwt: string | null
): Promise<{ success: boolean; data: FiltersProp | null; error: any | undefined }> => {
  const response = await fetch(`/api/filters`, {
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
 * A utility function that sets the connected user's newly selected filters in the database
 * @param tags - The tag filters
 * @param events - The event filters
 * @param jwt - The jwt needed to authotize the call
 * @returns An object representing the response { success: boolean; data: any | null; error: any | undefined }
 */
export const setUserFilters = async (
  tags: string[],
  events: string[],
  jwt: string | null
): Promise<{ success: boolean; data: any | null; error: any | undefined }> => {
  const response = await fetch(`/api/filters`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${jwt}`,
    },
    body: JSON.stringify({
      tags,
      events,
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
