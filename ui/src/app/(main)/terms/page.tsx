import React from 'react';
import { Metadata } from 'next';
import { DecorIcon } from '@/components/ui/decor-icon';

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "PokiSpokey terms of service and usage conditions.",
};

export default function TermsPage() {
  return (
    <div className="py-10 px-4">
      <div className="max-w-4xl mx-auto border-t border-l border-border/40">

        {/* Header */}
        <div className="relative border-r border-b border-border/40 px-10 py-14">
          <DecorIcon position="top-left" />
          <DecorIcon position="top-right" />
          <DecorIcon position="bottom-left" />
          <DecorIcon position="bottom-right" />
          <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-foreground mb-4">
            Terms of Service
          </h1>
          <p className="text-sm text-muted-foreground">Last updated: March 13, 2026</p>
        </div>

        {/* Section 1 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
          <p className="text-muted-foreground leading-relaxed">
            By accessing or using PokiSpokey ("the Service"), you agree to be bound by these Terms of Service and our Privacy Policy. If you do not agree, you must not use the Service. We reserve the right to update these Terms at any time; continued use after any change constitutes acceptance.
          </p>
        </div>

        {/* Section 2 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8 bg-muted/20 dark:bg-muted/5">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">2. Description of Service</h2>
          <div className="text-muted-foreground leading-relaxed space-y-3">
            <p>PokiSpokey is an AI-powered language learning platform that lets users search words and phrases across real-world YouTube video transcripts and watch the exact moment in context.</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong className="text-foreground">Transcript Search</strong> — full-text search across our indexed dataset in multiple languages with category filters.</li>
              <li><strong className="text-foreground">Contextual Video Playback</strong> — YouTube clips at the precise timestamp with synchronized transcript highlighting.</li>
              <li><strong className="text-foreground">AI Chat Companion</strong> — conversational AI assistant for vocabulary, grammar, pronunciation, and translation questions.</li>
              <li><strong className="text-foreground">AI Sparks</strong> — a token-based credit system governing AI Tutor usage. Sparks reset monthly.</li>
              <li><strong className="text-foreground">Browser Extension</strong> — optional Chrome extension (Plasmo, Manifest V3) for in-browser learning.</li>
            </ul>
          </div>
        </div>

        {/* Section 3 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">3. Eligibility and User Accounts</h2>
          <div className="text-muted-foreground leading-relaxed space-y-3">
            <p>You must be at least 13 years of age to use PokiSpokey. When creating an account, you agree to:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Provide accurate, current, and complete registration information.</li>
              <li>Maintain the security of your password and accept responsibility for all activities under your account.</li>
              <li>Notify us immediately of any unauthorized access.</li>
              <li>Not create multiple accounts to circumvent usage limits.</li>
              <li>Not share your account credentials with any third party.</li>
            </ul>
          </div>
        </div>

        {/* Section 4 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8 bg-muted/20 dark:bg-muted/5">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">4. Subscription Plans and AI Sparks</h2>
          <div className="text-muted-foreground leading-relaxed space-y-3">
            <ul className="list-disc pl-5 space-y-2">
              <li><strong className="text-foreground">Free Starter:</strong> 50,000 AI Sparks and 100 searches/month — free forever.</li>
              <li><strong className="text-foreground">Basic ($4.99/mo):</strong> 800,000 Sparks, 500 searches/month.</li>
              <li><strong className="text-foreground">Pro ($8.99/mo):</strong> 5,000,000 Sparks, 2,000 searches/month.</li>
              <li><strong className="text-foreground">Scholar Max ($14.99/mo):</strong> 15,000,000 Sparks, unlimited searches.</li>
              <li><strong className="text-foreground">VIP Unlimited ($18.99/mo):</strong> Unlimited Sparks and searches.</li>
            </ul>
            <p>AI Sparks are consumable credits (1 Spark = 1 AI token). They reset monthly and have no cash value — they cannot be transferred, sold, or exchanged.</p>
          </div>
        </div>

        {/* Section 5 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">5. Payments, Billing, and Cancellation</h2>
          <div className="text-muted-foreground leading-relaxed space-y-3">
            <p>All payments are processed by <strong className="text-foreground">Polar.sh</strong>. By subscribing, you authorize recurring charges on your billing cycle.</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>You may cancel anytime; paid access continues until the end of the current billing period.</li>
              <li>All payments are final and non-refundable except where required by law.</li>
              <li>We reserve the right to change pricing with 30 days' notice to existing subscribers.</li>
              <li>Failed payments may result in account suspension after a grace period.</li>
            </ul>
          </div>
        </div>

        {/* Section 6 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8 bg-muted/20 dark:bg-muted/5">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">6. Acceptable Use Policy</h2>
          <div className="text-muted-foreground leading-relaxed space-y-3">
            <p>You must not:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Reverse engineer or attempt to extract the source code of the Service.</li>
              <li>Scrape, crawl, or programmatically harvest transcript data or search results.</li>
              <li>Use bots or automated scripts to perform searches or consume AI credits.</li>
              <li>Attempt to bypass usage limits, rate limits, or security controls.</li>
              <li>Create fake accounts or exploit free-tier limits fraudulently.</li>
              <li>Use the AI Tutor to generate illegal, harmful, or abusive content.</li>
              <li>Interfere with or disrupt the integrity or availability of the Service.</li>
            </ul>
            <p>Violations may result in immediate account termination without refund.</p>
          </div>
        </div>

        {/* Section 7 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">7. Intellectual Property</h2>
          <div className="text-muted-foreground leading-relaxed space-y-3">
            <p>The PokiSpokey platform, including its design, software, AI systems, and branding, is our exclusive intellectual property. You are granted a limited, non-exclusive, revocable license to use the Service for personal language learning purposes only.</p>
            <p>Video content belongs to respective YouTube creators and is subject to YouTube's Terms. PokiSpokey does not host or redistribute video files — playback is via the YouTube IFrame API.</p>
          </div>
        </div>

        {/* Section 8 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8 bg-muted/20 dark:bg-muted/5">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">8. AI-Generated Content Disclaimer</h2>
          <div className="text-muted-foreground leading-relaxed space-y-3">
            <p>AI Tutor responses are provided for educational purposes only. PokiSpokey makes no warranties regarding accuracy or completeness of AI-generated content. Do not rely solely on AI Tutor output for critical decisions.</p>
            <p>Your conversations may be logged for abuse monitoring and service quality. We do not use your conversations to train external AI models.</p>
          </div>
        </div>

        {/* Section 9 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">9. Third-Party Services and Links</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service integrates with YouTube, Polar.sh, Groq, and Vercel. Your use of these integrations is governed by the respective third-party terms. PokiSpokey is not responsible for any damages or losses caused by third-party services.
          </p>
        </div>

        {/* Section 10 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8 bg-muted/20 dark:bg-muted/5">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">10. Disclaimer of Warranties</h2>
          <p className="text-muted-foreground leading-relaxed">
            The Service is provided "as is" and "as available" without warranties of any kind — express or implied — including merchantability, fitness for a particular purpose, or uninterrupted operation.
          </p>
        </div>

        {/* Section 11 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">11. Limitation of Liability</h2>
          <p className="text-muted-foreground leading-relaxed">
            To the maximum extent permitted by law, PokiSpokey shall not be liable for any indirect, incidental, special, or consequential damages. Our total aggregate liability shall not exceed the greater of (a) the amount you paid us in the twelve months preceding the claim, or (b) $10 USD.
          </p>
        </div>

        {/* Section 12 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8 bg-muted/20 dark:bg-muted/5">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">12. Termination</h2>
          <div className="text-muted-foreground leading-relaxed space-y-3">
            <p>We may suspend or terminate your account immediately for any breach of these Terms or for any reason at our sole discretion.</p>
            <p>You may delete your account at any time via your account settings. Upon termination, all licenses granted under these Terms cease immediately.</p>
          </div>
        </div>

        {/* Section 13 */}
        <div className="relative border-r border-b border-border/40 px-10 py-8">
          <DecorIcon position="top-left" />
          <h2 className="text-xl font-bold text-foreground mb-3">13. Governing Law</h2>
          <p className="text-muted-foreground leading-relaxed">
            These Terms shall be governed by applicable law. Any dispute that cannot be resolved informally shall be submitted to binding arbitration or courts of competent jurisdiction. Nothing in these Terms limits your statutory rights as a consumer under applicable local law.
          </p>
        </div>

        {/* Section 14 — Contact footer box */}
        <div className="relative border-r border-b border-border/40 px-10 py-8 bg-muted/20 dark:bg-muted/5">
          <DecorIcon position="top-left" />
          <DecorIcon position="bottom-right" />
          <h2 className="text-xl font-bold text-foreground mb-3">14. Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Questions about these Terms? Reach us at{' '}
            <a href="mailto:support@pokispokey.com" className="text-orange-500 hover:underline">support@pokispokey.com</a>.
          </p>
        </div>

      </div>
    </div>
  );
}
