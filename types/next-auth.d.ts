import "next-auth";
import "next-auth/jwt";

type HymnLinkRole = "admin" | "user";

declare module "next-auth" {
  interface User {
    role?: HymnLinkRole | null;
  }

  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: HymnLinkRole | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: HymnLinkRole | null;
  }
}
