import "next-auth";

declare module "next-auth" {
  interface User {
    role?: "admin" | "user";
  }

  interface Session {
    user?: {
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role?: "admin" | "user";
    };
  }
}
