import { createClient } from "@supabase/supabase-js";
import * as jose from 'jose';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SERVICE_ROLE_KEY;
const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error("Missing Supabase URL, Service Role Key, or SUPABASE_JWT_SECRET");
}

// Creates a Supabase client with a service_role key
// This only works in the backend
export const supabase = createClient(supabaseUrl, supabaseServiceRoleKey, {
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

export async function generateSupabaseJWT(evmAddress: string) {
  const payload = {
    aud: 'authenticated',
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
    sub: evmAddress,
    role: 'authenticated',
    evm_address: evmAddress,
    iat: Math.floor(Date.now() / 1000),
    iss: 'supabase'
  };

  const secret = new TextEncoder().encode(supabaseJwtSecret);

  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .sign(secret);
}
