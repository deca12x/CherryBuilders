import { NextResponse } from 'next/server';
import * as jose from 'jose';

const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;

if (!supabaseJwtSecret) {
  throw new Error('Missing SUPABASE_JWT_SECRET');
}

export async function POST(request: Request) {
  console.log('Received request to generate JWT');

  const { evmAddress } = await request.json();
  console.log('Received evmAddress:', evmAddress);

  if (!evmAddress) {
    console.log('Missing evmAddress');
    return NextResponse.json({ error: 'Missing evmAddress' }, { status: 400 });
  }

  try {
    const payload = {
      aud: 'authenticated',
      exp: Math.floor(Date.now() / 1000) + 60 * 60, // 1 hour from now
      sub: evmAddress,
      role: 'authenticated',
      evm_address: evmAddress,
      iat: Math.floor(Date.now() / 1000),
      iss: 'supabase'
    };

    const secret = new TextEncoder().encode(supabaseJwtSecret);

    const jwt = await new jose.SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
      .sign(secret);

    console.log('JWT generated successfully');
    return NextResponse.json({ jwt });
  } catch (error: any) {
    console.error('Error generating JWT:', error);
    return NextResponse.json({ error: 'Failed to generate JWT', details: error.message }, { status: 500 });
  }
}
