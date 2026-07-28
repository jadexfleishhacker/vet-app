import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    accessToken: string | null;
    /** Set when the Google access token could not be refreshed. */
    error: "RefreshFailed" | null;
    user: DefaultSession["user"];
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    accessToken: string | null;
    refreshToken: string | null;
    /** Unix seconds when the access token expires. */
    expiresAt: number | null;
    error: "RefreshFailed" | null;
  }
}
