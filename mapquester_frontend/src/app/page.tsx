
'use client'

import { useRouter } from 'next/navigation'
import { useRecoilState } from 'recoil'
import { authState } from './atoms/authState'
import MapComponent from './map/_components/MapComponent'
import LogoutButton from './login/_components/LogoutButton'
import { useEffect } from 'react'

const Home = () => {
  const router = useRouter()
  const [auth, setAuth] = useRecoilState(authState)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      setAuth((prevAuth) => ({
        ...prevAuth,
        isLoggedIn: true,
        accessToken: token
      }))
    }
  }, [setAuth])

  return (
    <main className="h-full flex flex-col bg-gradient-to-r from-mutedorange to-mustardyellow">
      <nav className="fixed top-0 left-0 right-0 bg-transparent z-40 max-w-[450px] mx-auto">
        <div className="h-[45px] px-4 flex justify-between items-center">
          <div className="flex-shrink-0">
            {auth.isLoggedIn && (
              <h1 className="text-4xl text-eggshell font-curly">MapQuester</h1>
            )}
          </div>
          {auth.isLoggedIn && (
            <div>
              <LogoutButton />
            </div>
          )}
        </div>
      </nav>

      <div className="min-h-screen flex items-center justify-center">
        <div className="container mx-auto px-4 py-8">
          {(auth.isLoggedIn || process.env.NEXT_PUBLIC_DEV_NO_AUTH === 'true') ? (
            <div className="w-full h-[80vh] bg-white/10 p-4 backdrop-blur-md rounded-lg shadow-xl flex items-center justify-center">
              <MapComponent />
            </div>
          ) : (
            <div className="text-center bg-white/10 backdrop-blur-lg p-8 rounded-xl shadow-2xl mx-auto max-w-md">
              <h1 className="font-curly text-6xl text-eggshell mb-4">MapQuester</h1>
              <p className="text-xl text-blue-100 my-8">Pin, Share, and Discover Hobbies</p>
              <button
                onClick={() => router.push('/login')}
                className="py-3 px-8 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition duration-300 shadow-lg"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  )
}

export default Home