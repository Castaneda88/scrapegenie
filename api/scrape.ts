// api/scrape.ts
import axios from 'axios';
import { db } from '../lib/firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import * as cheerio from 'cheerio';

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { url, uid } = req.body;

  if (!uid) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    const now = new Date();

    if (!userSnap.exists()) {
      await setDoc(userRef, { trialStart: serverTimestamp(), subscribed: false });
      return res.status(403).json({ error: 'Trial started. Please retry after a few seconds.' });
    }

    const userData = userSnap.data();
    const trialStart = userData.trialStart?.toDate();
    const isSubscribed = userData.subscribed;

    if (!isSubscribed && trialStart) {
      const diffMs = now - trialStart;
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      if (diffDays > 3) {
        return res.status(403).json({ error: 'Trial expired. Please subscribe.' });
      }
    }

    // Step 1: Get HTML of listing page
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
        priceByVariety: variety // Can be customized if variety prices differ
      });
    }

    return res.status(200).json({ items });
  } catch (error) {
    console.error('Scrape error:', error);
    return res.status(500).json({ error: 'Failed to scrape data' });
  }
}
