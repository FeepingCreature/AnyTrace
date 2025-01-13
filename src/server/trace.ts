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
  console.log(`Executing sampler ${sampler.id} with command:`, command);
  
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

  // Initialize results array
  const results: SamplerResult[] = new Array(flow.samplers.length);
  
  // Execute samplers in parallel
  const samplerPromises = flow.samplers.map(async (samplerId, index) => {
    const sampler = config.samplers.find(s => s.id === samplerId);
    if (!sampler) {
      throw new Error(`Sampler not found: ${samplerId}`);
    }
    
    const result = await executeSampler(sampler, request.variables);
    results[index] = result;
    return result;
  });

  // Create a promise that resolves with the results and scripts
  const promise = Promise.all(samplerPromises).then(finalResults => ({
    results: finalResults,
    scripts: finalResults.map(result => ({
      samplerId: result.samplerId,
      script: `
        (function() {
          const result = ${JSON.stringify(result)};
          const samplerElement = document.querySelector('[data-sampler-id="${result.samplerId}"]');
          if (samplerElement) {
            const statusElement = samplerElement.querySelector('.sampler-status');
            const outputElement = samplerElement.querySelector('.sampler-output code');
            
            statusElement.className = 'sampler-status ' + result.status;
            statusElement.innerHTML = getStatusIcon(result.status);
            
            if (result.output || result.error) {
              outputElement.innerHTML = result.output || result.error;
            }
          }
        })();
      `
    }))
  }));

  return {
    flowId: flow.id,
    results,
    promise
  };
}
