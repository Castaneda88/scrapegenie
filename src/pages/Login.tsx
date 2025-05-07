// src/pages/Login.tsx
import { getAuth, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const loginWithGoogle = async () => {
    const auth = getAuth();
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
    navigate('/app');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-10 bg-white">
      <h2 className="text-3xl font-semibold mb-4">Login to ScrapeGenie</h2>
      <button onClick={loginWithGoogle} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">Login with Google</button>
    </div>
  );
};

export default Login;
