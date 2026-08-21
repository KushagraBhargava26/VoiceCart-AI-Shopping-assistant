import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import shoppingRoutes from './routes/shopping.routes.js';
import commandRoutes from './routes/command.routes.js';
import suggestionRoutes from './routes/suggestion.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'ok',
    },
  });
});

app.use('/api/v1/shopping-list', shoppingRoutes);
app.use('/api/v1/commands', commandRoutes);
app.use('/api/v1/suggestions', suggestionRoutes);

app.listen(PORT, () => {
  console.log(`VoiceCart server running on port ${PORT}`);
});