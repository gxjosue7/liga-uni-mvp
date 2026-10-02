import { NextResponse } from 'next/server'
import NextAuth from 'next-auth'

import { authConfig } from '@/lib/auth.config'

const { auth } = NextAuth(authConfig)

const HOME = { ADMIN: '/admin/dashboard', LEADER: '/lider/dashboard' } as const

// Camada grossa de redirecionamento (UX). A autorização de verdade acontece no
// servidor: layouts usam requireAdmin/requireLeader e cada Server Action
// valida o ator e o escopo de dados por conta própria.
//
// /login fica FORA do matcher de propósito: o JWT pode estar válido para um
// usuário já desativado. Redirecionar /login -> home aqui, enquanto o layout
// redireciona home -> /login, gerava um loop. Quem decide é a página de login,
// consultando o banco (getActor).
export default auth((request) => {
  const { pathname } = request.nextUrl
  const role = request.auth?.user?.role

  if (!role) return NextResponse.redirect(new URL('/login', request.url))

  const area = pathname.startsWith('/admin') ? 'ADMIN' : 'LEADER'
  if (role !== area) return NextResponse.redirect(new URL(HOME[role], request.url))

  return NextResponse.next()
})

export const config = {
  matcher: ['/admin/:path*', '/lider/:path*'],
}
