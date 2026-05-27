export const prerender = false;

import type { APIRoute } from 'astro';
import { json } from '~/lib/api';
import { getPoints } from '~/lib/pgh-ticket/db';

export const GET: APIRoute = async ({ url }) => {
  const limit = Math.min(parseInt(url.searchParams.get('limit') || '20000', 10), 100000);
  return json(await getPoints(limit, {
    officer: url.searchParams.get('officer'),
    year: url.searchParams.get('year'),
    status: url.searchParams.get('status'),
    violation: url.searchParams.get('violation'),
    location: url.searchParams.get('location'),
    plate: url.searchParams.get('plate'),
    dateFrom: url.searchParams.get('dateFrom'),
    dateTo: url.searchParams.get('dateTo'),
  }));
};
