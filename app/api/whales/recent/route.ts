import { NextResponse } from 'next/server';
import { readRecentWhales } from '@/app/lib/sdsService';

export async function GET() {
  try {
    const whales = await readRecentWhales(50);
    return NextResponse.json(whales);
  } catch (error) {
    console.error('Failed to fetch whales:', error);
    return NextResponse.json([], { status: 500 });
  }
}