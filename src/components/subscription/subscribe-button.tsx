'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { CreditCard, ArrowRight } from 'lucide-react'
import { createCheckoutSession } from '@/lib/actions/subscription'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
          Redirecting to Stripe...
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          Upgrade to Pro
          <ArrowRight className="h-4 w-4" />
        </span>
      )}
    </Button>
  )
}

export function SubscribeButton() {
  return (
    <form action={createCheckoutSession}>
      <SubmitButton />
    </form>
  )
}
