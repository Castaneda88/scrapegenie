import React from 'react';
const Subscribe = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-10">
      <a href="/api/subscribe" className="bg-indigo-600 text-white px-8 py-4 rounded-lg shadow">
        Subscribe for $10/month
      </a>
    </div>
  );
};

export default Subscribe; // ✅ This line is required
