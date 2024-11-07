import {
    Body,
    Button,
    Container,
    Column,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Row,
    Section,
    Text,
    Tailwind,
  } from "@react-email/components";
  import * as React from "react";
  
  interface MatchedEmailProps {
    matchedWith: string;
    matchedWithImage: string;
    matchedWithBio: string;
    chatLink: string;
    message?: string;
  }
  
  const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "";
  
  export const MatchedEmail = ({
    matchedWith,
    matchedWithImage,
    matchedWithBio,
    chatLink,
    message,
  }: MatchedEmailProps) => {
    const previewText = `New match! ${matchedWith} would like to get in touch`;
  
    return (
      <Html>
        <Head />
        <Preview>{previewText}</Preview>
        <Tailwind>
          <Body className="bg-white my-auto mx-auto font-sans px-2">
            <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
              <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
               {message ? "Someone sent you an icebreaker!" : "You have a new match!"}
              </Heading>
              
              <Section>
                <Img
                  className="rounded-full my-0 mx-auto"
                  src={matchedWithImage}
                  width="128"
                  height="128"
                />
              </Section>

              <Text className="text-black text-[16px] leading-[24px] text-center">
                <strong>{matchedWith}</strong> would like to meet, chat & build together!
              </Text>

              {matchedWithBio && (
                <Text className="text-gray-600 text-[14px] leading-[24px] text-center italic">
                  "{matchedWithBio}"
                </Text>
              )}

              {message && (
                <Section>
                  <Text>They sent you a message:</Text>
                  <Text style={{ 
                    padding: '12px',
                    backgroundColor: '#f3f4f6',
                    borderRadius: '8px',
                    fontStyle: 'italic'
                  }}>
                    "{message}"
                  </Text>
                </Section>
              )}

              <Section className="text-center mt-[32px] mb-[32px]">
                <Button
                  className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                  href={chatLink}
                >
                  Start chatting
                </Button>
              </Section>
            </Container>
          </Body>
        </Tailwind>
      </Html>
    );
  };
  
  MatchedEmail.PreviewProps = {
    matchedWith: "Sarah Developer",
    matchedWithImage: `${baseUrl}/static/default-avatar.png`,
    matchedWithBio: "Full-stack developer passionate about building great user experiences",
    chatLink: "https://example.com/chat/123",
    message: "Hey, I'm interested in building together!",
  } as MatchedEmailProps;
  
  export default MatchedEmail;