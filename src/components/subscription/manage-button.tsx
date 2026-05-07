'use client'

import { useState } from 'react'
import { useFormStatus } from 'react-dom'
import { Button } from '@/components/ui/button'
import { createPortalSession } from '@/lib/actions/subscription'

function SubmitButton() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="outline" className="w-full" disabled={pending}>
      {pending ? 'Loading...' : 'Manage Subscription'}
    </Button>
  )
}

export function ManageButton() {
  return (
    <form action={createPortalSession}>
      <SubmitButton />
    </form>
  )
}
