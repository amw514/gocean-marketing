
import React from 'react'
import { Button } from './ui/button';
import { handleSignOut } from '@/lib/actions';

const SignOutButton = () => {
  return (
    <div>
      <form
            action={handleSignOut}
          >
            <Button
              type="submit"
              variant="outline"
              className="py-2 px-4 text-base bg-red-600 hover:bg-red-700 text-white border-red-500 hover:border-red-600 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg"
            >
              Sign Out
            </Button>
          </form>
    </div>
  )
}

export default SignOutButton
