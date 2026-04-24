import React from 'react';
import { Metadata } from 'next';
import { DecorIcon } from '@/components/ui/decor-icon';

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PokiSpokey privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto border-t border-l border-border/40">

        {/* Header */}
        <div className="relative border-r border-b border-border/40 px-10 py-14">
          <DecorIcon position="top-left" />
          <DecorIcon position="top-right" />
          <DecorIcon position="bottom-left" />
          <DecorIcon position="bottom-right" />
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-orange-500 mb-4">Legal</p>
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4">
            Privacy Policy
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: March 13, 2026</p>
        </div>

        {/* Section 1 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">1. Introduction</h2>
          <p className="text-muted-foreground leading-relaxed">
            PokiSpokey ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains what personal data we collect when you use our language learning platform, how we use and store it, who we share it with, and what rights you have over your data. By using the Service, you consent to the practices described in this policy.
          </p>
        </div>

        {/* Section 2 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8 bg-muted/20 dark:bg-muted/5">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">2. Information We Collect</h2>
          <div className="text-muted-foreground leading-relaxed space-y-4">
            <p>We collect the following categories of information:</p>

            <h3 className="text-base font-semibold text-foreground mt-4">2.1 Account and Identity Data</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Email address</strong> — collected at registration, used for authentication and service communications.</li>
              <li><strong className="text-foreground">Display name</strong> — provided by you or derived from your Google account if you sign in via Google OAuth.</li>
              <li><strong className="text-foreground">Profile picture URL</strong> — optionally provided via Google OAuth; stored as a reference URL only.</li>
              <li><strong className="text-foreground">Password hash</strong> — if you register with email/password, we store a bcrypt-hashed version. We never store your plain-text password.</li>
              <li><strong className="text-foreground">Subscription tier</strong> — your current plan (Free, Basic, Pro, Scholar Max, or VIP Unlimited).</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-4">2.2 Usage and Activity Data</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Search queries</strong> — words and phrases you search, along with language and category filters.</li>
              <li><strong className="text-foreground">AI Tutor conversations</strong> — messages you send and responses generated, logged for abuse monitoring.</li>
              <li><strong className="text-foreground">Usage counters</strong> — monthly counts of searches, AI sessions, and AI Sparks consumed. Reset monthly.</li>
              <li><strong className="text-foreground">Language and category preferences</strong> — persisted to improve your experience across sessions.</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-4">2.3 Technical and Device Data</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">IP address</strong> — logged on authentication events for security and rate-limiting.</li>
              <li><strong className="text-foreground">Browser type and version</strong> — for compatibility and diagnostics.</li>
              <li><strong className="text-foreground">Device type and operating system</strong> — for analytics and debugging.</li>
              <li><strong className="text-foreground">Referrer URL and navigation patterns</strong> — to understand how users discover the Service.</li>
            </ul>

            <h3 className="text-base font-semibold text-foreground mt-4">2.4 Payment and Billing Data</h3>
            <p>Payment processing is handled exclusively by <strong className="text-foreground">Polar.sh</strong>. We do not store your credit card details. We only store your Polar Customer ID and subscription history.</p>
          </div>
        </div>

        {/* Section 3 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">3. How We Use Your Data</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">We use the data we collect strictly for the following purposes. We do not sell your personal data.</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Service delivery</strong> — authentication, search, video playback, and AI Tutor.</li>
            <li><strong className="text-foreground">Usage limit enforcement</strong> — tracking monthly search count and Sparks balance.</li>
            <li><strong className="text-foreground">Billing and subscription management</strong> — via Polar.</li>
            <li><strong className="text-foreground">Security and fraud prevention</strong> — detecting unauthorized access and abuse.</li>
            <li><strong className="text-foreground">Service improvement</strong> — using anonymized, aggregated data.</li>
            <li><strong className="text-foreground">Communications</strong> — transactional emails only (OTP, password reset, billing receipts).</li>
            <li><strong className="text-foreground">Legal compliance</strong> — responding to lawful requests and enforcing our Terms.</li>
          </ul>
        </div>

        {/* Section 4 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8 bg-muted/20 dark:bg-muted/5">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">4. Authentication and Session Management</h2>
          <div className="text-muted-foreground leading-relaxed space-y-3">
            <p>PokiSpokey uses stateless JWT authentication. When you log in, we issue a short-lived access token (30 minutes) and a longer-lived refresh token (7 days), stored in Redis with rotation on each use.</p>
            <p>Access tokens are stored in your browser's memory or secure cookie storage. We do not use persistent tracking cookies for advertising. The only cookies we set are strictly necessary for authentication.</p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">5. Third-Party Services We Use</h2>
          <ul className="list-disc pl-5 space-y-3 text-muted-foreground">
            <li><strong className="text-foreground">Polar.sh</strong> — payment processing, PCI-DSS compliant.</li>
            <li><strong className="text-foreground">Groq</strong> — AI inference for the AI Tutor. Conversation context is sent to Groq's API.</li>
            <li><strong className="text-foreground">YouTube / Google</strong> — video delivery via the YouTube IFrame API. YouTube may set its own cookies.</li>
            <li><strong className="text-foreground">Vercel</strong> — frontend hosting. May collect standard server logs including IP addresses.</li>
            <li><strong className="text-foreground">Our VPS</strong> — FastAPI, PostgreSQL, Redis, and Manticore run on a self-hosted private VPS.</li>
          </ul>
        </div>

        {/* Section 6 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8 bg-muted/20 dark:bg-muted/5">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">6. Data Retention</h2>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Account data</strong> — retained until you request deletion.</li>
            <li><strong className="text-foreground">Usage counters</strong> — reset monthly; historical totals retained for analytics.</li>
            <li><strong className="text-foreground">AI Tutor logs</strong> — retained up to 90 days for abuse monitoring, then deleted.</li>
            <li><strong className="text-foreground">Refresh tokens</strong> — expire after 7 days and are purged from Redis automatically.</li>
            <li><strong className="text-foreground">Subscription history</strong> — retained for a minimum of 5 years for financial compliance.</li>
          </ul>
        </div>

        {/* Section 7 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">7. Data Security</h2>
          <p className="text-muted-foreground leading-relaxed">
            We implement industry-standard security: TLS/HTTPS for all data in transit, bcrypt password hashing, JWT signing with secure keys, Redis-based refresh token rotation, rate limiting, and IP-based abuse detection. No system is completely secure — we will notify affected users promptly in the event of a data breach.
          </p>
        </div>

        {/* Section 8 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8 bg-muted/20 dark:bg-muted/5">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">8. Your Data Rights</h2>
          <p className="text-muted-foreground leading-relaxed mb-3">Depending on your location, you may have rights under applicable law (GDPR, CCPA):</p>
          <ul className="list-disc pl-5 space-y-2 text-muted-foreground">
            <li><strong className="text-foreground">Access</strong> — request a copy of your personal data.</li>
            <li><strong className="text-foreground">Rectification</strong> — request correction of inaccurate data.</li>
            <li><strong className="text-foreground">Erasure</strong> — request deletion of your account and data.</li>
            <li><strong className="text-foreground">Restriction</strong> — request limits on how we process your data.</li>
            <li><strong className="text-foreground">Portability</strong> — request an export of your data.</li>
            <li><strong className="text-foreground">Object</strong> — object to processing for certain purposes.</li>
            <li><strong className="text-foreground">Withdraw Consent</strong> — withdraw consent at any time where processing is consent-based.</li>
          </ul>
          <p className="text-muted-foreground mt-3">
            Contact us at{' '}
            <a href="mailto:support@pokispokey.com" className="text-orange-500 hover:underline">support@pokispokey.com</a>. We respond within 30 days.
          </p>
        </div>

        {/* Section 9 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">9. Children's Privacy</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service is not directed to children under 13. If we become aware that a child under 13 has provided personal data, we will delete it promptly. Contact us at{' '}
            <a href="mailto:support@pokispokey.com" className="text-orange-500 hover:underline">support@pokispokey.com</a>.
          </p>
        </div>

        {/* Section 10 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8 bg-muted/20 dark:bg-muted/5">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">10. Changes to This Policy</h2>
          <p className="text-muted-foreground leading-relaxed">
            We may update this policy from time to time. We will update the "Last updated" date and notify registered users of material changes via email or an in-app notice.
          </p>
        </div>

        {/* Section 11 — Contact footer box */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <DecorIcon position="bottom-right" />
          <h2 className="text-xl font-bold text-foreground mb-3">11. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions or requests? Reach us at{' '}
            <a href="mailto:support@pokispokey.com" className="text-orange-500 hover:underline">support@pokispokey.com</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
