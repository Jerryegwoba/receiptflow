import { NextRequest, NextResponse } from 'next/server'
import { getStripeClient } from '@/lib/stripe/client'
import { createServerClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  const stripe = getStripeClient()
  const body = await request.text()
  const signature = (await headers()).get('stripe-signature')!

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

    const supabase = await createServerClient()

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any
        const userId = session.metadata?.supabase_user_id
        if (userId) {
          await (supabase
            .from('profiles') as any)
            .update({
              subscription_tier: 'pro',
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', userId)
        }
        break
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as any
        const customerId = subscription.customer as string

        // Find user by Stripe customer ID
        const { data: profile } = await (supabase
          .from('profiles') as any)
          .select('user_id, subscription_tier')
          .eq('stripe_customer_id', customerId)
          .single()

        if (profile) {
          const isActive =
            subscription.status === 'active' || subscription.status === 'trialing'
          const newTier = isActive ? 'pro' : 'free'

          await (supabase
            .from('profiles') as any)
            .update({
              subscription_tier: newTier,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', profile.user_id)
        }
        break
      }
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 400 }
    )
  }
}
