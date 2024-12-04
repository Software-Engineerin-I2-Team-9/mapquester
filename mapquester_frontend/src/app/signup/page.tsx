'use client'

import { useRouter } from 'next/navigation';
import SignupForm from './_components/SignupForm';
import 'axios';

export default function SignUp() {
  const router = useRouter();

  const handleSignup = () => {
    router.push('/login');
  };

  return (
    <main className="h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-500">
      <SignupForm onSignup={handleSignup} />
    </main>
  );
}