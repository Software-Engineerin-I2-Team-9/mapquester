'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/app/api/axios';

interface SignupFormProps {
  onSignup: () => void;
}

const SignupForm: React.FC<SignupFormProps> = ({ onSignup }) => {
  const router = useRouter();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirmPassword: '' });
  const [, setMessage] = useState('');
  const [, setIsLoading] = useState(false);

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
      const endpoint = '/api/v1/users/signup/';
      const response = await apiClient.post(
        endpoint,
        {
          username: form.username,
          email: form.email,
          password1: form.password,
          password2: form.confirmPassword,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      setMessage(response.data.message);
      onSignup();
    } catch (error) {
      const axiosError = error as {
        response?: { data?: { form_errors?: Record<string, string[]>; message?: string } };
      };
      const errorMessage = axiosError.response?.data?.form_errors
        ? Object.entries(axiosError.response.data.form_errors)
            .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
            .join('\n')
        : axiosError.response?.data?.message || 'An error occurred during sign up';

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-full max-w-[450px] p-8 bg-white flex flex-col justify-center">
      <h1 className="text-3xl font-bold text-center text-gray-800 mb-12">Sign Up for MapQuester</h1>
      <form onSubmit={handleSubmit} className="space-y-6 w-full max-w-sm mx-auto">
        <div>
          <label htmlFor="username" className="sr-only">
            Username
          </label>
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
          <label htmlFor="email" className="sr-only">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleInputChange}
            placeholder="Email"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-[#C91C1C]"
          />
        </div>
        <div>
          <label htmlFor="password" className="sr-only">
            Password
          </label>
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
        <div>
          <label htmlFor="confirmPassword" className="sr-only">
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleInputChange}
            placeholder="Confirm Password"
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-700 focus:outline-none focus:border-[#C91C1C]"
          />
        </div>
        <button
          type="submit"
          className="w-full py-3 px-4 bg-[#D69C89] hover:opacity-90 text-white font-semibold rounded-lg transition-opacity"
        >
          Sign Up
        </button>
      </form>
      <button
        onClick={() => router.push('/login')}
        className="w-full mt-4 py-3 px-4 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-colors"
      >
        Back to Login
      </button>
    </div>
  );
};

export default SignupForm;
