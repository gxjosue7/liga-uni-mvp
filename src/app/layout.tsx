import type { Metadata, Viewport } from 'next'
import { Archivo } from 'next/font/google'

import './globals.css'

const archivo = Archivo({
  subsets: ['latin'],
  axes: ['wdth'],
  variable: '--font-archivo',
  display: 'swap',
})

export const metadata: Metadata = {
  title: { default: 'Liga UNI', template: '%s | Liga UNI' },
  description: 'Gestão da relação do Ágora UNI com as entidades acadêmicas de Joinville.',
  robots: { index: false, follow: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#ffce00',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={archivo.variable}>
      <body>{children}</body>
    </html>
  )
}
