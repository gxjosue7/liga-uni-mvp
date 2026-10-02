'use server'

import { redirect } from 'next/navigation'
import { AuthError } from 'next-auth'

import { signIn, signOut } from '@/lib/auth'
import { parseForm, runAction } from '@/lib/action'
import { loginSchema } from '@/lib/validations/auth'
import { AppError } from '@/lib/errors'
import type { ActionState } from '@/lib/action-state'

export async function loginAction(_previous: ActionState, formData: FormData): Promise<ActionState> {
  const result = await runAction(async () => {
    const { email, password } = parseForm(loginSchema, formData)
    try {
      await signIn('credentials', { email, password, redirect: false })
    } catch (error) {
      if (error instanceof AuthError) {
        throw new AppError('INVALID', 'E-mail ou senha inválidos.')
      }
      throw error
    }
  })

  if (result.status === 'success') redirect('/')
  return result
}

// Sem redirectTo: o Auth.js monta a URL de destino a partir de AUTH_URL, e um
// AUTH_URL apontando para localhost mandava o logout de produção para lá. O
// redirect relativo do Next usa sempre o host da requisição.
export async function logoutAction() {
  await signOut({ redirect: false })
  redirect('/login')
}
