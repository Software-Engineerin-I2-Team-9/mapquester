'use client'

import { useRouter } from 'next/navigation'
import { useRecoilState } from 'recoil'
import { authState } from '../atoms/authState'
import MapComponent from '../map/_components/MapComponent'
import { useEffect } from 'react'

interface AuthState {
  isLoggedIn: boolean;
  id: string;
  accessToken: string;
  refreshToken: string;
}

const Feed = () => {
  const router = useRouter()
  const [auth, setAuth] = useRecoilState<AuthState>(authState)

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    const id = localStorage.getItem('id');
  
    if (token && refreshToken && id) {
      setAuth({
        isLoggedIn: true,
        id,
        accessToken: token,
        refreshToken: refreshToken
      });
    } else {
      // If any of the required auth items are missing, clear everything and redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('id');
      setAuth({
        isLoggedIn: false,
        id: '',
        accessToken: '',
        refreshToken: ''
      });
      router.push('/');
    }
  }, [setAuth, router]);

  // If not logged in, don't render anything while redirecting
  if (!auth.isLoggedIn) {
    return null;
  }

  return (
    <main className="h-screen flex flex-col bg-white">
      <div className="flex-1 relative">
        <div className="h-full">
          <MapComponent feed={true} />
        </div>
      </div>
    </main>
  )
}

export default Feed 