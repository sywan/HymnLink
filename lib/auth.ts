import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { getAccessRole, isAuthorizedUser } from "@/lib/sheets";

const providers: NextAuthOptions["providers"] = [];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET
    })
  );
}

export const authOptions: NextAuthOptions = {
  providers,
  session: {
    strategy: "jwt"
  },
  pages: {
    error: "/auth/error"
  },
  callbacks: {
    async signIn({ user }) {
      return isAuthorizedUser(user.email);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.role = token.role ?? undefined;
      }
      return session;
    },
    async jwt({ token }) {
      token.role = await getAccessRole(token.email);
      return token;
    }
  }
};
