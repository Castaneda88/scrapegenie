// api/stripeWebhook.js (CommonJS-compatible for Vercel)
const Stripe = require('stripe');
const { buffer } = require('micro');
const { db } = require('../lib/firebase.server');
const { doc, updateDoc } = require('firebase/firestore');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2022-11-15'
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

module.exports.config = {
  api: {
    bodyParser: false
  }
};

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const sig = req.headers['stripe-signature'];

  let event;
  try {
    const buf = await buffer(req);
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const uid = session?.metadata?.uid;

    if (!uid) {
      console.warn('⚠️ Missing UID in session metadata');
      return res.status(400).send('Missing UID in metadata');
    }

    try {
      await updateDoc(doc(db, 'users', uid), { subscribed: true });
      console.log(`✅ User ${uid} subscription marked as active.`);
    } catch (error) {
      console.error(`🔥 Failed to update Firestore for user ${uid}:`, error);
      return res.status(500).send('Firestore update failed');
    }
  }

  res.status(200).end();
};
