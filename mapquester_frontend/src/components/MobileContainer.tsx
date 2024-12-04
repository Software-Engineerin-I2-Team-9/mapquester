import React from 'react'

const MobileContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="mx-auto w-full max-w-[450px] min-h-screen bg-white relative shadow-lg">
      {children}
    </div>
  )
}

export default MobileContainer