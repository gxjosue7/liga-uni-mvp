import 'server-only'
import { revalidatePath } from 'next/cache'

// Tudo que a Liga UNI mostra é por usuário e depende dos mesmos dados:
// invalidar as duas áreas inteiras é mais simples e seguro que listar rota a rota.
export function refreshApp() {
  revalidatePath('/admin', 'layout')
  revalidatePath('/lider', 'layout')
}
