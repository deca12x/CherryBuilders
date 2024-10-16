import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_ANON_KEY!);

export async function POST(request: Request) {
  const { address } = await request.json();

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('user_data')
      .select('ONLY_LANNA_HACKERS')
      .eq('evm_address', address)
      .single();

    if (error) {
      throw error;
    }

    if (data === null) {
      return NextResponse.json({ ONLY_LANNA_HACKERS: false });
    }

    return NextResponse.json({ ONLY_LANNA_HACKERS: data.ONLY_LANNA_HACKERS });
  } catch (error) {
    console.error('Error fetching ONLY_LANNA_HACKERS preference:', error);
    return NextResponse.json({ error: 'Failed to fetch preference' }, { status: 500 });
  }
}

