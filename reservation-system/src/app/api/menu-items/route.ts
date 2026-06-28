import { NextResponse } from 'next/server';
import { SAMPLE_MENU } from '@/lib/mockData';

// GET /api/menu-items — returns the pre-order menu.
export async function GET() {
  return NextResponse.json({ menuItems: SAMPLE_MENU });
}