// Cliente de Supabase. Sin variables de entorno, la app sigue funcionando con los datos en memoria del prototipo.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const llave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

export const supabase = url && llave ? createClient(url, llave) : null
