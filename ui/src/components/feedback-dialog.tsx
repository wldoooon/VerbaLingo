import React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { MessageSquareText } from "lucide-react"

export function FeedbackDialog({ children }: { children?: React.ReactNode }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button variant="ghost" size="icon" className="rounded-full">
            <MessageSquareText className="h-5 w-5" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send us feedback</DialogTitle>
          <DialogDescription>
            Watch{" "}
            <a className="text-foreground hover:underline" href="#">
              tutorials
            </a>
            , read Pokispokey&lsquo;s{" "}
            <a className="text-foreground hover:underline" href="#">
              documentation
            </a>
            , or join our{" "}
            <a className="text-foreground hover:underline" href="#">
              Discord
            </a>{" "}
            for community help.
          </DialogDescription>
        </DialogHeader>
        <form className="space-y-5">
          <Textarea
            id="feedback"
            placeholder="How can we improve Pokispokey?"
            aria-label="Send feedback"
          />
          <div className="flex flex-col sm:flex-row sm:justify-end">
            <Button type="button">Send feedback</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
