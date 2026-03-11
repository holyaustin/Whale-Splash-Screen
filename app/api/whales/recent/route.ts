import { NextRequest, NextResponse } from 'next/server';
import { readRecentWhales } from '@/app/lib/sdsService';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const whales = await readRecentWhales(limit);
    
    return NextResponse.json(whales ?? []);
  } catch (err: any) {
    if (err?.message?.includes("NoData")) {
      return NextResponse.json([]);
    }
    console.error('Failed to fetch whales:', err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.hash || !body.from || !body.value) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Import dynamically to avoid circular deps
    const { publishWhaleTransaction } = await import('@/app/lib/sdsService');
    
    const tx = await publishWhaleTransaction(body);
    
    return NextResponse.json({ success: true, tx });
  } catch (err: any) {
    console.error('❌ publish whale error:', err);
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}