import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  const threshold = Number(req.nextUrl.searchParams.get('threshold')) || 50000;
  
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      // This would connect to SDS and push events
      // For now, return a simple SSE stream
      controller.enqueue(encoder.encode('retry: 10000\n\n'));
      
      // Keep connection alive
      const interval = setInterval(() => {
        controller.enqueue(encoder.encode(':\n\n'));
      }, 15000);

      req.signal.addEventListener('abort', () => {
        clearInterval(interval);
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}