import EmailNotification from "@/components/email/EmailNotification";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type EmailNotificationProps = {
  senderName: string;
  senderImage: string;
  senderBio: string;
  senderBuilding: string;
  senderLookingFor: string;
  chatLink: string;
  receiverEmail: string;
  message: string;
};

export async function POST(request: Request) {
  try {
    const {
      senderName,
      senderImage,
      senderBio,
      senderBuilding,
      senderLookingFor,
      chatLink,
      receiverEmail,
      message,
    }: EmailNotificationProps = await request.json();

    console.log("Received notification email data:", {
      senderName,
      senderImage,
      senderBio,
      senderBuilding,
      senderLookingFor,
      chatLink,
      receiverEmail,
      message,
    });

    if (!senderName || !senderBio || !chatLink || !receiverEmail || !message) {
      console.log("Validation failed - missing fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log("Resend API key exists:", !!process.env.RESEND_API_KEY);

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
      subject: `🍒 New message from ${senderName} on cherry.builders`,
      react: EmailNotification({
        senderName,
        senderImage:
          senderImage || "https://cherry.builders/images/default_propic.jpeg",
        senderBio,
        senderBuilding,
        senderLookingFor,
        chatLink,
        message,
      }) as React.ReactElement,
    });

    console.log("Email template data:", {
      senderName,
      senderImage:
        senderImage || "https://cherry.builders/images/default_propic.jpeg",
      senderBio,
      senderBuilding,
      senderLookingFor,
      chatLink,
      message,
    });

    console.log("Resend API response:", { data, error });

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

    console.log("Email notification sent successfully with ID:", data.id);

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
