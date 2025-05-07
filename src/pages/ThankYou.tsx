// src/pages/ThankYou.tsx
import React from 'react';
const ThankYou = () => {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center p-10">
        <h2 className="text-3xl font-bold mb-4">🎉 Thank you for subscribing!</h2>
        <p className="text-gray-600">You now have unlimited access to ScrapeGenie.</p>
        <a href="/app" className="mt-6 inline-block px-6 py-3 bg-blue-600 text-white rounded">Go to App</a>
      </div>
    );
  };
  
  export default ThankYou;