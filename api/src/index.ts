import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'OK', service: 'api' });
});

app.get('/api/data', (req, res) => {
  res.json({ message: 'Hello from API!', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});