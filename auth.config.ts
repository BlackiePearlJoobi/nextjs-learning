import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    // add the logic to protect your routes. This will prevent users from accessing the dashboard pages unless they are logged in.
    // It is called before a request is completed, and it receives an object with the auth and request properties.
    // The auth property contains the user's session, including the user object returned from authorize function in auth.ts file, and the request property contains the incoming request.
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      if (isOnDashboard) {
        if (isLoggedIn) return true; // The user will stay on the page.
        return false; // NextAuth automatically redirects unauthenticated users to login page, which is defined above: pages: { signIn: "/login", }
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl));
      }
      return true; // The user will stay on the page.
    },
  },
  providers: [], // an empty array for now to satisfy NextAuth config.
} satisfies NextAuthConfig;
