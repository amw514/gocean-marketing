'use client'

// import { signIn } from 'next-auth/react'
import { FcGoogle } from 'react-icons/fc'

export default function SignInButton() {
  return (
    <button
      // onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
      className="group relative flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-6 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
    >
      <span className="absolute left-4 flex items-center justify-center rounded-md bg-white p-2 shadow-md">
        <FcGoogle className="h-5 w-5" aria-hidden="true" />
      </span>
      Continue with Google
    </button>
  )
}

