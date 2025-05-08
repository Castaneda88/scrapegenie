// src/pages/Dashboard.tsx
import React from 'react';
import { useState } from 'react';
import { getAuth, signOut } from 'firebase/auth';

const Dashboard = ({ user }) => {
  const [url, setUrl] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleScrape = async () => {
    if (!user?.uid) {
      alert('You must be signed in to scrape.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, uid: user.uid })
      });

      const contentType = res.headers.get('content-type');
      if (!res.ok) {
        const errorText = contentType?.includes('application/json')
          ? (await res.json()).error
          : await res.text();
        throw new Error(errorText || 'Scrape failed');
      }

      const data = await res.json();
      setResults(data.items);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const downloadCSV = () => {
    const headers = ['Name', 'Price', 'Variety', 'Price by Variety'];
    const rows = results.map(item => [item.name, item.price, item.variety, item.priceByVariety]);
    const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'scraped_data.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user.displayName}</h1>
        <button onClick={() => signOut(getAuth())} className="text-red-500">Logout</button>
      </div>
      <div className="flex gap-2 mb-4">
        <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Paste URL here" className="flex-1 p-2 border rounded" />
        <button onClick={handleScrape} className="px-4 py-2 bg-blue-600 text-white rounded">Go</button>
      </div>
      {loading && <p>Scraping data...</p>}
      {results.length > 0 && (
        <>
          <table className="w-full bg-white shadow rounded mb-4">
            <thead>
              <tr>
                <th className="border px-4 py-2">Name</th>
                <th className="border px-4 py-2">Price</th>
                <th className="border px-4 py-2">Variety</th>
                <th className="border px-4 py-2">Price by Variety</th>
              </tr>
            </thead>
            <tbody>
              {results.map((item, i) => (
                <tr key={i}>
                  <td className="border px-4 py-2">{item.name}</td>
                  <td className="border px-4 py-2">{item.price}</td>
                  <td className="border px-4 py-2">{item.variety}</td>
                  <td className="border px-4 py-2">{item.priceByVariety}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <button onClick={downloadCSV} className="bg-green-600 text-white px-6 py-3 rounded">Download as Spreadsheet</button>
        </>
      )}
    </div>
  );
};

export default Dashboard;
