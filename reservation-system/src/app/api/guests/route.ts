import { NextResponse } from 'next/server';
import { SAMPLE_GUESTS } from '@/lib/mockData';

// GET /api/guests — list guest CRM profiles.
export async function GET() {
  return NextResponse.json({ guests: SAMPLE_GUESTS });
}