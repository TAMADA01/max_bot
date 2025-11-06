import express from 'express';
import bodyParser from 'body-parser';
import { MaxApiService } from './services/maxApi';
import { MessageHandler } from './handlers/messageHandler';
import { MaxWebhookPayload } from './types/max';

const app = express();
const PORT = process.env.PORT || 3002;

// Middleware
app.use(bodyParser.json());

// Инициализация сервисов
const maxToken = process.env.MAX_BOT_TOKEN;
if (!maxToken) {
  console.error('MAX_BOT_TOKEN is required');
  process.exit(1);
}

const maxApi = new MaxApiService(maxToken);
const messageHandler = new MessageHandler(maxApi);

// Webhook endpoint для MAX
app.post('/webhook/max', async (req, res) => {
  try {
    const payload: MaxWebhookPayload = req.body;
    
    console.log('Received webhook:', payload);

    if (payload.event === 'message') {
      await messageHandler.handleMessage(payload.data as any);
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    service: 'max-bot',
    timestamp: new Date().toISOString()
  });
});

// Установка webhook при запуске
async function setupWebhook() {
  try {
    const webhookUrl = `${process.env.WEBHOOK_URL}/webhook/max`;
    await maxApi.setWebhook(webhookUrl);
    console.log(`Webhook set to: ${webhookUrl}`);
  } catch (error) {
    console.error('Failed to set webhook:', error);
  }
}

app.listen(PORT, async () => {
  console.log(`MAX Bot server running on port ${PORT}`);
  
  // Устанавливаем webhook
  await setupWebhook();
});