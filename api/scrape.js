// api/scrape.js (CommonJS for Vercel)
const axios = require('axios');
const { db } = require('../lib/firebase.server');
const { doc, getDoc, setDoc, serverTimestamp } = require('firebase/firestore');
const cheerio = require('cheerio');

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { url, uid } = req.body;
  if (!uid || !url) {
    return res.status(400).json({ error: 'Missing uid or url' });
  }

  try {
    console.log('Scrape request body:', req.body);
    console.log('SCRAPER_API_KEY present:', !!process.env.SCRAPER_API_KEY);

    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const now = new Date();

    if (!userSnap.exists()) {
      await setDoc(userRef, { trialStart: serverTimestamp(), subscribed: false });
      return res.status(403).json({ error: 'Trial started. Please retry after a few seconds.' });
    }

    const userData = userSnap.data();
    const trialStartRaw = userData.trialStart?.toDate?.();
    const isSubscribed = userData.subscribed;

    const trialStart = trialStartRaw instanceof Date ? trialStartRaw : null;
    const diffMs = trialStart ? now.getTime() - trialStart.getTime() : 0;
    const diffDays = diffMs / (1000 * 60 * 60 * 24);

    if (!isSubscribed && diffDays > 3) {
      return res.status(403).json({ error: 'Trial expired. Please subscribe.' });
    }

    const listingHTML = await axios.get(`http://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(url)}`);
    const $ = cheerio.load(listingHTML.data);
    const productLinks = [];

    $('a[href]').each((_, el) => {
      const link = $(el).attr('href');
      if (link && (link.includes('/product') || link.includes('item'))) {
        const absoluteLink = link.startsWith('http') ? link : new URL(link, url).href;
        productLinks.push(absoluteLink);
      }
    });

    const items = [];
    const limitedLinks = [...new Set(productLinks)].slice(0, 10);

    for (const link of limitedLinks) {
      const productHTML = await axios.get(`http://api.scraperapi.com?api_key=${process.env.SCRAPER_API_KEY}&url=${encodeURIComponent(link)}`);
      const $$ = cheerio.load(productHTML.data);

      const name = $$('h1').first().text().trim();
      const price = $$('[class*=price]').first().text().trim();
      const variety = $$('select option').map((_, o) => $$(o).text().trim()).get().join(', ');

      items.push({
        name: name || 'Unnamed Product',
        price: price || 'N/A',
        variety,
        priceByVariety: variety
      });
    }

    res.setHeader('Content-Type', 'application/json');
    return res.status(200).json({ items });
  } catch (error) {
    console.error('Scrape error:', error?.message || error);
    res.setHeader('Content-Type', 'application/json');
    return res.status(500).json({ error: 'Failed to scrape data' });
  }
};
