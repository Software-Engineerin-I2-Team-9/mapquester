'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import 'axios';

interface SignupFormProps {
  onSignup: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup }) => {
  const [form, setForm] = useState({ username: '', password: '', confirmPassword: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      alert("Passwords don't match");
      return;
    }
    
    setIsLoading(true);

    try {
    const response = await axios.post(`${process.env.DEV === 'true' ? 'http://localhost:3000': 'https://placeholder.com'}/api/signup/`, {
      username: form.username,
      password: form.password,
    });
        setMessage(response.data.message);
        onSignup();
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'An error occurred during registration';
        setMessage(`Error: ${errorMessage}`);
      } finally {
        setIsLoading(false);
      }
    };

    return (
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Sign Up for MapQuester</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="sr-only">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value={form.username}
            onChange={handleInputChange}
            placeholder="Username"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleInputChange}
            placeholder="Password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Password"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-gray-700 focus:outline-none focus:border-blue-500"
          />
        </div>
          <button type="submit" className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition duration-300">Sign Up</button>
        </form>
      </div>
    )
};


export default function SignUp() {
  
  const router = useRouter();

  const handleSignup = () => {
    router.push('/login'); // redirect to login
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <SignupForm onSignup={handleSignup} />
    </div>
  );
}