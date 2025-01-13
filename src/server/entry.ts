import { handler as astroHandler } from '@astrojs/node/server';
import { ConfigLoader } from '../config/loader';

// Initialize configuration
const configLoader = ConfigLoader.getInstance();

// Ensure configuration is loaded before handling any requests
try {
    configLoader.loadConfig(process.env.CONFIG_PATH);
    console.log('Configuration loaded successfully');
} catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
}

export async function handler(request: Request, context: any) {
    // Verify configuration is loaded before each request
    if (!configLoader.getConfig()) {
        throw new Error('Configuration not loaded');
    }
    return astroHandler(request, context);
}
