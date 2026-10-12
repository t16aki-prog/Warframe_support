import { NextResponse } from 'next/server';
import { staticBuilds } from '@/lib/staticBuilds.js';

export async function GET() {
  const augmentsList: any[] = [];
  for (const [frameName, frameData] of Object.entries(staticBuilds.frames)) {
    if (frameData.augments && frameData.augments.length > 0) {
      frameData.augments.forEach(aug => {
        augmentsList.push({
          frame: frameData.itemName,
          modName: aug.name,
          effect: aug.effect,
          syndicate: aug.syndicate || '不明'
        });
      });
    }
  }
  return NextResponse.json({ augments: augmentsList });
}