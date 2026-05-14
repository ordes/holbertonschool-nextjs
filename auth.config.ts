import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

// Edge-compatible config used by middleware
// GitHub provider is stateless (OAuth redirect) so it's safe here
export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/sign-in",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isUiRoute = nextUrl.pathname.startsWith("/ui");
      if (isUiRoute) return isLoggedIn;
      return true;
    },
  },
  providers: [GitHub],
};
