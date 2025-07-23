'use strict';
import TelegramBot from 'node-telegram-bot-api';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import 'dotenv/config';
import QRCode      from 'qrcode';
import crypto      from 'crypto';

const BOT_TOKEN = process.env.BOT_TOKEN;
if (!BOT_TOKEN) {
  throw new Error('🚨 BOT_TOKEN não está definido em process.env');
}
const bot = new TelegramBot(BOT_TOKEN, { polling: false });

// Aqui você cola todos os seus bot.onText, bot.on('callback_query'), etc.
// Por exemplo:
bot.onText(/\/start/, msg => {
  bot.sendMessage(msg.chat.id, 'Olá do Lambda!');
});

export const webhook = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    // event.body pode ser string ou null, garanta que não é null
    const body = event.body || '{}';
    const update = JSON.parse(body);
    await bot.processUpdate(update);
    return {
      statusCode: 200,
      body: ''
    };
  } catch (err) {
    console.error('Erro processando update:', err);
    return {
      statusCode: 500,
      body: 'Internal Server Error'
    };
  }
};

