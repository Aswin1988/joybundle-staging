import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    service: 'joybundle',
    status: 'ok',
    environment: process.env.NODE_ENV || 'development',
    version: process.env.JOYBUNDLE_VERSION || '0.1.0',
  });
}
