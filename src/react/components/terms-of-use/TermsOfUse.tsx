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

const TermsOfUse = () => {
  return (
    <Container>
      <Title>Terms of Use</Title>
      <Updated>Last updated: June 2, 2026</Updated>

      <p>
        By using the TCGValor website or iOS app (the &ldquo;Service&rdquo;), you agree to these Terms of Use. If you do
        not agree, do not use the Service.
      </p>

      <Section>Use of the Service</Section>
      <p>
        TCGValor is a personal collection tracker for trading card games. You may use the Service for your own
        non-commercial purposes. You may not misuse the Service, attempt to gain unauthorized access, or interfere with
        its operation.
      </p>

      <Section>Accounts</Section>
      <p>
        You must create an account to use most features. You are responsible for keeping your credentials secure and for
        all activity that occurs under your account. Contact us immediately if you believe your account has been
        compromised.
      </p>

      <Section>Pro Subscription</Section>
      <p>
        The TCGValor iOS app is free to download and use. You can scan cards, browse the catalog, track your collection,
        and view card values without a subscription. Once your collection reaches the free-tier card limit (shown in the
        app), a Pro subscription is required to continue adding cards.
      </p>
      <p>The TCGValor website at tcgvalor.com is completely free with no card limit.</p>
      <ul>
        <li>
          <strong>Subscription name:</strong> TCGValor Pro
        </li>
        <li>
          <strong>Billing period:</strong> Monthly
        </li>
        <li>
          <strong>Price:</strong> As displayed at the time of purchase in the app
        </li>
        <li>
          <strong>What it unlocks:</strong> Unlimited card storage in the iOS app
        </li>
        <li>
          <strong>Auto-renewal:</strong> Your subscription automatically renews each month unless you cancel at least 24
          hours before the end of the current period.
        </li>
        <li>
          <strong>Cancellation:</strong> You can cancel at any time in your Apple ID subscription settings. Cancellation
          takes effect at the end of the current billing period; no refunds are issued for unused time.
        </li>
      </ul>
      <p>
        Subscriptions are managed and billed by Apple through the App Store. By subscribing, you also agree to{' '}
        <a href="https://www.apple.com/legal/internet-services/itunes/" target="_blank" rel="noreferrer">
          Apple&apos;s Terms of Service
        </a>
        .
      </p>

      <Section>Card Pricing Data</Section>
      <p>
        Market values displayed in TCGValor are sourced from CardTrader and are provided for informational purposes
        only. We make no guarantees about accuracy or completeness. Do not rely on these values for financial decisions.
      </p>

      <Section>Intellectual Property</Section>
      <p>
        All content and software in the Service is owned by TCGValor or its licensors. Trading card names, images, and
        related trademarks are the property of their respective owners. TCGValor is not affiliated with or endorsed by
        any trading card game publisher.
      </p>

      <Section>Disclaimer of Warranties</Section>
      <p>
        The Service is provided &ldquo;as is&rdquo; without warranties of any kind, express or implied. We do not
        warrant that the Service will be uninterrupted, error-free, or that any defects will be corrected.
      </p>

      <Section>Limitation of Liability</Section>
      <p>
        To the maximum extent permitted by law, TCGValor shall not be liable for any indirect, incidental, special, or
        consequential damages arising from your use of the Service.
      </p>

      <Section>Changes to These Terms</Section>
      <p>
        We may update these Terms from time to time. Continued use of the Service after changes are posted constitutes
        acceptance of the updated Terms.
      </p>

      <Section>Contact</Section>
      <p>
        Questions? Contact us at <a href="mailto:miketabb33@gmail.com">miketabb33@gmail.com</a>.
      </p>
    </Container>
  )
}

export default TermsOfUse
