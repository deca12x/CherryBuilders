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

interface EmailNotificationProps {
  senderName: string;
  senderImage: string;
  senderBio: string;
  senderBuilding: string;
  senderLookingFor: string;
  chatLink: string;
  message: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "";

export const EmailNotification = ({
  senderName,
  senderImage,
  senderBio,
  senderBuilding,
  senderLookingFor,
  chatLink,
  message,
}: EmailNotificationProps) => {
  const previewText = `${senderName} sent you a message on cherry.builders`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Tailwind>
        <Body className="bg-white my-auto mx-auto font-sans px-2">
          <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[10px] max-w-[600px]">
            <Heading className="text-black text-[24px] font-normal text-center p-0 my-[20px] mx-0">
              <strong>{senderName}</strong> sent you a message!
            </Heading>

            <Section>
              <Img
                className="user-image rounded-full object-cover my-0 mx-auto w-[128px] h-[128px]"
                src={
                  senderImage ||
                  "https://cherry.builders/images/default_propic.jpeg"
                }
                alt={`${senderName}'s profile picture`}
              />
            </Section>

            <Section>
              <Text className="text-gray-600 text-[14px] leading-[20px] text-center italic">
                Bio: "{senderBio}"
              </Text>
            </Section>

            <Section>
              <Text className="text-gray-600 text-[14px] leading-[20px] text-center italic">
                What I'm building: "{senderBuilding}"
              </Text>
            </Section>

            <Section>
              <Text className="text-gray-600 text-[14px] leading-[20px] text-center italic">
                Who I'm looking for: "{senderLookingFor}"
              </Text>
            </Section>

            <Section>
              <Text className="font-semibold text-[16px] mb-2">
                New message:
              </Text>
              <Text
                style={{
                  padding: "15px",
                  backgroundColor: "#f3f4f6",
                  borderRadius: "8px",
                  fontStyle: "italic",
                  marginBottom: "15px",
                }}
              >
                "{message}"
              </Text>
            </Section>

            <Section className="text-center mt-[20px] mb-[10px]">
              <Button
                className="bg-[#e11d48] rounded text-white text-[14px] font-semibold no-underline text-center px-6 py-3"
                href={chatLink}
              >
                Reply in chat
              </Button>
            </Section>

            <Hr className="border border-solid border-[#eaeaea] my-[20px] mx-0 w-full" />

            <Text
              style={{
                fontSize: "12px",
                color: "#666666",
                fontStyle: "italic",
                textAlign: "center",
                margin: "10px 0 0 0",
              }}
            >
              You can unsubscribe from emails at any time from your profile
              settings in cherry.builders
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
};

EmailNotification.PreviewProps = {
  senderName: "Alex Developer",
  senderImage: `${baseUrl}/images/default_propic.jpeg`,
  senderBio:
    "Full-stack developer passionate about building great user experiences",
  senderBuilding: "Working on a decentralized social platform",
  senderLookingFor: "Designers and frontend developers",
  chatLink: "https://cherry.builders/chat",
  message:
    "Hey, I saw your profile and I think we could work together on a project!",
} as EmailNotificationProps;

export default EmailNotification;
