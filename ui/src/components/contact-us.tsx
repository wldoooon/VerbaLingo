"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { FullWidthDivider } from "@/components/ui/full-width-divider";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import {
	MessageCircle,
	Video,
	Linkedin,
	Youtube,
	Twitter,
	Github,
	Mail,
	Phone,
	MapPin,
	X,
} from "lucide-react";

import { HighlightText } from "@/components/ui/highlight-text";
import { EclipseButton } from "@/components/satisui/eclipse-button";
import { toastManager } from "@/components/ui/toast";

export function ContactUs() {
	const [isLoading, setIsLoading] = React.useState(false);
	const [firstName, setFirstName] = React.useState("");
	const [lastName, setLastName] = React.useState("");
	const [email, setEmail] = React.useState("");
	const [message, setMessage] = React.useState("");
	const [termsAccepted, setTermsAccepted] = React.useState(false);

	const handleSubmit = (e: React.MouseEvent) => {
		e.preventDefault();
		
		if (!firstName.trim() || !lastName.trim() || !email.trim() || !message.trim()) {
			toastManager.add({
				title: "Missing Information",
				description: "Please fill out all fields before sending.",
				type: "error"
			});
			return;
		}

		if (!termsAccepted) {
			toastManager.add({
				title: "Privacy Policy",
				description: "You must agree to the Privacy Policy.",
				type: "warning"
			});
			return;
		}

		setIsLoading(true);
		// Simulate network request
		setTimeout(() => {
			setIsLoading(false);
			toastManager.add({
				title: "Message Sent!",
				description: "We'll get back to you shortly.",
				type: "success"
			});
			// Reset form
			setFirstName("");
			setLastName("");
			setEmail("");
			setMessage("");
			setTermsAccepted(false);
		}, 1500);
	};

	return (
		<div className="mx-auto min-h-screen w-full max-w-6xl md:border-x bg-background relative">
			{/* --- Vertical Dotted Decoration --- */}
			<div className="absolute left-12 top-0 bottom-0 w-px border-l border-dotted border-foreground/20 hidden md:block pointer-events-none" />

			{/* --- Header Section --- */}
			<div className="px-6 py-16 lg:pl-24 lg:pr-12">
				<h1 className="text-4xl font-bold tracking-tight mb-4 leading-relaxed">
					Let&apos;s <HighlightText variant="underline" color="primary" className="font-bold italic text-orange-500">Talk</HighlightText>
				</h1>
				<p className="text-muted-foreground max-w-2xl">
					Need support or have a question about Efferd? We&apos;re here to help.
				</p>
			</div>

			<FullWidthDivider contained />

			{/* --- Middle Row: Chat & Demo --- */}
			<div className="grid grid-cols-1 md:grid-cols-2">
				{/* Chat Section */}
				<div className="p-8 lg:pl-24 lg:pr-12 border-b md:border-r border-border/40 hover:bg-muted/5 transition-colors group">
					<div className="flex items-start justify-between mb-8">
						<div>
							<h3 className="text-xl font-bold mb-2">Chat with us</h3>
							<p className="text-sm text-muted-foreground">Speak to our friendly team via live chat.</p>
						</div>
						<MessageCircle className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
					</div>
				</div>

				{/* Try Efferd Section */}
				<div className="p-8 lg:p-12 border-b border-border/40 hover:bg-muted/5 transition-colors group">
					<div className="flex items-start justify-between mb-8">
						<div>
							<h3 className="text-xl font-bold mb-2">Try PokiSpokey</h3>
							<p className="text-sm text-muted-foreground">See how PokiSpokey can help you to speak.</p>
						</div>
						<Video className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
					</div>
				</div>
			</div>

			{/* --- Bottom Section: Info & Form --- */}
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr]">
				{/* Left Column: Contact Info */}
				<div className="p-8 lg:pl-24 lg:pr-12 space-y-12">
					{/* Email */}
					<div>
						<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Email</h4>
						<p className="text-sm font-medium hover:text-primary cursor-pointer transition-colors">support@pokispokey.com</p>
					</div>

					{/* Socials */}
					<div>
						<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Socials</h4>
						<div className="flex items-center gap-5">
							<Linkedin className="size-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
							<Twitter className="size-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
						</div>
					</div>
				</div>

				{/* Right Column: Contact Form */}
				<div className="p-8 lg:pl-20 lg:pr-12 border-t lg:border-t-0 lg:border-l border-border/40 bg-muted/5 relative">
					{/* --- Vertical Dotted Decoration for Form --- */}
					<div className="absolute left-8 top-0 bottom-0 w-px border-l border-dotted border-foreground/20 hidden md:block pointer-events-none" />

					<div className="max-w-xl relative">
						<h3 className="text-2xl font-bold">Send a message</h3>
						{/* Expanded horizontal line with better spacing from the text */}
						<div className="absolute -left-12 right-0 h-px border-t border-dotted border-foreground/20 top-10" />
						<p className="text-sm text-muted-foreground mb-10 mt-12">
							Fill out the form below and our team will get back to you shortly.
						</p>

						<form className="space-y-6">
							{/* Names */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="first-name">First name</Label>
									<Input 
										id="first-name" 
										placeholder="John" 
										className="rounded-xl bg-background" 
										value={firstName}
										onChange={(e) => setFirstName(e.target.value)}
									/>
								</div>
								<div className="space-y-2">
									<Label htmlFor="last-name">Last name</Label>
									<Input 
										id="last-name" 
										placeholder="Doe" 
										className="rounded-xl bg-background" 
										value={lastName}
										onChange={(e) => setLastName(e.target.value)}
									/>
								</div>
							</div>

							{/* Work Email */}
							<div className="space-y-2">
								<Label htmlFor="email">Email</Label>
								<Input 
									id="email" 
									type="email" 
									placeholder="johndoe@example.com" 
									className="rounded-xl bg-background" 
									value={email}
									onChange={(e) => setEmail(e.target.value)}
								/>
							</div>


							{/* Message */}
							<div className="space-y-2">
								<Label htmlFor="message">How can we help?</Label>
								<Textarea 
									id="message" 
									placeholder="Your message" 
									className="min-h-[120px] rounded-2xl bg-background" 
									value={message}
									onChange={(e) => setMessage(e.target.value)}
								/>
							</div>


							{/* Submit Button */}
							<div className="pt-4">
								<EclipseButton
									onClick={handleSubmit}
									isLoading={isLoading}
									variant="orange"
									text={isLoading ? "Sending Message..." : "Send Message"}
									className="w-full h-14 rounded-2xl text-base shadow-lg"
									leftIcon={!isLoading && <MessageCircle className="w-5 h-5" />}
								/>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
