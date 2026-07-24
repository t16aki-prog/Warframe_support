import { NextResponse } from 'next/server';
import { staticResources } from '@/lib/staticResources.js';

export async function GET() {
  return NextResponse.json({ resources: staticResources });
}