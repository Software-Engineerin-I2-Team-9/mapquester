'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
  onSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('Please enter both username and password');
      return;
    }
    onLogin(username, password);
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome to MapQuester</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
        />
        <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition duration-300">Login</button>
        <button type="button" onClick={onSignup} className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-md transition duration-300">Sign Up</button>
      </form>
    </div>
  );
};

const SplashScreen = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <svg className="w-24 h-24 mb-4 animate-pulse" viewBox="0 0 24 24">
      <path fill="#0070f3" d="M12 0C7.58 0 4 3.58 4 8c0 5.5 8 16 8 16s8-10.5 8-16c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
    </svg>
    <h1 className="text-4xl font-bold text-blue-600">MapQuester</h1>
  </div>
);

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (username, password) => {
    console.log('Login attempt:', username, password);
    // Here you would typically verify credentials
    // For now, we'll just redirect to the home page
    router.push('/home');
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      {showSplash ? (
        <SplashScreen />
      ) : (
        <LoginForm onLogin={handleLogin} onSignup={handleSignup} />
      )}
    </main>
  );
}