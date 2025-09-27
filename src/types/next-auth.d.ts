import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: string;
      fullName: string | null;
      subscription: any;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    email: string;
    role: string;
    fullName: string | null;
    subscription: any;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email: string;
    role: string;
    fullName: string | null;
    subscription: any;
  }
}