export const prerender = false;

import type { APIRoute } from 'astro';
import { json } from '~/lib/api';
import { getFilterOptions } from '~/lib/pgh-ticket/db';

export const GET: APIRoute = async () => {
  return json(await getFilterOptions());
};
