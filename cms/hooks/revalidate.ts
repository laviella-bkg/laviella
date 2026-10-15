import { revalidatePath } from 'next/cache'

// Invalida la caché de todo el sitio cuando cambia contenido que se muestra en él.
// Fuera de Next (scripts con `payload run`) no hay caché que invalidar y revalidatePath falla.
const revalidateSite = () => {
  try {
    revalidatePath('/', 'layout')
  } catch {
    // ignorar
  }
}

export const revalidateHooks = {
  afterChange: [revalidateSite],
  afterDelete: [revalidateSite],
}
