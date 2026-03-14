"use client";

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquareText, Send, Sparkles } from "lucide-react"
import { toastManager } from "@/components/ui/toast"

export function FeedbackDialog({ children }: { children?: React.ReactNode }) {
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [open, setOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;

    setIsSending(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    toastManager.add({
      title: "Feedback sent!",
      description: "Thanks for helping us make PokiSpokey better.",
      type: "success"
    });

    setFeedback("");
    setIsSending(false);
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="rounded-full cursor-pointer hover:bg-primary/10 hover:text-primary transition-colors">
            <MessageSquareText className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[440px] rounded-[2rem] border-primary/20 backdrop-blur-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <DialogTitle className="text-2xl font-black tracking-tight">Share your thoughts</DialogTitle>
          </div>
          <DialogDescription className="text-base text-muted-foreground/80 font-medium leading-relaxed">
            Spotted a bug? Have an idea? We'd love to hear how we can improve your learning experience.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="relative group">
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[140px] rounded-2xl bg-muted/30 border-border/50 focus:bg-background transition-all resize-none p-4 text-base font-medium placeholder:text-muted-foreground/50"
              aria-label="Send feedback"
              required
            />
          </div>

          <DialogFooter className="sm:justify-end gap-3 pt-2">
            <Button
              type="submit"
              disabled={!feedback.trim() || isSending}
              className="rounded-xl px-8 font-bold h-11 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 active:scale-95 transition-all cursor-pointer"
            >
              {isSending ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Sending...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  Send
                  <Send className="h-4 w-4" />
                </div>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

