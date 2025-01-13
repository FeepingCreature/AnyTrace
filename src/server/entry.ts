import { defineMiddleware } from 'astro/middleware';
import { ConfigLoader } from '../config/loader';

// Initialize configuration once when the module loads
const configLoader = ConfigLoader.getInstance();
try {
    configLoader.loadConfig(process.env.CONFIG_PATH);
    console.log('Configuration loaded successfully from entry.ts');
} catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
}

export const onRequest = defineMiddleware(async (context, next) => {
    try {
        // Verify configuration is loaded before each request
        if (!configLoader.getConfig()) {
            throw new Error('Configuration not loaded');
        }
        return await next();
    } catch (error) {
        console.error('Middleware error:', error);
        return new Response('Server configuration error', { status: 500 });
    }
});
