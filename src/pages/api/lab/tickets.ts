export const prerender = false;

import type { APIRoute } from 'astro';
import { json } from '~/lib/api';
import { getTickets } from '~/lib/pgh-ticket/db';

const PAGE_SIZE = 20;

export const GET: APIRoute = async ({ url }) => {
  const page = parseInt(url.searchParams.get('page') || '1', 10);
  return json(await getTickets(page, PAGE_SIZE, {
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
