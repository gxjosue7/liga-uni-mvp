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

export async function logoutAction() {
  await signOut({ redirectTo: '/login' })
}
