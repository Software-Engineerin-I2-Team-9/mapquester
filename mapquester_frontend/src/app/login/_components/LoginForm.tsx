'use client'

import { useState } from 'react';
import apiClient from '@/app/api/axios';
import Link from 'next/link';

interface LoginFormProps {
  onLogin: (accessToken: string, refreshToken: string) => void;
  onSignup: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin, onSignup }) => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!form.username || !form.password) {
      setMessage('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = '/api/v1/users/login/'
      const response = await apiClient.post(endpoint, {
        username: form.username,
        password: form.password,
      }, {
        headers: {
          'Content-Type': 'application/json',
        }
      });

      setMessage(response.data.message);
      onLogin(response.data.access, response.data.refresh);
    } catch (error) {
      const axiosError = error as { response?: { data?: { error?: string, detail?: string } } };
      const errorMessage = axiosError.response?.data?.error || axiosError.response?.data?.detail || 'An error occurred during log in';
      setMessage(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full max-w-[450px] p-8 bg-white flex flex-col justify-center">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">Welcome to MapQuester</h1>
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm mx-auto">
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-[#C91C1C]"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-[#C91C1C]"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#C91C1C] hover:opacity-90 text-white font-semibold rounded-lg transition-opacity"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <Link
          href="/signup"
          className="w-full block text-center py-3 px-4 bg-[#F8F8F8] text-gray-800 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
        >
          Sign Up
        </Link>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </form>
    </div>
  );
};

export default LoginForm;
