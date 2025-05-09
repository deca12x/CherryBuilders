interface SendMatchingEmailParams {
  matchedWith: string;
  matchedWithImage: string;
  matchedWithBio: string;
  matchedWithBuilding: string;
  matchedWithLookingFor: string;
  matchedWithAddress: string;
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
  matchedWithAddress,
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

    console.log("Starting sendMatchingEmail", {
      isMatchComplete,
      receiverEmail,
      matchedWith,
      matchedWithAddress,
    });

    // Generate appropriate link based on email type:
    // Type 1 (icebreaker): goes to complete-match route
    // Type 2 (match completion): goes to chat
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const finalLink = isMatchComplete
      ? chatLink
      : `${baseUrl}/complete-match/${matchedWithAddress}`;

    console.log("Generated link:", finalLink);

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
        chatLink: finalLink,
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
