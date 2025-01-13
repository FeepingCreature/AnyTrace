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

app.post('/api/trace', async (req, res) => {
  try {
    const result = await executeTrace(req.body);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

app.listen(port, () => {
  console.log(`AnyTrace server running on port ${port}`);
});
