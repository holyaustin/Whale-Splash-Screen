import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    defaultThreshold: Number(process.env.WHALE_THRESHOLD) || 50000,
  });
}