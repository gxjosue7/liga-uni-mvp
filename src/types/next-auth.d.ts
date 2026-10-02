import type { DefaultSession } from 'next-auth'

type AppRole = 'ADMIN' | 'LEADER'

declare module 'next-auth' {
  interface User {
    role?: AppRole
    entityId?: string | null
  }

  interface Session {
    user: {
      id: string
      role: AppRole
      entityId: string | null
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id?: string
    role?: AppRole
    entityId?: string | null
  }
}
