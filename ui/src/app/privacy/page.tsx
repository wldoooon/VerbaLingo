import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pt-14 lg:pt-0">
            <main className="max-w-4xl mx-auto px-6 py-24">
                <div className="mb-16">
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground mb-6">
                        Privacy Policy
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12">
                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">1. Introduction</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            At PokiSpokey, your privacy is paramount. This Privacy Policy details the types of personal information we collect, how we use it, your rights regarding this data, and the steps we take to protect your privacy when you use our language learning platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">2. The Information We Collect</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>We collect information to provide better services to all our users. The info we collect includes:</p>
                            <ul className="list-disc pl-6 space-y-4 mt-4">
                                <li>
                                    <strong className="text-foreground">Identity Data:</strong> When you sign up, we collect your name, email address, and profile picture provided through our authentication providers.
                                </li>
                                <li>
                                    <strong className="text-foreground">Usage Data:</strong> We track your learning progress, including languages studied, videos saved to your library, and interactions with the AI Tutor, to personalize your experience.
                                </li>
                                <li>
                                    <strong className="text-foreground">Technical Data:</strong> We automatically collect standard internet log information, including your IP address, browser type, and device identifiers to ensure platform stability and security.
                                </li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">3. How We Use Your Data</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>We do not sell your personal data. We use the information we collect strictly to:</p>
                            <ul className="list-disc pl-6 space-y-3 mt-4">
                                <li>Provide, operate, and maintain the PokiSpokey Service.</li>
                                <li>Improve the accuracy and helpfulness of the AI Tutor.</li>
                                <li>Process payments and manage your premium subscriptions.</li>
                                <li>Send you technical notices, updates, security alerts, and administrative messages.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">4. Third-Party Services</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            To operate PokiSpokey effectively, we share necessary data with trusted third-party service providers. This includes our database and authentication provider (Supabase), our cloud hosting infrastructure (Vercel), and secure payment processors (e.g., Stripe). These partners adhere to strict data protection standards and are prohibited from using your data for any other purpose.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">5. Cookies and Tracking</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with small amounts of data which may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept essential authentication cookies, you will not be able to log in or use secured portions of our Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">6. Data Security</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We utilize industry-standard security measures, including encryption in transit and at rest, to protect your personal information from unauthorized access, alteration, disclosure, or destruction. We regularly review our data collection, storage, and processing practices.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">7. Your Data Rights</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Under applicable laws (such as GDPR and CCPA), you have the right to access, update, or delete the personal information we hold about you. You can manage your profile data directly within the app's Settings menu. If you wish to invoke your "Right to be Forgotten" and completely erase your account and associated data from our servers, please contact us at <a href="mailto:support@pokispokey.com" className="text-primary hover:underline">support@pokispokey.com</a>.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
