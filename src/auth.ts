import NextAuth from "next-auth";
import Google from "next-auth/providers/google";

/** Read-only access to Gmail messages — the only Gmail scope this app needs. */
const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";

const GOOGLE_TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";

/** Refresh an expired Google access token using the stored refresh token. */
async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  expiresAt: number;
} | null> {
  const response = await fetch(GOOGLE_TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.AUTH_GOOGLE_ID ?? "",
      client_secret: process.env.AUTH_GOOGLE_SECRET ?? "",
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) return null;

  const data = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };
  return {
    accessToken: data.access_token,
    expiresAt: Math.floor(Date.now() / 1000) + data.expires_in,
  };
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      authorization: {
        params: {
          scope: `openid email profile ${GMAIL_READONLY_SCOPE}`,
          // access_type=offline + prompt=consent are required to receive a
          // refresh token, so the app keeps read access without re-prompting.
          access_type: "offline",
          prompt: "consent",
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account }) {
      // Initial sign-in: persist the tokens Google returned.
      if (account) {
        token.accessToken = account.access_token ?? null;
        token.refreshToken = account.refresh_token ?? null;
        token.expiresAt = account.expires_at ?? null;
        token.error = null;
        return token;
      }

      // Still valid (60s safety margin) — reuse as-is.
      if (token.expiresAt && Date.now() < (token.expiresAt - 60) * 1000) {
        return token;
      }

      // Expired — refresh.
      if (!token.refreshToken) {
        token.error = "RefreshFailed";
        return token;
      }
      const refreshed = await refreshAccessToken(token.refreshToken);
      if (!refreshed) {
        token.accessToken = null;
        token.error = "RefreshFailed";
        return token;
      }
      token.accessToken = refreshed.accessToken;
      token.expiresAt = refreshed.expiresAt;
      token.error = null;
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      session.error = token.error;
      return session;
    },
  },
});
