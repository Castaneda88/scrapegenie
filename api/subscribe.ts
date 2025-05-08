// api/subscribe.ts
import Stripe from 'stripe';
import { db } from '../lib/firebase.server';

if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_PRICE_ID || !process.env.NEXT_PUBLIC_SUCCESS_URL || !process.env.NEXT_PUBLIC_CANCEL_URL) {
  throw new Error('Missing required Stripe environment variables');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15'
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { uid, email } = req.body;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'subscription',
      customer_email: email,
      line_items: [
        {
          price: process.env.STRIPE_PRICE_ID,
          quantity: 1
        }
      ],
      success_url: process.env.NEXT_PUBLIC_SUCCESS_URL,
      cancel_url: process.env.NEXT_PUBLIC_CANCEL_URL,
      metadata: { uid }
    });

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('Stripe error:', err);
    return res.status(500).json({ error: 'Stripe checkout failed' });
  }
}
