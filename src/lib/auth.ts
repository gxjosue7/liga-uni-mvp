import 'server-only'
import bcrypt from 'bcryptjs'
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'

import { authConfig } from '@/lib/auth.config'
import { prisma } from '@/lib/db'
import { loginSchema } from '@/lib/validations/auth'

// Hash descartável: quando o e-mail não existe, comparamos contra ele para
// manter o tempo de resposta parecido e não revelar quais contas existem.
const DUMMY_HASH = bcrypt.hashSync('liga-uni-dummy-password', 10)

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      async authorize(raw) {
        const parsed = loginSchema.safeParse(raw)
        if (!parsed.success) return null

        const user = await prisma.user.findUnique({
          where: { email: parsed.data.email },
          select: {
            id: true,
            name: true,
            email: true,
            passwordHash: true,
            role: true,
            entityId: true,
            active: true,
            entity: { select: { active: true } },
          },
        })

        const passwordOk = await bcrypt.compare(parsed.data.password, user?.passwordHash ?? DUMMY_HASH)
        if (!user || !passwordOk || !user.active) return null
        if (user.role === 'LEADER' && (!user.entityId || !user.entity?.active)) return null

        return { id: user.id, name: user.name, email: user.email, role: user.role, entityId: user.entityId }
      },
    }),
  ],
})
