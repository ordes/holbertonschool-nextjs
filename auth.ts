import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import { z } from "zod";
import bcryptjs from "bcryptjs";
import { query } from "@/lib/db";
import { authConfig } from "@/auth.config";

type DBUser = { id: string; email: string; name: string; password: string };

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user) {
        token.id = user.id ?? token.sub ?? "";
        token.name = user.name ?? "";
        token.email = user.email ?? "";
        token.picture = user.image ?? (profile as { avatar_url?: string })?.avatar_url ?? null;
      }
      // Persist GitHub avatar on subsequent requests
      if (account?.provider === "github" && profile) {
        const gh = profile as { avatar_url?: string };
        token.picture = gh.avatar_url ?? token.picture;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = (token.id as string) || token.sub || "";
        session.user.name = token.name as string;
        session.user.email = token.email as string;
        session.user.image = token.picture as string | null;
      }
      return session;
    },
  },
  providers: [
    GitHub,
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsed = z
          .object({ email: z.string().email(), password: z.string().min(1) })
          .safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const rows = await query<DBUser>(
          "SELECT id, email, name, password FROM users WHERE email = ?",
          [email]
        );
        const user = rows[0];
        if (!user) return null;

        const match = await bcryptjs.compare(password, user.password);
        if (!match) return null;

        return { id: user.id, email: user.email, name: user.name, image: null };
      },
    }),
  ],
});
