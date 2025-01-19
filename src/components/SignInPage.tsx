import { auth } from "@/auth";
import { BsFillPersonFill } from "react-icons/bs";
import { FcGoogle } from "react-icons/fc";
import { redirect } from "next/navigation";
import { handleSignIn } from "@/lib/actions";

export default async function SignIn() {
  const session = await auth();

  let errorMessage = "";

  // Check if user is already signed in
  if (session?.user?.email) {
    const allowedEmails = ["bigbyteberry@gmail.com","marinalabaff2@gmail.com"];
    if (allowedEmails.includes(session.user.email)) {
      redirect("/dashboard");
    } else {
      errorMessage = "You are not authorized to access this application";
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="relative w-full max-w-md space-y-8 rounded-2xl bg-white/10 p-8 backdrop-blur-xl">
        {errorMessage && (
          <div className="mb-4 rounded-md bg-red-500/10 p-4 text-red-500">
            {errorMessage}
          </div>
        )}
        <form action={handleSignIn} className="text-center">
          <div className="text-center">
            <BsFillPersonFill
              className="mx-auto h-16 w-16 text-blue-500"
              aria-hidden="true"
            />
            <h2 className="my-6 text-3xl font-bold tracking-tight text-white">
              GOCEAN Marketing Tech
            </h2>
            <p className="mt-2 text-sm text-gray-300">
              Sign in to access your dashboard
            </p>
          </div>

          <div className="mt-8">
            <button className="group relative flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 px-6 py-4 text-base font-bold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <span className="absolute left-4 flex items-center justify-center rounded-md bg-white p-2 shadow-md">
                <FcGoogle className="h-5 w-5" aria-hidden="true" />
              </span>
              Continue with Google
            </button>
          </div>
        </form>
      </div>

      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 left-1/2 h-[1000px] w-[1000px] -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
        <div className="absolute -bottom-1/2 right-1/2 h-[1000px] w-[1000px] translate-x-1/2 rounded-full bg-purple-500/20 blur-3xl" />
      </div>
    </div>
  );
}
