import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { SignJWT, jwtVerify } from 'jose';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:4000';

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(credentials) {
        const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(credentials),
        });

        if (!res.ok) return null;

        const user = await res.json();
        return { id: user.id, name: user.name, email: user.email, role: user.role, image: user.image };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub!;
        (session.user as Record<string, unknown>).role = token.role;
      }
      return session;
    },
  },
  jwt: {
    maxAge: 7 * 24 * 60 * 60,
    async encode({ token, secret }) {
      return new SignJWT(token as Record<string, unknown>)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(new TextEncoder().encode(secret));
    },
    async decode({ token, secret }) {
      if (!token) return null;
      const { payload } = await jwtVerify(token, new TextEncoder().encode(secret), {
        algorithms: ['HS256'],
      });
      return payload as Record<string, unknown>;
    },
  },
  pages: {
    signIn: '/login',
  },
});
