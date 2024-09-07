import { NextRequest, NextResponse } from 'next/server';

interface ProofData {
  proof: string;
  merkle_root: string;
  nullifier_hash: string;
  verification_level: string;
}

export async function POST(request: NextRequest) {
  try {
    const proofData: ProofData = await request.json();

    // Check if all required fields are present
    if (
      proofData.proof &&
      proofData.merkle_root &&
      proofData.nullifier_hash &&
      proofData.verification_level
    ) {
      // All required fields are present, send 200 OK
      return NextResponse.json({ message: 'Proof verified successfully' }, { status: 200 });
    } else {
      // Missing required fields, send 400 Bad Request
      return NextResponse.json({ error: 'Invalid proof data' }, { status: 400 });
    }
  } catch (error) {
    // Error parsing JSON or other unexpected error
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }
}