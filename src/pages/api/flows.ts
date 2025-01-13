import type { APIRoute } from 'astro';
import { ConfigLoader } from '../../config/loader';

export const GET: APIRoute = async () => {
  try {
    const config = ConfigLoader.getInstance().loadConfig();
    return new Response(JSON.stringify(config.flows), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};
