import express from 'express';
import TelegramBot from 'node-telegram-bot-api';
import QRCode from 'qrcode';
import crypto from 'crypto';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient

// Initialize Prisma Client
const prisma = new PrismaClient();

// Configurações principais
const BOT_TOKEN    = process.env.BOT_TOKEN!;
const WEBAPP_URL   = process.env.WEBAPP_URL!;
const APP_URL      = process.env.APP_URL!;           // ex: https://abc123.ngrok.io
const PORT         = parseInt(process.env.PORT  || '3000');
const WEBHOOK_PATH = `/bot${BOT_TOKEN}`;

// 1) Cria e configura o Express
const app = express();
app.use(express.json());

app.get('/', (_req, res) => res.send('🤖 Bot is running'));

// 2) Instancia o bot **sem** polling
const bot = new TelegramBot(BOT_TOKEN);

// 3) Define rota de webhook ANTES de iniciar o listener
app.post(WEBHOOK_PATH, (req, res) => {
  console.log('📬 Webhook recebido:', req.body);
  try {
    bot.processUpdate(req.body);
    res.sendStatus(200);
  } catch (err) {
    console.error('❌ Erro no processUpdate:', err);
    res.sendStatus(500);
  }
});

// 4) Sobe o servidor e, **depois**, registra o webhook
app.listen(PORT, async () => {
  const webhookUrl = `${APP_URL}${WEBHOOK_PATH}`;
  try {
    await bot.setWebHook(webhookUrl);
    console.log(`✅ Webhook registrado em ${webhookUrl}`);
  } catch (err) {
    console.error('🚨 Falha ao registrar webhook:', err);
  }

  // Aqui apenas log de servidor, sem menção a polling
  console.log(`🚀 Server rodando em http://localhost:${PORT}`);
});

// Type definitions for in-memory data (will be replaced by DB types)
interface Product {
  id: string;
  name: string;
  price: number;
  description: string; // Assuming you might add this later or derive from photo
  storeId: string;
  stock: number;
}

interface Store {
  id: string;
  name: string;
  description: string;
  ownerId: number; // This might become optional or derived if not in Lojas model
  products: Product[];
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface Order {
  id: string;
  userId: number;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentAddress?: string;
  transactionHash?: string;
  createdAt: Date;
}

// Dados em memória (em produção, usar banco de dados) - REMOVED, will fetch from DB
let orders: Order[] = [];

// Função para gerar endereço TON (mock)
function generateTonAddress(): string {
  return 'EQ' + crypto.randomBytes(32).toString('hex').substring(0, 44);
}

// Função para gerar QR Code de pagamento
async function generatePaymentQR(address: string, amount: number): Promise<Buffer> {
  const tonUrl = `ton://transfer/${address}?amount=${amount * 1000000000}`; // TON usa nano-tons
  return await QRCode.toBuffer(tonUrl);
}

// Comandos do bot
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const firstName = msg.from?.first_name;
  const lastName = msg.from?.last_name;

  // Criar URL com parâmetros do usuário
  const userParams = new URLSearchParams({
    user_id: userId?.toString() || '',
    first_name: firstName || '',
    last_name: lastName || '',
    chat_id: chatId.toString()
  });

  const miniAppUrl = `${WEBAPP_URL}?${userParams.toString()}`;

  const welcomeMessage = `
🛒 **Bem-vindo ao TON E-Commerce, ${firstName}!**

Escolha uma opção abaixo:

🏪 /lojas - Ver todas as lojas
📱 /app - Abrir Mini App
🛍️ /meus\\_pedidos - Ver meus pedidos
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🏪 Ver Lojas', callback_data: 'list_stores' },
        { text: '📱 Mini App', web_app: { url: miniAppUrl } }
      ],
      [
        { text: '🛍️ Meus Pedidos', callback_data: 'my_orders' }
      ]
    ]
  };

  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

// Listar lojas
bot.onText(/\/lojas/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const stores = await prisma.lojas.findMany(); // Fetch stores from the database

    if (stores.length === 0) {
      bot.sendMessage(chatId, 'Nenhuma loja cadastrada ainda.');
      return;
    }

    const keyboard = {
      inline_keyboard: stores.map(store => [
        { text: `🏪 ${store.nome_loja}`, callback_data: `store_${store.id}` }
      ])
    };

    bot.sendMessage(chatId, '🏪 **Lojas Disponíveis:**', {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    bot.sendMessage(chatId, 'Ocorreu um erro ao buscar as lojas. Tente novamente.');
  }
});

// Callback queries
bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id;
  const data = query.data;

  if (!chatId || !data) return;

  try {
    if (data === 'list_stores') {
      const stores = await prisma.lojas.findMany(); // Fetch stores from the database
      if (stores.length === 0) {
        bot.sendMessage(chatId, 'Nenhuma loja cadastrada ainda.');
        return;
      }

      const keyboard = {
        inline_keyboard: stores.map(store => [
          { text: `🏪 ${store.nome_loja}`, callback_data: `store_${store.id}` }
        ])
      };

      bot.sendMessage(chatId, '🏪 **Lojas Disponíveis:**', {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }

    else if (data.startsWith('store_')) {
      const storeId = data.replace('store_', '');

      // First, fetch the store details
      const store = await prisma.lojas.findUnique({
        where: { id: storeId },
      });

      if (!store) {
        bot.sendMessage(chatId, 'Loja não encontrada.');
        return;
      }

      // Second, fetch products associated with this storeId (id_vendor)
      const products = await prisma.product.findMany({
        where: { id_vendor: store.id }, // Linking by id_vendor from Product to Lojas.id
      });

      let message = `🏪 **${store.nome_loja}**\n\n`;

      if (products.length === 0) {
        message += '📦 Nenhum produto cadastrado para esta loja ainda.';
        const keyboard = {
          inline_keyboard: [
            [{ text: '🔙 Voltar às Lojas', callback_data: 'list_stores' }]
          ]
        };
        bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown',
          reply_markup: keyboard
        });
        return;
      }

      message += '📦 **Produtos:**\n\n';

      const keyboard = {
        inline_keyboard: products.map(product => [
          { text: `${product.name} - R$ ${product.price.toFixed(2)}`, callback_data: `product_${product.id}` }
        ])
      };

      keyboard.inline_keyboard.push([
        { text: '🔙 Voltar às Lojas', callback_data: 'list_stores' }
      ]);

      bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }

    else if (data.startsWith('product_')) {
      const productId = data.replace('product_', '');
      // Fetch product and its associated store from the database
      const product = await prisma.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        bot.sendMessage(chatId, 'Produto não encontrado.');
        return;
      }

      // Since we don't have a direct relation in schema, fetch the store separately
      const store = await prisma.lojas.findUnique({
          where: { id: product.id_vendor }
      });

      const message = `
📦 **${product.name}**
💰 Preço: R$ ${product.price.toFixed(2)}
📋 Descrição: ${product.photo} 🏪 Loja: ${store?.nome_loja || 'N/A'}
📊 Estoque: ${product.quant} unidades
      `;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🛒 Comprar Agora', callback_data: `buy_${product.id}` }
          ],
          [
            { text: '🔙 Voltar à Loja', callback_data: `store_${product.id_vendor}` }
          ]
        ]
      };

      bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }

    else if (data.startsWith('buy_')) {
      const productId = data.replace('buy_', '');
      const product = await prisma.product.findUnique({ // Fetch product from DB
        where: { id: productId }
      });

      if (!product) {
        bot.sendMessage(chatId, 'Produto não encontrado.');
        return;
      }

      // Create order
      const order: Order = {
        id: crypto.randomUUID(),
        userId: query.from.id,
        items: [{
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price.toNumber() // Convert Decimal to number
        }],
        total: product.price.toNumber(), // Convert Decimal to number
        status: 'pending',
        paymentAddress: generateTonAddress(),
        createdAt: new Date()
      };

      orders.push(order);

      // Gerar QR Code
      const qrBuffer = await generatePaymentQR(order.paymentAddress!, order.total);

      const message = `
🛒 **Pedido Criado!**
📋 ID: ${order.id}
💰 Total: R$ ${order.total.toFixed(2)}

📱 **Pagamento via TON:**
Endereço: \`${order.paymentAddress}\`
Valor: ${order.total} TON

Escaneie o QR Code abaixo para pagar:
      `;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '✅ Confirmar Pagamento', callback_data: `confirm_payment_${order.id}` }
          ],
          [
            { text: '❌ Cancelar Pedido', callback_data: `cancel_order_${order.id}` }
          ]
        ]
      };

      bot.sendPhoto(chatId, qrBuffer, {
        caption: message,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }

    else if (data.startsWith('confirm_payment_')) {
      const orderId = data.replace('confirm_payment_', '');
      const order = orders.find(o => o.id === orderId);

      if (!order) {
        bot.sendMessage(chatId, 'Pedido não encontrado.');
        return;
      }

      if (order.status !== 'pending') {
        bot.sendMessage(chatId, 'Este pedido já foi processado.');
        return;
      }

      // Simular confirmação de pagamento (em produção, verificar blockchain)
      order.status = 'paid';
      order.transactionHash = crypto.randomBytes(32).toString('hex');

      const confirmMessage = `
✅ **Pagamento Confirmado!**

📋 Pedido: ${order.id}
💰 Valor: R$ ${order.total.toFixed(2)}
🔗 Hash da Transação: \`${order.transactionHash}\`

🎉 Obrigado pela compra!
      `;

      bot.sendMessage(chatId, confirmMessage, {
        parse_mode: 'Markdown'
      });

      // Notificar vendedor (se implementado)
      // notifyVendor(order);
    }

    else if (data.startsWith('cancel_order_')) {
      const orderId = data.replace('cancel_order_', '');
      const order = orders.find(o => o.id === orderId);

      if (!order) {
        bot.sendMessage(chatId, 'Pedido não encontrado.');
        return;
      }

      order.status = 'cancelled';
      bot.sendMessage(chatId, '❌ Pedido cancelado com sucesso.');
    }

    else if (data === 'my_orders') {
      const userOrders = orders.filter(o => o.userId === query.from.id);

      if (userOrders.length === 0) {
        bot.sendMessage(chatId, 'Você ainda não fez nenhum pedido.');
        return;
      }

      let message = '🛍️ **Meus Pedidos:**\n\n';

      userOrders.forEach(order => {
        const statusEmoji = order.status === 'paid' ? '✅' : order.status === 'pending' ? '⏳' : '❌';
        message += `${statusEmoji} **${order.id}**\n`;
        message += `💰 Total: R$ ${order.total.toFixed(2)}\n`;
        message += `📅 Data: ${order.createdAt.toLocaleDateString('pt-BR')}\n\n`;
      });

      bot.sendMessage(chatId, message, {
        parse_mode: 'Markdown'
      });
    }

    // Responder ao callback query
    bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Erro no callback query:', error);
    bot.sendMessage(chatId, 'Ocorreu um erro. Tente novamente.');
    bot.answerCallbackQuery(query.id);
  }
});

// Comando para meus pedidos
bot.onText(/\/meus_pedidos/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  if (!userId) return;

  const userOrders = orders.filter(o => o.userId === userId);

  if (userOrders.length === 0) {
    bot.sendMessage(chatId, 'Você ainda não fez nenhum pedido.');
    return;
  }

  let message = '🛍️ **Meus Pedidos:**\n\n';

  userOrders.forEach(order => {
    const statusEmoji = order.status === 'paid' ? '✅' : order.status === 'pending' ? '⏳' : '❌';
    message += `${statusEmoji} **${order.id}**\n`;
    message += `💰 Total: R$ ${order.total.toFixed(2)}\n`;
    message += `📅 Data: ${order.createdAt.toLocaleDateString('pt-BR')}\n`;

    order.items.forEach(item => {
      message += `  • ${item.productName} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}\n`;
    });

    message += '\n';
  });

  bot.sendMessage(chatId, message, {
    parse_mode: 'Markdown'
  });
});

// Comando para abrir Mini App MODIFIQUEI
bot.onText(/\/app/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const firstName = msg.from?.first_name;
  const lastName = msg.from?.last_name;

  // Criar URL com parâmetros do usuário
  const userParams = new URLSearchParams({
    user_id: userId?.toString() || '',
    first_name: firstName || '',
    last_name: lastName || '',
    chat_id: chatId.toString()
  });

  const miniAppUrl = `${WEBAPP_URL}?${userParams.toString()}`;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '📱 Abrir Mini App', web_app: { url: miniAppUrl } }
      ]
    ]
  };

  bot.sendMessage(chatId, '📱 Clique no botão abaixo para abrir o Mini App:', {
    reply_markup: keyboard
  });
});

// Manipular dados do WebApp
bot.on('web_app_data', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  const webApp = msg.web_app_data;
  if (!webApp || !webApp.data) {
    // nada a fazer se não veio payload
    return;
  }

  if (!userId) return;

  try {

    const orderData = JSON.parse(webApp.data);

    // Create order from WebApp data
    const order: Order = {
      id: crypto.randomUUID(),
      userId: userId,
      items: orderData.items.map((item: any) => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price
      })),
      total: orderData.total,
      status: 'pending',
      paymentAddress: generateTonAddress(),
      createdAt: new Date()
    };

    orders.push(order);

    // Gerar QR Code
    const qrBuffer = await generatePaymentQR(order.paymentAddress!, order.total);

    const message = `
🛒 **Pedido Criado via Mini App!**
📋 ID: ${order.id}
💰 Total: R$ ${order.total.toFixed(2)}

📦 **Itens:**
${order.items.map(item => `• ${item.productName} (${item.quantity}x) - R$ ${(item.price * item.quantity).toFixed(2)}`).join('\n')}

📱 **Pagamento via TON:**
Endereço: \`${order.paymentAddress}\`
Valor: ${order.total} TON

Escaneie o QR Code abaixo para pagar:
    `;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '✅ Confirmar Pagamento', callback_data: `confirm_payment_${order.id}` }
        ],
        [
          { text: '❌ Cancelar Pedido', callback_data: `cancel_order_${order.id}` }
        ]
      ]
    };

    bot.sendPhoto(chatId, qrBuffer, {
      caption: message,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Erro ao processar dados do WebApp:', error);
    bot.sendMessage(chatId, 'Erro ao processar pedido. Tente novamente.');
  }
});

// Manipulador de erros
bot.on('error', (error) => {
  console.error('Erro do bot:', error);
});

bot.on('polling_error', (error) => {
  console.error('Erro de polling:', error);
});

console.log('🤖 Bot iniciado com sucesso!');
console.log('📱 WebApp URL:', WEBAPP_URL);


export default bot;