import { NextResponse } from "next/server";
import { auth } from "@/auth";

export default auth((req) => {
  const isLoggedIn = !!req.auth?.user;
  const isOnPublicRoute = req.nextUrl.pathname === "/";
  const isOnAuthRoute = req.nextUrl.pathname.startsWith("/auth");

  // Allow public routes
  if (isOnPublicRoute || isOnAuthRoute) {
    return NextResponse.next();
  }

  // Redirect to signin if accessing protected route while not logged in
  if (!isLoggedIn) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  // Check for authorized email
  const allowedEmails = ["bigbyteberry@gmail.com","marinalabaff2@gmail.com","joey@storyroi.com"];
  if (!allowedEmails.includes(req.auth?.user?.email || "")) {
    return Response.redirect(new URL("/", req.nextUrl));
  }

  return NextResponse.next();
});

// Configure matcher to specify which routes to run middleware on
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};