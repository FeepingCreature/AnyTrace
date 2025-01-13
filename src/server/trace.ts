import { exec } from 'child_process';
import { promisify } from 'util';
import { Sampler } from '../types/config';
import { ConfigLoader } from '../config/loader';

const execAsync = promisify(exec);

interface TraceRequest {
  flowId: string;
  variables: Record<string, string>;
}

interface SamplerResult {
  samplerId: string;
  name: string;
  output: string;
  error?: string;
  status: 'success' | 'error' | 'no-match';
}

interface TraceResult {
  flowId: string;
  results: SamplerResult[];
}

function interpolateCommand(command: string, variables: Record<string, string>): string {
  return command.replace(/\${(\w+)}/g, (_, key) => variables[key] || '');
}

async function executeSampler(sampler: Sampler, variables: Record<string, string>): Promise<SamplerResult> {
  const command = interpolateCommand(sampler.command, variables);
  
  try {
    const { stdout, stderr } = await execAsync(command, { timeout: sampler.timeout * 1000 });
    
    return {
      samplerId: sampler.id,
      name: sampler.name,
      output: stdout,
      error: stderr || undefined,
      status: stdout.trim() ? 'success' : 'no-match'
    };
  } catch (error) {
    return {
      samplerId: sampler.id,
      name: sampler.name,
      output: '',
      error: (error as Error).message,
      status: 'error'
    };
  }
}

export async function executeTrace(request: TraceRequest): Promise<TraceResult> {
  const config = ConfigLoader.getInstance().getConfig();
  
  // Find the requested flow
  const flow = config.flows.find(f => f.id === request.flowId);
  if (!flow) {
    throw new Error(`Flow not found: ${request.flowId}`);
  }

  // Execute all samplers in parallel
  const samplerPromises = flow.samplers.map(samplerId => {
    const sampler = config.samplers.find(s => s.id === samplerId);
    if (!sampler) {
      throw new Error(`Sampler not found: ${samplerId}`);
    }
    return executeSampler(sampler, request.variables);
  });

  const results = await Promise.all(samplerPromises);

  return {
    flowId: flow.id,
    results
  };
}
