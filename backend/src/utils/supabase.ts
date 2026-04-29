import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('❌ Faltan variables de entorno de Supabase. Revisa tu archivo .env');
}

// Cliente con permisos de servicio (para operaciones del backend)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Cliente público (para operaciones que no requieren admin)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabaseAdmin;
