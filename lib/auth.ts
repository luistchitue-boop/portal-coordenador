import CredentialsProvider from "next-auth/providers/credentials"
import { NextAuthOptions } from "next-auth"
import { getServerSession } from "next-auth/next"
import { connection } from "@/lib/db"
import bcrypt from "bcryptjs"

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

        // Try DB lookup first (if the DB exists and has users)
        try {
          // SQLite `better-sqlite3` connection exposes `prepare`/`run`
          if ((connection as any).prepare) {
            const row = (connection as any).prepare(
              "SELECT id, email, password, name, admin FROM users WHERE email = ?"
            ).get(email) as any
            if (row && bcrypt.compareSync(password, (row as any).password)) {
              return { id: String(row.id), name: row.name, email: row.email, admin: Boolean(row.admin) }
            }
          } else {
            // Postgres `postgres` client supports tagged template queries
            const res = await (connection as any)`SELECT id, email, password, name, admin FROM users WHERE email = ${email}`
            const row = res && res.length ? res[0] : null
            if (row && bcrypt.compareSync(password, row.password)) {
              return { id: String(row.id), name: row.name, email: row.email, admin: Boolean(row.admin) }
            }
          }
        } catch (err) {
          // ignore DB errors and fallback to env-based credentials
          // eslint-disable-next-line no-console
          console.warn("DB auth check failed, falling back to env auth", err)
        }

        // Fallback: env-based credential check (useful for quick local testing)
        if (
          email === process.env.AUTH_EMAIL &&
          password === process.env.AUTH_PASSWORD
        ) {
          return {
            id: "1",
            name: process.env.AUTH_NAME ?? "User",
            email,
            admin: true,
          }
        }

        return null
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        if (typeof (user as any).admin !== "undefined") token.admin = (user as any).admin
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        ;(session.user as any).id = token.sub
        ;(session.user as any).admin = Boolean((token as any).admin)
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
