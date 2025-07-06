interface SendNotificationEmailParams {
  senderName: string;
  senderImage: string;
  senderBio: string;
  senderBuilding: string;
  senderLookingFor: string;
  chatLink: string;
  receiverEmail?: string;
  message: string;
  jwt: string;
}

export async function sendNotificationEmail({
  senderName,
  senderImage,
  senderBio,
  senderBuilding,
  senderLookingFor,
  chatLink,
  receiverEmail,
  message,
  jwt,
}: SendNotificationEmailParams) {
  try {
    if (!receiverEmail || receiverEmail.length < 1) {
      return { success: false, error: "No receiver email provided" };
    }

    console.log("Starting sendNotificationEmail", {
      receiverEmail,
      senderName,
      message,
    });

    // Generate appropriate link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const finalLink = chatLink || `${baseUrl}/chat`;

    console.log("Generated link:", finalLink);

    const response = await fetch("/api/email/send-notification-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        senderName,
        senderImage,
        senderBio,
        senderBuilding,
        senderLookingFor,
        chatLink: finalLink,
        receiverEmail,
        message,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Failed to send notification email");
    }

    return await response.json();
  } catch (error) {
    console.error("Error sending notification email:", error);
    throw error;
  }
}
