import { NextResponse } from 'next/server';
import { ensureSchemaRegistered } from '@/app/lib/sdsService';

export async function GET() {
  const schemaId = await ensureSchemaRegistered();
  return NextResponse.json({ schemaId });
}