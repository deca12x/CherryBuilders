interface SendMatchingEmailParams {
  matchedWith: string;
  matchedWithImage: string;
  matchedWithBio: string;
  matchedWithBuilding: string;
  matchedWithLookingFor: string;
  chatLink: string;
  receiverEmail?: string;
  jwt: string;
  message?: string;
  isMatchComplete?: boolean;
}

export async function sendMatchingEmail({
  matchedWith,
  matchedWithImage,
  matchedWithBio,
  matchedWithBuilding,
  matchedWithLookingFor,
  chatLink,
  receiverEmail,
  jwt,
  message,
  isMatchComplete,
}: SendMatchingEmailParams) {
  try {
    if (!receiverEmail || receiverEmail.length < 1) {
      return { success: false, error: "No receiver email provided" };
    }

    const response = await fetch("/api/email/send-matching-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        matchedWith,
        matchedWithImage,
        matchedWithBio,
        matchedWithBuilding,
        matchedWithLookingFor,
        chatLink,
        receiverEmail,
        message,
        isMatchComplete,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send matching email");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending matching email:", error);
    throw error;
  }
}
