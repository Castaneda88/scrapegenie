// api/subscribe.js (CommonJS for Vercel)
const Stripe = require('stripe');
const { db } = require('../lib/firebase.server');

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing STRIPE_SECRET_KEY');
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15'
});

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { uid, email } = req.body;
  if (!uid || !email) {
    return res.status(400).json({ error: 'Missing required user ID or email.' });
  }

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
    console.error('Stripe session creation failed:', err.message, err.stack);
    return res.status(500).json({ error: 'Stripe checkout failed' });
  }
};
