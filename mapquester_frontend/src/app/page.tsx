'use client'

import { useRouter } from 'next/navigation';
import { useRecoilValue } from 'recoil';
import { authState } from './atoms/authState';
import MapComponent from './map/_components/MapComponent';

const Home = () => {
  const router = useRouter();
  const auth = useRecoilValue(authState);

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900">
      <div className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          {(auth.isLoggedIn || process.env.NEXT_PUBLIC_DEV_NO_AUTH==='true') ? (
            <div className="w-full h-[80vh] p-4 bg-blue-800/30 backdrop-blur-md rounded-lg shadow-xl flex items-center justify-center">
              <MapComponent />
            </div>
          ) : (
            <div className="text-center bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-2xl mx-auto max-w-md">
              <h1 className="text-6xl font-bold text-white mb-4">MapQuester</h1>
              <p className="text-xl text-blue-100 mb-8">Pin, Share, and Discover Hobbies</p>
              <button
                onClick={handleLoginRedirect}
                className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition duration-300 shadow-lg"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default Home;
