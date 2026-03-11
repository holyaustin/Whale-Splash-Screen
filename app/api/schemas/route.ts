import { NextResponse } from 'next/server';
import { ensureSchemaRegistered, PUBLISHER_ADDRESS } from '@/app/lib/sdsService';

export async function GET() {
  try {
    const { whaleSchemaId } = await ensureSchemaRegistered();

    return NextResponse.json({
      whaleSchemaId,
      publisher: PUBLISHER_ADDRESS,
    });
  } catch (err: any) {
    console.error('❌ schema registration error:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}