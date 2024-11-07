import MatchedEmail from '@/components/email/Matched';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

type MatchedEmailProps = {
  matchedWith: string;
  matchedWithImage: string;
  matchedWithBio: string;
  chatLink: string;
  receiverEmail: string;
}

export async function POST(request: Request) {
  try {
    const { matchedWith, matchedWithImage, matchedWithBio, chatLink, receiverEmail }: MatchedEmailProps = await request.json();

    console.log('Received email data:', { matchedWith, matchedWithImage, matchedWithBio, chatLink, receiverEmail });



    if (!matchedWith || !matchedWithImage || !matchedWithBio || !chatLink || !receiverEmail) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(receiverEmail)) {
      return Response.json({ error: 'Invalid email address' }, { status: 400 });
    }

    const { data, error } = await resend.emails.send({
      from: 'noreply@info.cherry.builders',
      to: [receiverEmail],
      subject: '🎉 New match!',
      react: MatchedEmail({ matchedWith, matchedWithImage, matchedWithBio, chatLink }),
    });

    if (error) {
      console.error('Resend API error:', error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    return Response.json(data);
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}