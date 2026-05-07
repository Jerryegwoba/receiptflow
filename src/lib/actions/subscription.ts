'use server'

import { createServerClient } from '@/lib/supabase/server'
import { getStripeClient } from '@/lib/stripe/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function createCheckoutSession() {
  const supabase = await createServerClient()
  const stripe = getStripeClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  // Get or create Stripe customer
  let customerId: string

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (profile?.stripe_customer_id) {
    customerId = profile.stripe_customer_id
  } else {
    const customer = await stripe.customers.create({
      email: user.email,
      metadata: { supabase_user_id: user.id },
    })
    customerId = customer.id

    await (supabase
      .from('profiles') as any)
      .update({ stripe_customer_id: customerId })
      .eq('user_id', user.id)
  }

  // Create checkout session for Pro monthly
  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    line_items: [
      {
        price: process.env.STRIPE_PRO_PRICE_ID,
        quantity: 1,
      },
    ],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings?canceled=true`,
    metadata: {
      supabase_user_id: user.id,
    },
  })

  redirect(session.url!)
}

export async function createPortalSession() {
  const supabase = await createServerClient()
  const stripe = getStripeClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!profile?.stripe_customer_id) {
    redirect('/settings')
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: profile.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/settings`,
  })

  redirect(session.url!)
}

export async function getUserSubscription() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await (supabase
    .from('profiles') as any)
    .select('subscription_tier, stripe_customer_id, receipt_count_this_month')
    .eq('user_id', user.id)
    .single()

  return profile
}
