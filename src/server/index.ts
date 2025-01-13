import express from 'express';
import path from 'path';
import webpack from 'webpack';
import webpackDevMiddleware from 'webpack-dev-middleware';
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

if (process.env.NODE_ENV !== 'production') {
  const webpackConfig = require('../../webpack.config.js');
  const compiler = webpack(webpackConfig);
  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath || '/',
    })
  );
} else {
  app.use(express.static(path.join(__dirname, '../../public')));
}

// Serve list of flows
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

app.post('/api/trace', async (req, res) => {
  try {
    const { flowId, variables } = req.body;
    
    if (!flowId || typeof flowId !== 'string') {
      return res.status(400).json({ error: 'Invalid flowId' });
    }
    
    if (!variables || typeof variables !== 'object') {
      return res.status(400).json({ error: 'Invalid variables' });
    }

    const result = await executeTrace({ flowId, variables });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`AnyTrace server running on port ${port}`);
});
