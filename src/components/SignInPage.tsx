import SignInButton from "@/components/SignInButton";
import { BsFillPersonFill } from 'react-icons/bs';


export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="relative w-full max-w-md space-y-8 rounded-2xl bg-white/10 p-8 backdrop-blur-xl">
        <div className="text-center">
          <BsFillPersonFill className="mx-auto h-16 w-16 text-blue-500" aria-hidden="true" />
          <h2 className="my-6 text-3xl font-bold tracking-tight text-white">
            GOCEAN Marketing Tech
          </h2>
          <p className="mt-2 text-sm text-gray-300">
            Sign in to access your dashboard
          </p>
        </div>

        <div className="mt-8">
          <SignInButton />
        </div>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-1/2 right-1/2 h-[1000px] w-[1000px] translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
      </div>
    </div>
  );
}
