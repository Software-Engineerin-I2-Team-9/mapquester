'use client'

// import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SignupForm from './_components/SignupForm';
import 'axios';

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