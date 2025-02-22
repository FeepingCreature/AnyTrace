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
    
    // Get all variable values to highlight
    const searchTerms = Object.values(variables).filter(Boolean);
    
    // Escape special regex characters and create a regex pattern
    const pattern = searchTerms
      .map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|');
    
    // Replace matches with bold tags
    const highlightedOutput = stdout.replace(
      new RegExp(`(${pattern})`, 'gi'),
      '<strong>$1</strong>'
    );
    
    return {
      samplerId: sampler.id,
      name: sampler.name,
      output: highlightedOutput,
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
  const config = ConfigLoader.getInstance().loadConfig();
  
  // Find the requested flow
  const flow = config.flows.find(f => f.id === request.flowId);
  if (!flow) {
    throw new Error(`Flow not found: ${request.flowId}`);
  }
  
  // Get sampler info upfront
  const samplerInfo = flow.samplers.map(samplerId => {
    const sampler = config.samplers.find(s => s.id === samplerId);
    if (!sampler) {
      throw new Error(`Sampler not found: ${samplerId}`);
    }
    return {
      id: sampler.id,
      name: sampler.name
    };
  });

  // Execute samplers in parallel
  const samplerPromises = flow.samplers.map(async (samplerId, index) => {
    const sampler = config.samplers.find(s => s.id === samplerId);
    if (!sampler) {
      throw new Error(`Sampler not found: ${samplerId}`);
    }
    return executeSampler(sampler, request.variables);
  });

  return {
    flowId: flow.id,
    samplers: samplerInfo,
    samplerPromises
  }
}
