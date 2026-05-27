export const prerender = false;

import type { APIRoute } from 'astro';
import { json } from '~/lib/api';
import { getStats } from '~/lib/pgh-ticket/db';

export const GET: APIRoute = async ({ url }) => {
  return json(await getStats({
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
