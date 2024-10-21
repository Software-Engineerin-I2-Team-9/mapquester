'use client'

import { useRouter } from 'next/navigation';
import { useRecoilValue } from 'recoil';
import { authState } from './atoms/authState';

const Home = () => {
  const router = useRouter();
  const auth = useRecoilValue(authState); // access login state

  const handleLoginRedirect = () => {
    router.push('/login');
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      {auth.isLoggedIn ? (
        <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome to MapQuester, {auth.username}.</h1>
        <p className="text-center text-gray-600">You are now logged in!</p>
      </div>
      ) : (
        <button
          onClick={handleLoginRedirect}
          className="py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition duration-300"
        >
          Go to Login
        </button>
      )}
    </main>
  );
};

export default Home;
