import { ConfigLoader } from '../config/loader';

// Initialize configuration on server start
try {
    const configLoader = ConfigLoader.getInstance();
    configLoader.loadConfig(process.env.CONFIG_PATH);
    console.log('Configuration loaded successfully');
} catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
}

// Export handler for Astro
export { handler } from '@astrojs/node/server';
