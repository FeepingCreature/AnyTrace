import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

interface TraceConfig {
  command: string;
  args?: string[];
}

interface TraceResult {
  output: string;
  error?: string;
}

export async function executeTrace(config: TraceConfig): Promise<TraceResult> {
  try {
    const command = `${config.command} ${(config.args || []).join(' ')}`;
    const { stdout, stderr } = await execAsync(command);
    
    return {
      output: stdout,
      error: stderr || undefined
    };
  } catch (error) {
    throw new Error(`Failed to execute trace: ${(error as Error).message}`);
  }
}
