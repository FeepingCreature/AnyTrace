import { handler as astroHandler } from '@astrojs/node/server';
import { ConfigLoader } from '../config/loader';

// Initialize configuration
const configLoader = ConfigLoader.getInstance();
configLoader.loadConfig(process.env.CONFIG_PATH);

export function handler(request: Request, context: any) {
    return astroHandler(request, context);
}
