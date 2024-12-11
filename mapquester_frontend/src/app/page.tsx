'use client'

import { useRouter } from 'next/navigation'
import { useRecoilState } from 'recoil'
import { authState } from './atoms/authState'
import MapComponent from './map/_components/MapComponent'
import { useEffect } from 'react'

interface AuthState {
  isLoggedIn: boolean;
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
            <div className="text-center p-4 sm:p-6 md:p-8 mx-auto w-full max-w-2xl">
              <h1 className="fire-text font-bold mb-4 sm:mb-6 tracking-wider overflow-hidden whitespace-normal break-words">
                MapQuester
              </h1>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl mb-8 sm:mb-10 md:mb-12 tagline-text font-semibold px-2 sm:px-4">
                Pin, Share, and Discover Hobbies
              </p>
              <button
                onClick={() => router.push('/login')}
                className="py-2 sm:py-3 px-6 sm:px-8 bg-[#C91C1C] hover:opacity-90 transition-opacity text-white text-base sm:text-lg md:text-xl font-semibold rounded-lg shadow-md"
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
