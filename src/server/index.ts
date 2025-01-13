import express from 'express';
import path from 'path';
import { executeTrace } from './trace';

const app = express();
const port = process.env.PORT || 3000;

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
