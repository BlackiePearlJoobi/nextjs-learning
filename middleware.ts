// Middleware functions handle requests and responses in your application.

// If this file is authentication-related, it might enforce certain rules, such as restricting access to routes based on user roles or session validity.

// Middleware often works with the logic from auth.ts to decide whether a user is authorized to access specific resources. For example, it might verify a token from a request header using a function from auth.ts.

// The advantage of employing Middleware for this task is that the protected routes will not even start rendering until the Middleware verifies the authentication, enhancing both the security and performance of your application.

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  // https://nextjs.org/docs/app/building-your-application/routing/middleware#matcher
  matcher: ["/((?!api|_next/static|_next/image|.*\\.png$).*)"],
};
