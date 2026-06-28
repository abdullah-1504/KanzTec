import { NextResponse } from 'next/server';
import { buildSeedReservations, SAMPLE_GUESTS } from '@/lib/mockData';
import { computeAnalytics, type AnalyticsRange } from '@/lib/helpers/analytics';

// GET /api/analytics?range=today|week|month — ROI metrics computed from data.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = (searchParams.get('range') as AnalyticsRange) || 'month';
  const result = computeAnalytics(buildSeedReservations(), SAMPLE_GUESTS, range);
  return NextResponse.json(result);
}