import React from 'react';

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background text-foreground pt-14 lg:pt-0">
            <main className="max-w-4xl mx-auto px-6 py-24">
                <div className="mb-16">
                    <h1 className="text-4xl lg:text-6xl font-black tracking-tight text-foreground mb-6">
                        Terms of Service
                    </h1>
                    <p className="text-lg text-muted-foreground">
                        Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                </div>

                <div className="prose prose-zinc dark:prose-invert max-w-none space-y-12">
                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">1. Acceptance of Terms</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            By accessing and using PokiSpokey ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to all of the terms and conditions stated herein, you must not use or access the Service. This agreement constitutes a legally binding contract between you and PokiSpokey.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">2. Description of Service</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            PokiSpokey provides a language learning platform featuring video indexing, an AI Tutor companion, and related tools designed to improve language fluency in real-world contexts. The Service is provided "as is" and is subject to change at our sole discretion.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">3. User Accounts</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>You must register for an account to access certain features of the Service. When creating an account, you agree to:</p>
                            <ul className="list-disc pl-6 space-y-3">
                                <li>Provide accurate and complete information.</li>
                                <li>Maintain the security of your account credentials.</li>
                                <li>Accept responsibility for all activities occurring under your account.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">4. Acceptable Use Policy</h2>
                        <div className="text-xl text-muted-foreground leading-relaxed space-y-4">
                            <p>You agree not to misuse the Service or help anyone else do so. For example, you must not:</p>
                            <ul className="list-disc pl-6 space-y-3">
                                <li>Attempt to reverse engineer, scrape, or otherwise extract source code or raw video data from the platform.</li>
                                <li>Use the Service for any illegal or unauthorized purpose.</li>
                                <li>Interfere with or disrupt the integrity or performance of the Service or its underlying infrastructure.</li>
                                <li>Upload or transmit viruses, malware, or any other destructive code.</li>
                            </ul>
                        </div>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">5. Intellectual Property</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            The Service and its original content, specific features, and functionality are legally owned by PokiSpokey and are protected by international copyright, trademark, and other intellectual property laws. Users are granted a limited, personal, non-commercial license to interact with the platform.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">6. Subscriptions and Payments</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Access to premium features requires a paid subscription. You authorize us to charge your selected payment method for these fees. Subscriptions auto-renew unless canceled before the renewal date. All payments are non-refundable except where expressly stated or legally required.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">7. Limitation of Liability</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed font-semibold uppercase tracking-wide">
                            In no event shall PokiSpokey, nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from (I) your access to or use of or inability to access or use the Service; (II) any conduct or content of any third party on the Service.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-3xl font-bold tracking-tight text-foreground mb-4">8. Termination</h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
                        </p>
                    </section>
                </div>
            </main>
        </div>
    );
}
