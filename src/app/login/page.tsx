import type { Metadata } from 'next'
import { redirect } from 'next/navigation'

import { ActionForm } from '@/components/form/ActionForm'
import { TextField } from '@/components/form/Fields'
import { Logo } from '@/components/layout/Logo'
import { SITE } from '@/config/site'
import { loginAction } from '@/app/login/actions'
import { getActor, homeFor } from '@/lib/session'

export const metadata: Metadata = { title: 'Entrar' }

export default async function LoginPage() {
  const actor = await getActor()
  if (actor) redirect(homeFor(actor.role))

  return (
    <div className="min-h-dvh md:grid md:grid-cols-[1fr_28rem] lg:grid-cols-[1fr_32rem]">
      <section className="grid-plan relative hidden bg-brand md:flex md:flex-col md:justify-between md:p-12">
        <Logo isOnBrand />
        <div className="max-w-xl">
          <p className="display text-4xl leading-[1.1] lg:text-5xl">{SITE.tagline}</p>
          <p className="mt-5 max-w-md text-base text-ink-soft">
            Membros, calendário e reservas de salas das entidades que fazem o Ágora UNI acontecer.
          </p>
        </div>
        <p className="text-sm text-ink-soft">Ágora Tech Park, dentro do Perini Business Park, em Joinville/SC</p>
      </section>

      <main className="flex min-h-dvh flex-col justify-center bg-surface px-6 py-10 md:min-h-0 md:px-12">
        <Logo className="mb-10 md:hidden" />
        <div className="mx-auto w-full max-w-sm">
          <h1 className="display text-2xl">Entrar na Liga UNI</h1>
          <p className="mb-8 mt-2 text-sm text-ink-muted">Use o e-mail e a senha fornecidos pela equipe do Ágora.</p>
          <ActionForm action={loginAction} submit={{ label: 'Entrar', pendingLabel: 'Entrando…', isFullWidth: true }} className="space-y-5">
            <TextField label="E-mail" name="email" type="email" autoComplete="username" inputMode="email" required />
            <TextField label="Senha" name="password" type="password" autoComplete="current-password" required />
          </ActionForm>
        </div>
      </main>
    </div>
  )
}
