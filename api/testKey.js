// api/testKey.js
module.exports = (req, res) => {
    const key = process.env.FIREBASE_PRIVATE_KEY;
  
    if (!key) {
      return res.status(500).json({ error: 'FIREBASE_PRIVATE_KEY not found' });
    }
  
    return res.status(200).json({
      status: 'ok',
      keyLength: key.length,
      containsLineBreaks: key.includes('\\n'),
    });
  };
  