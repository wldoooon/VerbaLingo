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

export function ContactUs() {
	return (
		<div className="mx-auto min-h-screen w-full max-w-6xl md:border-x bg-background relative">
			{/* --- Vertical Dotted Decoration --- */}
			<div className="absolute left-12 top-0 bottom-0 w-px border-l border-dotted border-border/40 hidden md:block pointer-events-none" />

			{/* --- Header Section --- */}
			<div className="px-6 py-16 lg:pl-24 lg:pr-12">
				<h1 className="text-4xl font-bold tracking-tight mb-4">Let&apos;s Talk</h1>
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
					<Button variant="outline" className="rounded-full px-6">
						Start Live Chat
					</Button>
				</div>

				{/* Try Efferd Section */}
				<div className="p-8 lg:p-12 border-b border-border/40 hover:bg-muted/5 transition-colors group">
					<div className="flex items-start justify-between mb-8">
						<div>
							<h3 className="text-xl font-bold mb-2">Try Efferd</h3>
							<p className="text-sm text-muted-foreground">See how Efferd can transform your product&apos;s UI.</p>
						</div>
						<Video className="size-6 text-muted-foreground group-hover:text-primary transition-colors" />
					</div>
					<Button variant="outline" className="rounded-full px-6">
						Book a demo
					</Button>
				</div>
			</div>

			{/* --- Bottom Section: Info & Form --- */}
			<div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr]">
				{/* Left Column: Contact Info */}
				<div className="p-8 lg:pl-24 lg:pr-12 space-y-12">
					{/* Email */}
					<div>
						<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Email</h4>
						<p className="text-sm font-medium hover:text-primary cursor-pointer transition-colors">mail@efferd.com</p>
					</div>

					{/* Phone */}
					<div>
						<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Phone</h4>
						<p className="text-sm font-medium hover:text-primary cursor-pointer transition-colors">+1 (234) 567-890</p>
					</div>

					{/* Office */}
					<div>
						<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Office</h4>
						<p className="text-sm text-muted-foreground leading-relaxed">
							123 Innovation Drive,<br />
							San Francisco, CA 94107
						</p>
					</div>

					{/* Socials */}
					<div>
						<h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">Socials</h4>
						<div className="flex items-center gap-5">
							<Linkedin className="size-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
							<Youtube className="size-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
							<Github className="size-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
							<Twitter className="size-5 text-muted-foreground hover:text-foreground cursor-pointer transition-colors" />
						</div>
					</div>
				</div>

				{/* Right Column: Contact Form */}
				<div className="p-8 lg:pl-20 lg:pr-12 border-t lg:border-t-0 lg:border-l border-border/40 bg-muted/5 relative">
					{/* --- Vertical Dotted Decoration for Form --- */}
					<div className="absolute left-8 top-0 bottom-0 w-px border-l border-dotted border-border/40 hidden md:block pointer-events-none" />

					<div className="max-w-xl">
						<h3 className="text-2xl font-bold mb-2">Send a message</h3>
						<div className="w-full h-px border-t border-dotted border-border/40 mb-2" />
						<p className="text-sm text-muted-foreground mb-10">
							Fill out the form below and our team will get back to you shortly.
						</p>

						<form className="space-y-6">
							{/* Names */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="first-name">First name</Label>
									<Input id="first-name" placeholder="John" className="rounded-xl bg-background" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="last-name">Last name</Label>
									<Input id="last-name" placeholder="Doe" className="rounded-xl bg-background" />
								</div>
							</div>

							{/* Work Email */}
							<div className="space-y-2">
								<Label htmlFor="email">Work Email</Label>
								<Input id="email" type="email" placeholder="johndoe@example.com" className="rounded-xl bg-background" />
							</div>

							{/* Phone (Optional) */}
							<div className="space-y-2">
								<Label htmlFor="phone">Phone (Optional)</Label>
								<Input id="phone" type="tel" placeholder="+1 (555) 123-4567" className="rounded-xl bg-background" />
							</div>

							{/* Company Info */}
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="website">Company Website</Label>
									<Input id="website" placeholder="https://example.com" className="rounded-xl bg-background" />
								</div>
								<div className="space-y-2">
									<Label htmlFor="company-size">Company Size</Label>
									<Select>
										<SelectTrigger id="company-size" className="rounded-xl bg-background w-full">
											<SelectValue placeholder="Select a value" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="1-10">1-10 employees</SelectItem>
											<SelectItem value="11-50">11-50 employees</SelectItem>
											<SelectItem value="51-200">51-200 employees</SelectItem>
											<SelectItem value="201-500">201-500 employees</SelectItem>
											<SelectItem value="500+">500+ employees</SelectItem>
										</SelectContent>
									</Select>
								</div>
							</div>

							{/* Message */}
							<div className="space-y-2">
								<Label htmlFor="message">How can we help?</Label>
								<Textarea id="message" placeholder="Your message" className="min-h-[120px] rounded-2xl bg-background" />
							</div>

							{/* Privacy Policy */}
							<div className="flex items-center space-x-2">
								<Checkbox id="terms" className="rounded-md border-border" />
								<Label htmlFor="terms" className="text-sm text-muted-foreground font-normal">
									I agree to the <span className="text-foreground underline cursor-pointer">Privacy Policy</span>.
								</Label>
							</div>

							{/* Submit Button */}
							<Button className="w-full h-12 text-black font-bold text-base rounded-2xl bg-amber-500 hover:bg-amber-600 transition-colors mt-4">
								Submit
							</Button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}
