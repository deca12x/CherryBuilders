import MatchedEmail from '@/components/email/Matched';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type MatchedEmailProps = {
  matchedWith: string;
  matchedWithImage: string;
  matchedWithBio: string;
  chatLink: string;
  receiverEmail: string;
  message?: string;
  isMatchComplete?: boolean;
}

export async function POST(request: Request) {
  try {
    const { matchedWith, matchedWithImage, matchedWithBio, chatLink, receiverEmail, message, isMatchComplete }: MatchedEmailProps = await request.json();

    console.log('Received email data:', { matchedWith, matchedWithImage, matchedWithBio, chatLink, receiverEmail, message, isMatchComplete });



    if (!matchedWith || !matchedWithImage || !matchedWithBio || !chatLink || !receiverEmail) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiverEmail)) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const { data, error } = await resend.emails.send({
      from: 'noreply@info.cherry.builders',
      to: [receiverEmail],
      subject: message && isMatchComplete ? "💌 New match!" : "💌 Someone sent you an icebreaker!",
      react: MatchedEmail({ matchedWith, matchedWithImage, matchedWithBio, chatLink, message }),
    });

    if (error) {
      console.error('Resend API error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}