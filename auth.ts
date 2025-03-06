// This file generally contains the main logic or functions for handling authentication.

// It may include functions for login, logout, verifying tokens, or generating tokens based on the configuration settings from auth.config.ts.

import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import type { User } from "@/app/lib/definitions";
import bcryptjs from "bcryptjs";
import postgres from "postgres";

const sql = postgres(process.env.POSTGRES_URL!, { ssl: "require" });

async function getUser(email: string): Promise<User | undefined> {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email=${email}`;
    return user[0];
  } catch (error) {
    console.error("Failed to fetch user:", error);
    throw new Error("Failed to fetch user.");
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig, // spreads the authConfig object
  providers: [
    // list different login options such as Google or GitHub.
    // For this course, we will focus on using the Credentials provider only, which allows users to log in with a username and a password.
    Credentials({
      // use Credentials' authorize function to handle the authentication logic
      async authorize(credentials) {
        // use zod to validate the email and password before checking if the user exists in the database
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);
        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          const user = await getUser(email);
          if (!user) return null;
          const passwordsMatch = await bcryptjs.compare(
            password,
            user.password
          );
          if (passwordsMatch) return user; // If the authorize function returns a valid user object, the user is authenticated, and their session is established.
          // The authorize function in the Credentials provider is specifically designed to return a user object when authentication is successful. This is a requirement of NextAuth.jsfor managing authenticated sessions and user data effectively.
          // This user object is then included in the auth property that you access in callbacks, middleware, or other parts of your app.
        }

        console.log("Invalid credentials");
        return null;
      },
    }),
  ],
});

// next, import the signIn function in action.ts file.
