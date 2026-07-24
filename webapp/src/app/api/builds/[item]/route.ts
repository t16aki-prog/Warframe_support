import { NextResponse } from 'next/server';
import { generateWarframeBuild } from '@/lib/ordisAi.js';
import { resolveAlias } from '@/lib/aliases.js';

export async function GET(request: Request, { params }: { params: Promise<{ item: string }> }) {
  try {
    const apiKey = request.headers.get('x-api-key') || process.env.GEMINI_API_KEY;
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'Warframe';
    const resolvedItem = resolveAlias((await params).item);
    const buildData = await generateWarframeBuild(resolvedItem, apiKey, category);
    return NextResponse.json(buildData);
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to generate build data. ' + error.message }, { status: 500 });
  }
}