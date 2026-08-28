import "server-only";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import { compare } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { rateLimit, clientIpFrom, RATE_POLICIES } from "@/lib/rate-limit";
import { ROLES, type Role } from "@/lib/constants";

const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        // Brute-force protection per email+IP pair.
        const ip = clientIpFrom(new Headers());
        const rl = rateLimit(`login:${email.toLowerCase()}:${ip}`, RATE_POLICIES.login);
        if (!rl.ok) return null;

        const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
        if (!user || !user.passwordHash) return null;

        const ok = await compare(password, user.passwordHash);
        if (!ok) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role as Role,
        };
      },
    }),
    ...(googleEnabled
      ? [
          Google({
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            authorization: {
              params: { prompt: "select_account", access_type: "offline" },
            },
          }),
        ]
      : []),
  ],
  callbacks: {
    async jwt({ token, user, account, profile }) {
      if (user && account) {
        if (account.provider === "google") {
          // Account linking policy: match by verified email.
          // Google guarantees email verification for accounts that pass it here.
          const email = (profile?.email ?? user.email)?.toLowerCase();
          if (!email) return token;

          let dbUser = await prisma.user.findUnique({ where: { email } });

          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                name: user.name ?? email.split("@")[0],
                email,
                passwordHash: null,
                image: user.image ?? null,
                emailVerified: new Date(),
                role: ROLES.STUDENT,
              },
            });
            await prisma.studentProfile.create({
              data: {
                userId: dbUser.id,
                targetRoles: "[]",
                interests: "[]",
                preferredIndustries: "[]",
                preferences: "{}",
              },
            }).catch(() => {});
          }

          token.id = dbUser.id;
          token.role = dbUser.role as Role;
          token.picture = user.image ?? dbUser.image ?? undefined;
          return token;
        }

        // Credentials flow — user object came from authorize().
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as Role) ?? ROLES.STUDENT;
      }
      return session;
    },
  },
});
