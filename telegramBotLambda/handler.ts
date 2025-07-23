'use strict';
import TelegramBot from 'node-telegram-bot-api';
import { APIGatewayProxyEventV2, APIGatewayProxyResult, Context } from 'aws-lambda';
import 'dotenv/config';
import QRCode from 'qrcode';
import crypto from 'crypto';

const BOT_TOKEN  = process.env.BOT_TOKEN!;
const WEBAPP_URL = process.env.WEBAPP_URL!;
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// Handler /start com log e await
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const welcomeMessage = `
🛒 **Bem-vindo ao TON E-Commerce!**

Escolha uma opção abaixo:

🏪 /lojas - Ver todas as lojas
📱 /app - Abrir Mini App
🛍️ /meus\\_pedidos - Ver meus pedidos
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🏪 Ver Lojas', callback_data: 'list_stores' },
        { text: '📱 Mini App', web_app: { url: WEBAPP_URL } }
      ],
      [
        { text: '🛍️ Meus Pedidos', callback_data: 'my_orders' }
      ]
    ]
  };

  console.log('🔔 [handler] /start chamado para chatId=', chatId);

  try {
    const sent = await bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
    console.log('📤 [handler] sendMessage OK, message_id=', sent.message_id);
  } catch (err) {
    console.error('❌ [handler] erro em sendMessage():', err);
  }
});

// Aqui você re-cole todos os outros bot.onText e bot.on('callback_query')...

export const webhook = async (
  event: APIGatewayProxyEventV2,
  context: Context
): Promise<APIGatewayProxyResult> => {
  context.callbackWaitsForEmptyEventLoop = true;

  if (!event.body) return { statusCode: 200, body: '' };
  const update = JSON.parse(event.body);

  console.log('🚀 [webhook] processando update…');
  await bot.processUpdate(update);
  console.log('✅ [webhook] processUpdate finalizado');

  return { statusCode: 200, body: '' };
};
