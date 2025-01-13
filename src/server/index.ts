import express from 'express';
import path from 'path';
import { executeTrace } from './trace';
import { ConfigLoader } from '../config/loader';

const app = express();
const port = process.env.PORT || 3000;

// Initialize configuration
const configLoader = ConfigLoader.getInstance();
try {
    const config = configLoader.loadConfig(process.env.CONFIG_PATH);
    console.log('Configuration loaded successfully');
} catch (error) {
    console.error('Failed to load configuration:', error);
    process.exit(1);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, '../../public')));

// API endpoints
app.get('/api/flows', (req, res) => {
  try {
    const config = configLoader.getConfig();
    res.json(config.flows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/samplers', (req, res) => {
  try {
    const config = configLoader.getConfig();
    res.json(config.samplers);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/api/flows', (req, res) => {
  try {
    const config = configLoader.getConfig();
    res.json(config.flows);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.get('/trace', (req, res) => {
  res.sendFile(path.join(__dirname, '../../public/trace.html'));
});

app.get('/api/trace/events', (req, res) => {
  const { flowId, ...variables } = req.query;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  // Send initial trace data
  const config = configLoader.getConfig();
  const flow = config.flows.find(f => f.id === flowId);
  
  if (!flow) {
    res.write(`data: ${JSON.stringify({ error: 'Flow not found' })}\n\n`);
    res.end();
    return;
  }

  // Execute trace and send updates
  executeTrace({ flowId, variables: variables as Record<string, string> })
    .then(result => {
      result.results.forEach((samplerResult, index) => {
        setTimeout(() => {
          res.write(`data: ${JSON.stringify(samplerResult)}\n\n`);
        }, index * 100); // Stagger updates for visual effect
      });
      
      // End stream after all results
      setTimeout(() => {
        res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
        res.end();
      }, result.results.length * 100);
    })
    .catch(error => {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    });
});

app.listen(port, () => {
  console.log(`AnyTrace server running on port ${port}`);
});
