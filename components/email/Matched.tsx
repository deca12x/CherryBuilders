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
  matchedWithBuilding: string;
  matchedWithLookingFor: string;
  chatLink: string;
  message?: string;
  isMatchComplete?: boolean;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const MatchedEmail = ({
  matchedWith,
  matchedWithImage,
  matchedWithBio,
  matchedWithBuilding,
  matchedWithLookingFor,
  chatLink,
  message,
  isMatchComplete,
}: MatchedEmailProps) => {
  const previewText = isMatchComplete
    ? "New match on cherry.builders"
    : `${matchedWith} wants to collab!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[10px] max-w-[600px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[20px] mx-0">
              {message ? (
                <>
                  <strong>{matchedWith}</strong> sent you an message!
                </>
              ) : (
                <>
                  You have a new match: <strong>{matchedWith}</strong>
                </>
              )}
            </Heading>

            <Section>
              <Img
                className="user-image rounded-full object-cover my-0 mx-auto w-[128px] h-[128px]"
                src={matchedWithImage || "/images/default_propic.jpeg"}
                alt={`${matchedWith}'s profile picture`}
              />
            </Section>

            {matchedWithBio && (
              <Section>
                <Text className="text-gray-600 text-[14px] leading-[20px] text-center italic">
                  Bio: "{matchedWithBio}"
                </Text>
              </Section>
            )}

            {matchedWithBuilding && (
              <Section>
                <Text className="text-gray-600 text-[14px] leading-[20px] text-center italic">
                  What I'm building: "{matchedWithBuilding}"
                </Text>
              </Section>
            )}

            {matchedWithLookingFor && (
              <Section>
                <Text className="text-gray-600 text-[14px] leading-[20px] text-center italic">
                  Who I'm looking for: "{matchedWithLookingFor}"
                </Text>
              </Section>
            )}

            {message && (
              <Section>
                <Text>They sent you a message:</Text>
                <Text
                  style={{
                    padding: "10px",
                    backgroundColor: "#f3f4f6",
                    borderRadius: "5px",
                    fontStyle: "italic",
                  }}
                >
                  "{message}"
                </Text>
              </Section>
            )}

            <Section className="text-center mt-[10px] mb-[10px]">
              <Button
                className="bg-[#000000] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                href={chatLink}
              >
                Start chatting
              </Button>
            </Section>

            <p
              style={{
                fontSize: "12px",
                color: "#666666",
                fontStyle: "italic",
                textAlign: "center",
                margin: "20px 0 0 0",
              }}
            >
              You can unsubscribe from emails at any time from your profile
              settings in cherry.builders
            </p>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

MatchedEmail.PreviewProps = {
  matchedWith: "Sarah Developer",
  matchedWithImage: `${baseUrl}/static/default-avatar.png`,
  matchedWithBio:
    "Full-stack developer passionate about building great user experiences",
  chatLink: "https://example.com/chat/123",
  message: "Hey, I'm interested in building together!",
} as MatchedEmailProps;

export default MatchedEmail;
