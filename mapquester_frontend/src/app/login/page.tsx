'use client'

import { useRouter } from 'next/navigation';
import { useRecoilState } from 'recoil';
import { authState } from '../atoms/authState';
import LoginForm from './_components/LoginForm';

const Login = () => {
  const router = useRouter();
  const [auth, setAuth] = useRecoilState(authState);

  const handleLogin = (username: string, password: string) => {
    setAuth({ isLoggedIn: true, username }); // set login state in Recoil
    router.push('/'); // redirect after login
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <main className="flex justify-center items-center min-h-screen bg-gray-100 p-4">
      <LoginForm onLogin={handleLogin} onSignup={handleSignup} />
    </main>
  );
};

export default Login;
