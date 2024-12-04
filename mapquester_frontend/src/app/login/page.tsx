// page.tsx

'use client'

import { useRouter } from 'next/navigation';
import { useRecoilState } from 'recoil';
import { authState } from '../atoms/authState';
import LoginForm from './_components/LoginForm';

const Login = () => {
  const router = useRouter();
  const [, setAuth] = useRecoilState(authState);

  const handleLogin = (accessToken: string, refreshToken: string) => {
    setAuth({
      isLoggedIn: true,
      accessToken,
      refreshToken,
    }); // set login state in Recoil

    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    router.push('/'); // redirect after login
  };

  const handleSignup = () => {
    router.push('/signup');
  };

  return (
    <main className="h-screen flex justify-center items-center bg-gradient-to-r from-blue-500 to-purple-500">
      <LoginForm onLogin={handleLogin} onSignup={handleSignup} />
    </main>
  );
};

export default Login;
