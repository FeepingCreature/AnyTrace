export interface Variable {
    name: string;
    type: 'string' | 'boolean';
    required?: boolean;
}

export interface Sampler {
    id: string;
    name: string;
    variables: Variable[];
    command: string;
    timeout: number;
}

export interface Flow {
    id: string;
    name: string;
    samplers: string[];
}

export interface AnyTraceConfig {
    samplers: Sampler[];
    flows: Flow[];
}
