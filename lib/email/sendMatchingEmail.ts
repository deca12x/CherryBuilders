interface SendMatchingEmailParams {
  matchedWith: string;
  matchedWithImage: string;
  matchedWithBio: string;
  chatLink: string;
  receiverEmail?: string;
  jwt: string;
}

export async function sendMatchingEmail({
  matchedWith,
  matchedWithImage,
  matchedWithBio,
  chatLink,
  receiverEmail,
  jwt
}: SendMatchingEmailParams) {
  try {

    if (!receiverEmail || receiverEmail.length < 1) {
      return { success: false, error: "No receiver email provided" };
    }

    const response = await fetch('/api/email/send-matching-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({
        matchedWith,
        matchedWithImage,
        matchedWithBio,
        chatLink,
        receiverEmail,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send matching email');
    }

    return await response.json();
  } catch (error) {
    console.error('Error sending matching email:', error);
    throw error;
  }
}
