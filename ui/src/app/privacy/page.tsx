import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "PokiSpokey privacy policy — how we collect, use, and protect your data.",
};

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pt-14 lg:pt-0">
            <main className="max-w-4xl mx-auto px-6 py-24">
                <div className="mb-16">
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Last updated: March 13, 2026
                    </p>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12">

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">1. Introduction</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            PokiSpokey ("we," "us," or "our") is committed to protecting your privacy. This Privacy Policy explains what personal data we collect when you use our language learning platform, how we use and store it, who we share it with, and what rights you have over your data. By using the Service, you consent to the practices described in this policy. If you do not agree, please do not use the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">2. Information We Collect</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>We collect the following categories of information:</p>

                            <h3 className="text-2xl font-semibold text-foreground mt-6 mb-2">2.1 Account and Identity Data</h3>
                            <ul className="list-disc pl-6 space-y-3">
                                <li><strong className="text-foreground">Email address</strong> — collected at registration, used for authentication and service communications.</li>
                                <li><strong className="text-foreground">Display name</strong> — provided by you or derived from your Google account if you sign in via Google OAuth.</li>
                                <li><strong className="text-foreground">Profile picture URL</strong> — optionally provided via Google OAuth; stored as a reference URL only.</li>
                                <li><strong className="text-foreground">Password hash</strong> — if you register with email/password, we store a bcrypt-hashed version of your password. We never store your plain-text password.</li>
                                <li><strong className="text-foreground">Subscription tier</strong> — your current plan (Free, Basic, Pro, Scholar Max, or VIP Unlimited).</li>
                            </ul>

                            <h3 className="text-2xl font-semibold text-foreground mt-6 mb-2">2.2 Usage and Activity Data</h3>
                            <ul className="list-disc pl-6 space-y-3">
                                <li><strong className="text-foreground">Search queries</strong> — the words and phrases you search for, along with the language and category filters selected. Stored to power search history and usage analytics.</li>
                                <li><strong className="text-foreground">AI Tutor conversations</strong> — messages you send to the AI Tutor and the responses generated, associated with your account for context and logged for abuse monitoring.</li>
                                <li><strong className="text-foreground">Usage counters</strong> — monthly counts of searches performed, AI chat sessions initiated, and AI Sparks (tokens) consumed. These counters reset monthly and are used to enforce your plan's limits.</li>
                                <li><strong className="text-foreground">Language and category preferences</strong> — your last-used search language and category filters, persisted to improve your experience across sessions.</li>
                            </ul>

                            <h3 className="text-2xl font-semibold text-foreground mt-6 mb-2">2.3 Technical and Device Data</h3>
                            <ul className="list-disc pl-6 space-y-3">
                                <li><strong className="text-foreground">IP address</strong> — logged on authentication events and API requests for security and rate-limiting purposes.</li>
                                <li><strong className="text-foreground">Browser type and version</strong> — collected to ensure platform compatibility and diagnose technical issues.</li>
                                <li><strong className="text-foreground">Device type and operating system</strong> — used for analytics and debugging.</li>
                                <li><strong className="text-foreground">Referrer URL and page navigation patterns</strong> — used for understanding how users discover and move through the Service.</li>
                            </ul>

                            <h3 className="text-2xl font-semibold text-foreground mt-6 mb-2">2.4 Payment and Billing Data</h3>
                            <p>
                                Payment processing is handled exclusively by <strong className="text-foreground">Polar.sh</strong>. We do not collect, see, or store your full credit card number, CVV, or bank account details. PokiSpokey only stores:
                            </p>
                            <ul className="list-disc pl-6 space-y-3 mt-3">
                                <li><strong className="text-foreground">Polar Customer ID</strong> — a unique identifier assigned by Polar that links your PokiSpokey account to your Polar billing identity. This is permanent and persists even if you cancel and resubscribe.</li>
                                <li><strong className="text-foreground">Subscription records</strong> — the history of your subscriptions including plan, status (active, canceled, revoked), billing period dates, and cancellation date if applicable.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">3. How We Use Your Data</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>We use the data we collect strictly for the following purposes. We do not sell your personal data to any third party.</p>
                            <ul className="list-disc pl-6 space-y-3 mt-4">
                                <li><strong className="text-foreground">Service delivery:</strong> To authenticate you, personalize your experience, serve search results, deliver video playback, and operate the AI Tutor.</li>
                                <li><strong className="text-foreground">Usage limit enforcement:</strong> To track your monthly search count and Sparks balance, enforce plan-based rate limits, and display your usage statistics in the dashboard.</li>
                                <li><strong className="text-foreground">Billing and subscription management:</strong> To process payments via Polar, manage subscription lifecycle events (creation, renewal, cancellation, revocation), and update your account tier accordingly.</li>
                                <li><strong className="text-foreground">Security and fraud prevention:</strong> To detect and prevent unauthorized access, abuse of the free tier, automated scraping, and other malicious activity.</li>
                                <li><strong className="text-foreground">Service improvement:</strong> To understand aggregate usage patterns, identify features that are used heavily or rarely, and prioritize platform improvements. We use anonymized and aggregated data for this purpose.</li>
                                <li><strong className="text-foreground">Communications:</strong> To send you transactional emails such as email verification codes (OTP), password reset links, and billing receipts. We do not send unsolicited marketing emails without your explicit opt-in.</li>
                                <li><strong className="text-foreground">Legal compliance:</strong> To comply with applicable laws, respond to lawful requests from authorities, and enforce our Terms of Service.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">4. Authentication and Session Management</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>
                                PokiSpokey uses a stateless JWT (JSON Web Token) authentication system. When you log in, we issue a short-lived access token (30 minutes) and a longer-lived refresh token (7 days). The refresh token is stored securely in Redis and rotated on each use (refresh token rotation). This means each refresh generates a new refresh token, and the old one is immediately invalidated.
                            </p>
                            <p>
                                Access tokens are stored in your browser's memory or secure cookie storage and are used to authenticate requests to our API. We do not use persistent tracking cookies for advertising purposes. The only cookies we set are strictly necessary for authentication and maintaining your logged-in session.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">5. Third-Party Services We Use</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>To operate PokiSpokey, we work with the following third-party providers. Each has access only to the data necessary to perform their specific function.</p>
                            <ul className="list-disc pl-6 space-y-4 mt-4">
                                <li>
                                    <strong className="text-foreground">Polar.sh (Payment Processing):</strong> Handles all payment card data, subscription billing, and invoicing. Polar is PCI-DSS compliant. When you subscribe, you interact directly with Polar's checkout interface. Polar's privacy policy governs the data they collect during payment.
                                </li>
                                <li>
                                    <strong className="text-foreground">Groq (AI Inference):</strong> Powers the AI Tutor feature. When you send a message to the AI Tutor, the conversation context is transmitted to Groq's API to generate a response. Groq's data retention and privacy policies apply to this processing. We do not send personally identifiable information to Groq beyond what is contained in your message.
                                </li>
                                <li>
                                    <strong className="text-foreground">YouTube / Google (Video Delivery):</strong> Video playback is delivered via the YouTube IFrame API. When you watch a video clip, YouTube may set its own cookies and collect data about your viewing activity in accordance with Google's Privacy Policy. We have no control over YouTube's data collection practices.
                                </li>
                                <li>
                                    <strong className="text-foreground">Vercel (Frontend Hosting):</strong> Our Next.js frontend is hosted on Vercel. Vercel may collect standard server logs including IP addresses for infrastructure operation purposes.
                                </li>
                                <li>
                                    <strong className="text-foreground">Our own VPS / Docker infrastructure (Backend):</strong> Our FastAPI backend, PostgreSQL database, Redis cache, and Manticore search engine run on a private VPS. All data is stored within this self-hosted environment. We do not use third-party cloud databases for your core account data.
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">6. Data Retention</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>We retain your data for as long as your account is active or as needed to provide the Service. Specifically:</p>
                            <ul className="list-disc pl-6 space-y-3 mt-4">
                                <li><strong className="text-foreground">Account data</strong> is retained until you request account deletion.</li>
                                <li><strong className="text-foreground">Usage counters</strong> (search count, Sparks balance) reset monthly but historical totals are retained for analytics.</li>
                                <li><strong className="text-foreground">AI Tutor conversation logs</strong> may be retained for up to 90 days for abuse monitoring purposes, then deleted.</li>
                                <li><strong className="text-foreground">Authentication refresh tokens</strong> expire after 7 days of inactivity and are purged from Redis automatically.</li>
                                <li><strong className="text-foreground">Subscription history</strong> is retained for a minimum of 5 years for financial record-keeping compliance.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">7. Data Security</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We implement industry-standard security measures to protect your data. These include: TLS/HTTPS encryption for all data in transit between your browser and our servers; bcrypt password hashing with appropriate cost factors; JWT token signing with secure secret keys; Redis-based refresh token rotation to limit the window of token compromise; server-side rate limiting and IP-based abuse detection; and access controls limiting which systems and personnel can access production data. Despite these measures, no system is completely secure. We cannot guarantee absolute security and will notify affected users promptly in the event of a data breach that poses a risk to their rights.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">8. Your Data Rights</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>Depending on your location, you may have the following rights regarding your personal data under applicable law (including GDPR for EU residents and CCPA for California residents):</p>
                            <ul className="list-disc pl-6 space-y-3 mt-4">
                                <li><strong className="text-foreground">Right of Access:</strong> Request a copy of the personal data we hold about you.</li>
                                <li><strong className="text-foreground">Right to Rectification:</strong> Request correction of inaccurate or incomplete data.</li>
                                <li><strong className="text-foreground">Right to Erasure ("Right to be Forgotten"):</strong> Request deletion of your account and associated personal data from our systems.</li>
                                <li><strong className="text-foreground">Right to Restriction:</strong> Request that we limit processing of your data in certain circumstances.</li>
                                <li><strong className="text-foreground">Right to Data Portability:</strong> Request an export of your data in a structured, machine-readable format.</li>
                                <li><strong className="text-foreground">Right to Object:</strong> Object to processing of your personal data for certain purposes.</li>
                                <li><strong className="text-foreground">Right to Withdraw Consent:</strong> Where processing is based on consent, withdraw that consent at any time.</li>
                            </ul>
                            <p>
                                To exercise any of these rights, please contact us at{' '}
                                <a href="mailto:support@pokispokey.com" className="text-primary hover:underline">support@pokispokey.com</a>.
                                We will respond to verified requests within 30 days. Note that deleting your account will immediately terminate your access to the Service and any remaining paid subscription credits will not be refunded.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">9. Children's Privacy</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            The Service is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we become aware that a child under 13 has provided us with personal data, we will take steps to delete that information promptly. If you are a parent or guardian and believe your child has provided us with personal information, please contact us at{' '}
                            <a href="mailto:support@pokispokey.com" className="text-primary hover:underline">support@pokispokey.com</a>.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">10. Changes to This Policy</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We may update this Privacy Policy from time to time. When we do, we will update the "Last updated" date at the top of this page. For material changes, we will make reasonable efforts to notify registered users via email or an in-app notice. Your continued use of the Service after any change constitutes your acceptance of the updated policy.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">11. Contact</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us at{' '}
                            <a href="mailto:support@pokispokey.com" className="text-primary hover:underline">support@pokispokey.com</a>.
                        </p>
                    </section>

                </div>
            </main>
        </div>
    );
}
