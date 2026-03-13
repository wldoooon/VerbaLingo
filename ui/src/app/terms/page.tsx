import React from 'react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "PokiSpokey terms of service and usage conditions.",
};

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pt-14 lg:pt-0">
            <main className="max-w-4xl mx-auto px-6 py-24">
                <div className="mb-16">
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground mb-6">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Last updated: March 13, 2026
                    </p>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12">

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">1. Acceptance of Terms</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            By accessing or using PokiSpokey ("the Service," "we," "us," or "our"), you agree to be bound by these Terms of Service ("Terms") and our Privacy Policy. If you do not agree to all of these Terms, you must not use or access the Service. These Terms constitute a legally binding agreement between you and PokiSpokey. We reserve the right to update these Terms at any time; continued use of the Service after any change constitutes your acceptance of the updated Terms.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">2. Description of Service</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>
                                PokiSpokey is an AI-powered language learning platform that allows users to search for words and phrases across a curated index of real-world YouTube video transcripts — including movies, TV shows, podcasts, cartoons, news segments, and documentary talks — and watch the exact moment those words appear in context.
                            </p>
                            <p>The core features of the Service include:</p>
                            <ul className="list-disc pl-6 space-y-3 mt-4">
                                <li><strong className="text-foreground">Transcript Search:</strong> Full-text search across our indexed video dataset, supporting multiple languages including English, German, and French, with category filters (Movies, TV Shows, Podcasts, Cartoons, News, Talks).</li>
                                <li><strong className="text-foreground">Contextual Video Playback:</strong> Playback of YouTube video clips at the precise timestamp where your searched word or phrase appears, with transcript highlighting synchronized to playback.</li>
                                <li><strong className="text-foreground">AI Chat Companion:</strong> An AI-powered conversational assistant ("AI Tutor") that you can engage with directly within a clip's context to ask questions about vocabulary, grammar, pronunciation, cultural nuance, or translation. Powered by large language models via the Groq API.</li>
                                <li><strong className="text-foreground">AI Sparks:</strong> A token-based credit system that governs AI Tutor usage. Each AI interaction consumes a number of Sparks proportional to the tokens used. Sparks reset monthly according to your subscription tier.</li>
                                <li><strong className="text-foreground">Usage Analytics:</strong> Tracking of your monthly search count, AI chat count, and Sparks balance to provide you transparency over your usage.</li>
                                <li><strong className="text-foreground">Browser Extension:</strong> An optional Chrome extension (Plasmo-based, Manifest V3) that enhances in-browser language learning functionality.</li>
                            </ul>
                            <p>
                                The Service is provided "as is" and is subject to change at our sole discretion. We do not guarantee continuous, uninterrupted access to the Service and accept no liability for downtime, errors, or data loss.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">3. Eligibility and User Accounts</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>You must be at least 13 years of age to use PokiSpokey. By using the Service, you represent and warrant that you meet this age requirement.</p>
                            <p>To access most features, you must register for an account. You may register using your email address and a password, or via Google OAuth. When creating an account, you agree to:</p>
                            <ul className="list-disc pl-6 space-y-3 mt-4">
                                <li>Provide accurate, current, and complete registration information.</li>
                                <li>Maintain the security of your password and accept responsibility for all activities that occur under your account.</li>
                                <li>Notify us immediately of any unauthorized access to or use of your account.</li>
                                <li>Not create multiple accounts to circumvent usage limits or other restrictions.</li>
                                <li>Not share your account credentials with any third party.</li>
                            </ul>
                            <p>We reserve the right to disable any account at our discretion.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">4. Subscription Plans and AI Sparks</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>PokiSpokey offers both a free tier and paid subscription plans. The current tiers are:</p>
                            <ul className="list-disc pl-6 space-y-3 mt-4">
                                <li><strong className="text-foreground">Free Starter:</strong> 50,000 AI Sparks and 100 searches per month at no cost.</li>
                                <li><strong className="text-foreground">Basic Learner ($4.99/month or $49.90/year):</strong> 800,000 AI Sparks and 500 searches per month.</li>
                                <li><strong className="text-foreground">Pro Student ($8.99/month or $89.90/year):</strong> 5,000,000 AI Sparks and 2,000 searches per month.</li>
                                <li><strong className="text-foreground">Scholar Max ($14.99/month or $149.90/year):</strong> 15,000,000 AI Sparks and unlimited searches per month.</li>
                                <li><strong className="text-foreground">VIP Unlimited ($18.99/month or $189.90/year):</strong> Unlimited AI Sparks and unlimited searches per month.</li>
                            </ul>
                            <p>
                                AI Sparks are a consumable in-platform credit. 1 Spark equals 1 AI token consumed. Sparks reset automatically at the start of each monthly billing cycle. Unused Sparks do not roll over to the following month. Sparks have no cash value and cannot be transferred, sold, or exchanged.
                            </p>
                            <p>
                                Annual plans are billed as a single upfront charge equivalent to 10 months of the monthly rate (2 months free). Tier features and limits are subject to change; we will provide reasonable notice of any material changes to existing subscribers.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">5. Payments, Billing, and Cancellation</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>
                                All payments for paid subscriptions are processed exclusively through <strong className="text-foreground">Polar.sh</strong>, our third-party payment infrastructure provider. By subscribing to a paid plan, you agree to Polar's terms of service and payment processing policies in addition to these Terms.
                            </p>
                            <p>
                                By initiating a paid subscription, you authorize PokiSpokey and Polar to charge your designated payment method for the applicable subscription fee on a recurring basis (monthly or annually, depending on your selected billing cycle). Your subscription will automatically renew at the end of each billing period unless you cancel it before the renewal date.
                            </p>
                            <p>Regarding billing and cancellation:</p>
                            <ul className="list-disc pl-6 space-y-3 mt-4">
                                <li>You may cancel your subscription at any time through the billing portal accessible from your account settings.</li>
                                <li>Upon cancellation, your paid access continues until the end of the current billing period. Your account will then revert to the Free Starter tier.</li>
                                <li>All payments are final and non-refundable, except where required by applicable law or expressly stated in a promotional offer.</li>
                                <li>We reserve the right to change subscription pricing with 30 days' notice to existing subscribers. Continued use after the effective date of a price change constitutes acceptance of the new price.</li>
                                <li>In the event of a failed payment, we may suspend or downgrade your account after a reasonable grace period.</li>
                            </ul>
                            <p>
                                PokiSpokey does not directly store your payment card details. All sensitive payment data is handled by Polar.sh in accordance with PCI-DSS compliance standards.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">6. Acceptable Use Policy</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>You agree to use the Service only for lawful purposes and in a manner that does not infringe the rights of others. You must not:</p>
                            <ul className="list-disc pl-6 space-y-3 mt-4">
                                <li>Reverse engineer, decompile, disassemble, or attempt to extract the source code of the Service or its underlying AI models.</li>
                                <li>Scrape, crawl, or programmatically harvest transcript data, search results, or video metadata from our platform without explicit written permission.</li>
                                <li>Use automated scripts, bots, or any non-human means to perform searches, consume AI credits, or interact with the Service.</li>
                                <li>Attempt to bypass, circumvent, or disable any usage limits, rate limits, authentication mechanisms, or security controls.</li>
                                <li>Create fake accounts or exploit free-tier limits fraudulently.</li>
                                <li>Use the AI Tutor to generate content that is illegal, harmful, abusive, harassing, defamatory, or otherwise objectionable.</li>
                                <li>Upload, transmit, or introduce malware, viruses, or any other malicious code into the Service or its infrastructure.</li>
                                <li>Interfere with or disrupt the integrity, performance, or availability of the Service or servers connected to the Service.</li>
                                <li>Use the Service in violation of any applicable local, national, or international law or regulation.</li>
                            </ul>
                            <p>Violations of this policy may result in immediate account termination without refund.</p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">7. Intellectual Property</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>
                                The PokiSpokey platform, including its design, software, AI systems, branding, and original content, is the exclusive intellectual property of PokiSpokey and is protected by international copyright, trademark, and intellectual property laws. You are granted a limited, non-exclusive, non-transferable, revocable license to access and use the Service for personal, non-commercial language learning purposes only.
                            </p>
                            <p>
                                Video content indexed by PokiSpokey belongs to the respective YouTube content creators and is subject to YouTube's Terms of Service. PokiSpokey does not host, store, or redistribute video files. Playback is delivered via the YouTube IFrame API in accordance with YouTube's API Terms of Service. We do not claim ownership of any third-party video content.
                            </p>
                            <p>
                                Transcript data in our search index has been processed and structured by PokiSpokey. This structured dataset, including our search index and AI-enriched metadata, is proprietary to PokiSpokey.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">8. AI-Generated Content Disclaimer</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>
                                The AI Tutor feature generates responses using large language models (currently powered by the Groq API). AI-generated content is provided for educational and informational purposes only. PokiSpokey makes no warranties regarding the accuracy, completeness, or suitability of any AI-generated response.
                            </p>
                            <p>
                                You acknowledge that AI language models can produce incorrect, outdated, or contextually inappropriate responses. Do not rely solely on AI Tutor output for critical decisions. Responses do not constitute professional linguistic, legal, medical, or other professional advice.
                            </p>
                            <p>
                                Your conversations with the AI Tutor may be logged for the purpose of monitoring system performance, detecting abuse, and improving service quality. We do not use your conversations to train external AI models.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">9. Third-Party Services and Links</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            The Service integrates with third-party services including YouTube (video delivery), Polar.sh (payment processing), Groq (AI inference), and Vercel (frontend hosting). Your use of these integrations is governed by the respective third-party terms and privacy policies. PokiSpokey is not responsible for the content, practices, or policies of any third-party service. We are not liable for any damages or losses caused by your use of third-party services accessed through or in connection with the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">10. Disclaimer of Warranties</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            The Service is provided on an "as is" and "as available" basis without any warranties of any kind, either express or implied, including but not limited to implied warranties of merchantability, fitness for a particular purpose, non-infringement, or uninterrupted operation. We do not warrant that the Service will be free of errors, that defects will be corrected, or that the Service or the servers that make it available are free of viruses or other harmful components.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">11. Limitation of Liability</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed font-semibold uppercase tracking-wide">
                            To the maximum extent permitted by applicable law, in no event shall PokiSpokey, its founders, employees, partners, agents, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages — including without limitation loss of profits, data, goodwill, or other intangible losses — arising out of or related to your access to or use of (or inability to access or use) the Service, any content obtained from the Service, any AI-generated output, unauthorized access to or alteration of your transmissions or data, or any other matter relating to the Service. Our total aggregate liability to you for all claims arising from or related to the Service shall not exceed the greater of (a) the amount you paid to PokiSpokey in the twelve months preceding the claim, or (b) $10 USD.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">12. Termination</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>
                                We may suspend or terminate your account and access to the Service immediately, without prior notice or liability, for any breach of these Terms or for any other reason we deem appropriate in our sole discretion.
                            </p>
                            <p>
                                You may terminate your account at any time by contacting us or using the account deletion option in your settings. Upon termination, all licenses and rights granted to you under these Terms will immediately cease. We may retain certain data as required by law or for legitimate business purposes after termination.
                            </p>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">13. Governing Law</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            These Terms shall be governed by and construed in accordance with applicable law. Any dispute arising from or relating to these Terms or the Service that cannot be resolved informally shall be submitted to binding arbitration or the courts of competent jurisdiction. Nothing in these Terms limits your statutory rights as a consumer under applicable local law.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">14. Contact</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            If you have any questions about these Terms of Service, please contact us at{' '}
                            <a href="mailto:support@pokispokey.com" className="text-primary hover:underline">support@pokispokey.com</a>.
                        </p>
                    </section>

                </div>
            </main>
        </div>
    );
}
