'use client'

import { useRouter } from 'next/navigation'
import { useRecoilState } from 'recoil'
import { authState } from './atoms/authState'
import MapComponent from './map/_components/MapComponent'
import { useEffect } from 'react'

interface AuthState {
  isLoggedIn: boolean;
  id: string;
  accessToken: string;
  refreshToken: string;
}

const Home = () => {
  const router = useRouter()
  const [auth, setAuth] = useRecoilState<AuthState>(authState)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      setAuth((prevAuth: AuthState) => ({
        ...prevAuth,
        isLoggedIn: true,
        accessToken: token
      }))
    }
  }, [setAuth])

  return (
    <main className="h-screen flex flex-col bg-white">
      <div className="flex-1 relative">
        {auth.isLoggedIn ? (
          <div className="h-full">
            <MapComponent />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-8 mx-auto max-w-2xl">
              <h1 className="fire-text text-5xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-wider">
                MapQuester
              </h1>
              <p className="text-xl md:text-2xl lg:text-3xl mb-12 tagline-text font-semibold px-4">
                Pin, Share, and Discover Hobbies
              </p>
              <button
                onClick={() => router.push('/login')}
                className="py-4 px-10 bg-[#C91C1C] hover:opacity-90 transition-opacity text-white text-xl font-semibold rounded-lg shadow-md"
              >
                Get Started
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}

export default Home
