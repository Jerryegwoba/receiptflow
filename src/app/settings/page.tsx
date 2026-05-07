import { redirect } from 'next/navigation'
import { createServerClient } from '@/lib/supabase/server'
import { getUserSubscription, createPortalSession } from '@/lib/actions/subscription'
import { SubscribeButton } from '@/components/subscription/subscribe-button'
import { ManageButton } from '@/components/subscription/manage-button'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ArrowLeft, Check, X, Crown, User } from 'lucide-react'
import Link from 'next/link'

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string; canceled?: string }>
}) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const profile = await getUserSubscription()

  const isPro = profile?.subscription_tier === 'pro'
  const receiptCount = profile?.receipt_count_this_month ?? 0
  const params = await searchParams

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/receipts">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Receipts
          </Button>
        </Link>
      </div>

      <h1 className="mb-6 text-2xl font-bold">Settings</h1>

      {/* Profile Section */}
      <Card className="mb-6 p-6">
        <div className="mb-4 flex items-center gap-2">
          <User className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Profile</h2>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">User ID</span>
            <span className="font-mono text-xs">{user.id.slice(0, 8)}...</span>
          </div>
        </div>
      </Card>

      {/* Subscription Section */}
      <Card className="p-6">
        <div className="mb-4 flex items-center gap-2">
          <Crown className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Subscription</h2>
        </div>

        {/* Current Plan */}
        <div className="mb-6 rounded-lg border p-4">
          <div className="mb-2 flex items-center justify-between">
            <div>
              <p className="font-semibold">
                {isPro ? 'Pro Plan' : 'Free Plan'}
              </p>
              <p className="text-sm text-muted-foreground">
                {isPro ? '$12/month' : '$0/month'}
              </p>
            </div>
            {isPro && (
              <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                Active
              </span>
            )}
          </div>

          {/* Free Tier Limits */}
          {!isPro && (
            <div className="mt-3">
              <div className="mb-1 flex justify-between text-sm">
                <span>Receipts this month</span>
                <span className={receiptCount >= 10 ? 'text-destructive' : ''}>
                  {receiptCount} / 10
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min((receiptCount / 10) * 100, 100)}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Plan Features */}
        <div className="mb-6">
          <h3 className="mb-3 text-sm font-semibold">Plan Features</h3>
          <div className="space-y-2">
            {[
              { feature: '10 receipts per month', free: true, pro: true },
              { feature: 'AI receipt extraction', free: true, pro: true },
              { feature: 'CSV/PDF export', free: true, pro: true },
              { feature: 'Unlimited receipts', free: false, pro: true },
              { feature: 'Priority processing', free: false, pro: true },
              { feature: 'Advanced reports', free: false, pro: true },
            ].map((item) => (
              <div key={item.feature} className="flex items-center justify-between text-sm">
                <span>{item.feature}</span>
                <div className="flex gap-4">
                  <span className={item.free ? 'text-green-600' : 'text-muted-foreground/50'}>
                    {item.free ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </span>
                  <span className={item.pro ? 'text-green-600' : 'text-muted-foreground/50'}>
                    {item.pro ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          {!isPro ? (
            <SubscribeButton />
          ) : (
            <ManageButton />
          )}
        </div>

        {/* Success/Cancel Messages */}
        {(params?.success === 'true' || params?.canceled === 'true') && (
          <div className={`mt-4 rounded-lg p-3 text-sm ${
            params?.success === 'true'
              ? 'bg-green-50 text-green-700'
              : 'bg-yellow-50 text-yellow-700'
          }`}>
            {params?.success === 'true'
              ? '✓ Subscription updated successfully!'
              : 'Subscription upgrade was canceled.'}
          </div>
        )}
      </Card>
    </div>
  )
}
