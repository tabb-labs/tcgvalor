import React from 'react'
import styled from 'styled-components'

const Container = styled.div`
  max-width: 720px;
  margin: 2rem auto 6rem;
  line-height: 1.7;
`

const Title = styled.h1`
  font-size: 2rem;
  margin-bottom: 0.25rem;
`

const Updated = styled.p`
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 2rem;
`

const Section = styled.h2`
  font-size: 1.25rem;
  margin-top: 2rem;
  margin-bottom: 0.5rem;
`

const PrivacyPolicy = () => {
  return (
    <Container>
      <Title>Privacy Policy</Title>
      <Updated>Last updated: May 12, 2026</Updated>

      <p>
        TCGValor (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the TCGValor website and iOS app
        (the &ldquo;Service&rdquo;). This policy describes what data we collect, how we use it, and your rights.
      </p>

      <Section>Data We Collect</Section>
      <p>We collect the following data when you use the Service:</p>
      <ul>
        <li>
          <strong>Email address and User ID</strong> — collected via Auth0 when you create an account, used solely to
          authenticate you and associate your collection with your account.
        </li>
        <li>
          <strong>Collection data</strong> — the cards you add to your collection, stored on our servers so you can
          access them across devices.
        </li>
        <li>
          <strong>Usage data</strong> — collected automatically via PostHog, including IP address, device type, pages
          visited, and time spent. Used to understand how features are used and improve the Service.
        </li>
        <li>
          <strong>Crash reports</strong> — collected via Honeybadger to help us diagnose and fix errors in the app.
        </li>
      </ul>

      <Section>Cookies</Section>
      <p>
        The Service uses cookies to authenticate you and maintain your session (via Auth0) and to collect analytics data
        (via PostHog). You can instruct your browser to refuse cookies, but some parts of the Service may not function
        correctly without them.
      </p>

      <Section>How We Use Your Data</Section>
      <p>We use your data exclusively to operate and improve the Service:</p>
      <ul>
        <li>To authenticate you and maintain your account</li>
        <li>To store and display your card collection</li>
        <li>To diagnose crashes and fix bugs</li>
        <li>To understand feature usage and guide product decisions</li>
      </ul>
      <p>We do not sell your data. We do not use your data for advertising or share it with advertisers.</p>

      <Section>Third-Party Services</Section>
      <ul>
        <li>
          <strong>Auth0</strong> — handles authentication. Subject to{' '}
          <a href="https://auth0.com/privacy" target="_blank" rel="noreferrer">
            Auth0&apos;s Privacy Policy
          </a>
          .
        </li>
        <li>
          <strong>Honeybadger</strong> — crash and error monitoring. Subject to{' '}
          <a href="https://www.honeybadger.io/privacy/" target="_blank" rel="noreferrer">
            Honeybadger&apos;s Privacy Policy
          </a>
          .
        </li>
        <li>
          <strong>PostHog</strong> — product analytics. Subject to{' '}
          <a href="https://posthog.com/privacy" target="_blank" rel="noreferrer">
            PostHog&apos;s Privacy Policy
          </a>
          .
        </li>
        <li>
          <strong>CardTrader</strong> — card pricing data displayed in the app. We query their API server-side; no user
          data is shared with CardTrader.
        </li>
      </ul>

      <Section>Data Retention</Section>
      <p>
        Your account and collection data are retained as long as your account is active. Usage and crash data is
        generally retained for a shorter period. You may request deletion of your account and all associated data at any
        time by contacting us.
      </p>

      <Section>Your Rights</Section>
      <p>
        You have the right to access, correct, or delete your personal data at any time. To make a request, contact us
        at the email below. We will respond within a reasonable timeframe.
      </p>

      <Section>Disclosure to Law Enforcement</Section>
      <p>
        We may disclose your personal data if required to do so by law or in response to valid requests by public
        authorities (e.g. a court or government agency).
      </p>

      <Section>Business Transfers</Section>
      <p>
        If TCGValor is involved in a merger, acquisition, or asset sale, your personal data may be transferred. We will
        provide notice before your data becomes subject to a different privacy policy.
      </p>

      <Section>Security</Section>
      <p>
        We take reasonable measures to protect your personal data. However, no method of transmission over the internet
        or electronic storage is 100% secure, and we cannot guarantee absolute security.
      </p>

      <Section>Children&apos;s Privacy</Section>
      <p>
        The Service is not directed at children under 13. We do not knowingly collect personal data from children under
        13. If you believe your child has provided us with personal data, please contact us and we will delete it.
      </p>

      <Section>Changes to This Policy</Section>
      <p>
        We may update this Privacy Policy from time to time. We will notify you of significant changes by posting the
        updated policy on this page and updating the &ldquo;Last updated&rdquo; date. We encourage you to review this
        policy periodically.
      </p>

      <Section>Contact</Section>
      <p>
        Questions about this policy? Contact us at <a href="mailto:miketabb33@gmail.com">miketabb33@gmail.com</a>.
      </p>
    </Container>
  )
}

export default PrivacyPolicy
