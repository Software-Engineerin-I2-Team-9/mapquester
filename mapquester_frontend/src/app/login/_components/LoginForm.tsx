'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRecoilState } from 'recoil';
import { authState } from '@/app/atoms/authState';
import axios from 'axios';

interface LoginFormProps {
  onLogin: (username: string, password: string) => void;
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
      alert('Please enter both username and password');
      return;
    }

    setIsLoading(true);

    try {
      const endpoint = `${process.env.NEXT_PUBLIC_DEV === 'true' ? process.env.NEXT_PUBLIC_BACKEND_DEV_URL : process.env.NEXT_PUBLIC_BACKEND_PROD_URL}/api/v1/users/login/`
      console.log(endpoint)
      const response = await axios.post(endpoint, {
        username: form.username,
        password: form.password,
      },{
        headers: {
          'Content-Type': 'application/json',
        }
      });
      setMessage(response.data.message);
      onLogin(form.username, form.password);
    } catch (error) {
      const errorMessage = error.response?.data?.form_errors
        ? Object.entries(error.response.data.form_errors).map(([field, messages]) => {
              return `${field}: ${messages.join(', ')}`;
          }).join('\n')
        : error.response?.data?.message || 'An error occurred during log in';
    
      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome to MapQuester</h1>
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
        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition duration-300"
          disabled={isLoading}
        >
          {isLoading ? 'Logging in...' : 'Login'}
        </button>
        <button
          type="button"
          onClick={onSignup}
          className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold rounded-md transition duration-300"
        >
          Sign Up
        </button>
        {message && <p className="mt-4 text-center text-red-500">{message}</p>}
      </form>
    </div>
  );
};

export default LoginForm
