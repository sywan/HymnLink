import type { NextAuthOptions } from "next-auth";
import GitHubProvider from "next-auth/providers/github";
import GoogleProvider from "next-auth/providers/google";
import { isAdmin } from "@/lib/sheets";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  );
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHubProvider({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session }) {
      if (session.user) {
        session.user.role = (await isAdmin(session.user.email)) ? "admin" : "user";
      }
      return session;
    },
    async jwt({ token }) {
      token.role = (await isAdmin(token.email)) ? "admin" : "user";
      return token;
    }
  }
};
