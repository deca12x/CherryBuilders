import MatchedEmail from "@/components/email/Matched";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type MatchedEmailProps = {
  matchedWith: string;
  matchedWithImage: string;
  matchedWithBio: string;
  matchedWithBuilding: string;
  matchedWithLookingFor: string;
  chatLink: string;
  receiverEmail: string;
  message?: string;
  isMatchComplete?: boolean;
};

export async function POST(request: Request) {
  try {
    const {
      matchedWith,
      matchedWithImage,
      matchedWithBio,
      matchedWithBuilding,
      matchedWithLookingFor,
      chatLink,
      receiverEmail,
      message,
      isMatchComplete,
    }: MatchedEmailProps = await request.json();

    console.log("Received email data:", {
      matchedWith,
      matchedWithImage,
      matchedWithBio,
      matchedWithBuilding,
      matchedWithLookingFor,
      chatLink,
      receiverEmail,
      message,
      isMatchComplete,
    });

    if (!matchedWith || !matchedWithBio || !chatLink || !receiverEmail) {
      console.log("2. Validation failed - missing fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("3. Resend API key exists:", !!process.env.RESEND_API_KEY);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiverEmail)) {
      return new Response(JSON.stringify({ error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data, error } = await resend.emails.send({
      from: "noreply@cherry.builders",
      to: [receiverEmail],
      subject:
        message && isMatchComplete
          ? "🍒 New match on cherry.builders"
          : `🍒 Someone sent you a message on cherry.builders`,
      react: MatchedEmail({
        matchedWith,
        matchedWithImage:
          matchedWithImage ||
          "https://cherry.builders/images/default_propic.jpeg",
        matchedWithBio,
        matchedWithBuilding,
        matchedWithLookingFor,
        chatLink,
        message,
      }) as React.ReactElement,
    });

    console.log("4. Email template data:", {
      matchedWith,
      matchedWithImage:
        matchedWithImage ||
        "https://cherry.builders/images/default_propic.jpeg",
      matchedWithBio,
      matchedWithBuilding,
      matchedWithLookingFor,
      chatLink,
      message,
    });

    console.log("5. Resend API response:", { data, error });

    if (error) {
      console.error("Resend API error:", error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!data) {
      console.error("No data returned from Resend API");
      return new Response(JSON.stringify({ error: "No email ID returned" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.log("6. Email sent successfully with ID:", data.id);

    return new Response(JSON.stringify(data), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("Unexpected error:", error);

    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
