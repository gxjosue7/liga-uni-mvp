import type { NextAuthConfig } from 'next-auth'

// Parte do Auth.js segura para o proxy (sem Prisma/bcrypt). Sem Prisma Adapter:
// a sessão é um JWT que carrega só id/role/entityId. A autorização de verdade
// reconsulta o usuário no banco (ver src/lib/session.ts).
export const authConfig = {
  providers: [],
  trustHost: true,
  session: { strategy: 'jwt', maxAge: 60 * 60 * 12 },
  pages: { signIn: '/login' },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.entityId = user.entityId ?? null
      }
      return token
    },
    session({ session, token }) {
      if (typeof token.id === 'string' && (token.role === 'ADMIN' || token.role === 'LEADER')) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.entityId = typeof token.entityId === 'string' ? token.entityId : null
      }
      return session
    },
  },
} satisfies NextAuthConfig
