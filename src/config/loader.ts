import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { AnyTraceConfig } from '../types/config';

export class ConfigLoader {
    private static instance: ConfigLoader;
    private config: AnyTraceConfig | null = null;
    
    private constructor() {}

    static getInstance(): ConfigLoader {
        if (!ConfigLoader.instance) {
            ConfigLoader.instance = new ConfigLoader();
        }
        return ConfigLoader.instance;
    }

    loadConfig(configPath?: string): AnyTraceConfig {
        const filePath = configPath || path.join(process.cwd(), 'config.yaml');
        
        try {
            const fileContents = fs.readFileSync(filePath, 'utf8');
            const config = yaml.load(fileContents) as AnyTraceConfig;
            
            // Basic validation
            if (!config.samplers || !Array.isArray(config.samplers)) {
                throw new Error('Configuration must include samplers array');
            }
            if (!config.flows || !Array.isArray(config.flows)) {
                throw new Error('Configuration must include flows array');
            }

            this.config = config;
            return config;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to load configuration: ${error.message}`);
            }
            throw error;
        }
    }

    getConfig(): AnyTraceConfig {
        if (!this.config) {
            throw new Error('Configuration not loaded');
        }
        return this.config;
    }
}
