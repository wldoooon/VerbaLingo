"use client"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'

interface BetaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function BetaDialog({ open, onOpenChange }: BetaDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment system coming soon</DialogTitle>
          <DialogDescription>
            PokiSpokey is currently in beta we're still wiring up the payment
            system and paid plans aren't available yet.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg border bg-muted/50 px-4 py-3 text-sm text-foreground/80 leading-relaxed">
          In the meantime, <span className="font-semibold text-foreground">searching is essentially free</span>.
          Every account starts with{' '}
          <span className="font-semibold text-foreground">50,000 AI Credits </span>
          more than enough to explore the full experience at no cost.
        </div>

        <p className="text-sm text-muted-foreground">
          We'll notify you as soon as subscriptions go live.
        </p>

        <DialogFooter>
          <Button onClick={() => onOpenChange(false)} className="w-full cursor-pointer">
            Got it
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
