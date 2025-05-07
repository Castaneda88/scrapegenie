// src/pages/LandingPage.tsx
const LandingPage = () => {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 to-indigo-100 p-10">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">ScrapeGenie</h1>
        <p className="text-lg text-gray-600 mb-6">Paste a link. Get the data. Instantly.</p>
        <a href="/login" className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700">Get Started</a>
      </div>
    );
  };
  
  export default LandingPage;
  