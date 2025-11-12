import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components';
import * as React from 'react';

interface FeedbackRequestEmailProps {
  userEmail: string;
  feedbackUrl?: string;
}

export const FeedbackRequestEmail = ({
  userEmail,
  feedbackUrl = 'http://localhost:3000/dashboard',
}: FeedbackRequestEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Feedback Request</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>How was your weekend?</Heading>
          <Text style={text}>
            Hi {userEmail}, we hope you had a great weekend! We&apos;d love to get
            your feedback on your recent matches.
          </Text>
          <Section style={buttonContainer}>
            <Link style={button} href={feedbackUrl}>
              Give Feedback
            </Link>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  maxWidth: '580px',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  marginBottom: '24px',
  textAlign: 'center' as const,
};

const text = {
  color: '#555',
  fontSize: '16px',
  lineHeight: '1.5',
  marginBottom: '24px',
};

const buttonContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
};

const button = {
  backgroundColor: '#3b82f6',
  borderRadius: '4px',
  color: '#fff',
  display: 'inline-block',
  fontSize: '16px',
  fontWeight: '600',
  padding: '12px 24px',
  textDecoration: 'none',
};

export default FeedbackRequestEmail;
