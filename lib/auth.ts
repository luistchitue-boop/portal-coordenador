import CredentialsProvider from "next-auth/providers/credentials"
import { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth/next"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = credentials?.email ?? ""
        const password = credentials?.password ?? ""

        // Simple env-based credential check. Replace with DB lookup in production.
        if (
          email === process.env.AUTH_EMAIL &&
          password === process.env.AUTH_PASSWORD
        ) {
          return {
            id: "1",
            name: process.env.AUTH_NAME ?? "User",
            email,
          }
        }
        return null
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as any).id = token.sub
      }
      return session
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
}

export async function getServerAuthSession() {
  try {
    return await getServerSession(authOptions)
  } catch (err) {
    // Log and return null so build/deploy doesn't crash when envs are missing
    // (e.g., during static builds on Vercel). Ensure you set NEXTAUTH_SECRET
    // and NEXTAUTH_URL in Vercel environment settings for production.
    // eslint-disable-next-line no-console
    console.error("getServerAuthSession error:", err)
    return null
  }
}
