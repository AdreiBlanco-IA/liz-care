// Cliente de Supabase. Es opcional: solo se crea si VITE_SUPABASE_ACTIVO=true y hay URL y llave.
// Mientras se termina la lógica de los módulos, la app corre con los datos en memoria; la conexión
// a Supabase se reactiva al final con esa bandera.
import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const llave = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined

const activo = import.meta.env.VITE_SUPABASE_ACTIVO === 'true'

export const supabase = activo && url && llave ? createClient(url, llave) : null
