'use strict';
import TelegramBot from 'node-telegram-bot-api';
import { APIGatewayProxyEventV2, APIGatewayProxyResult, Context } from 'aws-lambda';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client'; // Import PrismaClient
import QRCode from 'qrcode';
import crypto from 'crypto';

const BOT_TOKEN  = process.env.BOT_TOKEN!;
const WEBAPP_URL = process.env.WEBAPP_URL!;
const bot = new TelegramBot(BOT_TOKEN, { polling: false });
const prisma = new PrismaClient();


interface TempOrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

interface TempOrder {
  id: string;
  userId: number;
  items: TempOrderItem[];
  total: number;
  status: 'pending' | 'paid' | 'cancelled';
  paymentAddress?: string;
  transactionHash?: string;
  createdAt: Date;
}

// Dados temporários em memória para pedidos pendentes (antes do pagamento)
let tempOrders: TempOrder[] = [];

// Função para gerar endereço TON (mock)
function generateTonAddress(): string {
  return 'EQ' + crypto.randomBytes(32).toString('hex').substring(0, 44);
}

// Função para gerar QR Code de pagamento
async function generatePaymentQR(address: string, amount: number): Promise<Buffer> {
  const tonUrl = `ton://transfer/${address}?amount=${amount * 1000000000}`; // TON usa nano-tons
  return await QRCode.toBuffer(tonUrl);
}

// Função para salvar pedido no banco de dados
async function saveOrderToDatabase(tempOrder: TempOrder): Promise<void> {
  try {
    await prisma.order.create({
      data: {
        id: tempOrder.id,
        userId: BigInt(tempOrder.userId),
        total: tempOrder.total,
        status: tempOrder.status,
        paymentAddress: tempOrder.paymentAddress,
        transactionHash: tempOrder.transactionHash,
        createdAt: tempOrder.createdAt,
        items: {
          create: tempOrder.items.map(item => ({
            productId: item.productId,
            productName: item.productName,
            quantity: item.quantity,
            price: item.price
          }))
        }
      },
      include: {
        items: true
      }
    });
    console.log(`✅ Pedido ${tempOrder.id} salvo no banco de dados`);
  } catch (error) {
    console.error('❌ Erro ao salvar pedido no banco:', error);
    throw error;
  }
}

// Função para atualizar estoque do produto
async function updateProductStock(productId: string, quantity: number): Promise<boolean> {
  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        quant: {
          decrement: quantity
        }
      }
    });

    console.log(`✅ Estoque do produto ${productId} atualizado. Quantidade reduzida em ${quantity}`);
    return true;
  } catch (error) {
    console.error('❌ Erro ao atualizar estoque:', error);
    return false;
  }
}

// Handler /start com log e await
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  const firstName = msg.from?.first_name;
  const lastName = msg.from?.last_name;

  const userParams = new URLSearchParams({
    user_id: userId?.toString() || '',
    first_name: firstName || '',
    last_name: lastName || '',
    chat_id: chatId.toString()
  });

  const miniAppUrl = `${WEBAPP_URL}?${userParams.toString()}`;
  
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
        { text: '📱 Mini App', web_app: { url: miniAppUrl } }
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

bot.onText(/\/lojas/, async (msg) => {
  const chatId = msg.chat.id;

  try {
    const stores = await prisma.lojas.findMany(); // Fetch stores from the database

    if (stores.length === 0) {
      await bot.sendMessage(chatId, 'Nenhuma loja cadastrada ainda.');
      return;
    }

    const keyboard = {
      inline_keyboard: stores.map(store => [
        { text: `🏪 ${store.nome_loja}`, callback_data: `store_${store.id}` }
      ])
    };

    await bot.sendMessage(chatId, '🏪 **Lojas Disponíveis:**', {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Error fetching stores:', error);
    await bot.sendMessage(chatId, 'Ocorreu um erro ao buscar as lojas. Tente novamente.');
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
        await bot.sendMessage(chatId, 'Nenhuma loja cadastrada ainda.');
        return;
      }

      const keyboard = {
        inline_keyboard: stores.map(store => [
          { text: `🏪 ${store.nome_loja}`, callback_data: `store_${store.id}` }
        ])
      };

      await bot.sendMessage(chatId, '🏪 **Lojas Disponíveis:**', {
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
        await bot.sendMessage(chatId, 'Loja não encontrada.');
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
          { text: `${product.name} por ${product.price.toFixed(2)} TONS`, callback_data: `product_${product.id}` }
        ])
      };

      keyboard.inline_keyboard.push([
        { text: '🔙 Voltar às Lojas', callback_data: 'list_stores' }
      ]);

      await bot.sendMessage(chatId, message, {
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

      const caption = `
📦 *${product.name}*
💰 Preço: ${product.price.toFixed(2)} tons
🏪 Loja: ${store?.nome_loja || 'N/A'}
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
      
      await bot.sendPhoto(chatId, product.photo, {
        caption,
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

      // Create temporary order
      const order: TempOrder = {
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

      tempOrders.push(order);

      // Gerar QR Code
      const qrBuffer = await generatePaymentQR(order.paymentAddress!, order.total);

      const message = `
🛒 **Pedido Criado!**
📋 ID: ${order.id}
💰 Total: ${order.total.toFixed(2)} tons

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

      await bot.sendPhoto(chatId, qrBuffer, {
        caption: message,
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }

    else if (data.startsWith('confirm_payment_')) {
      const orderId = data.replace('confirm_payment_', '');
      const order = tempOrders.find(o => o.id === orderId);

      if (!order) {
        await bot.sendMessage(chatId, 'Pedido não encontrado.');
        return;
      }

      if (order.status !== 'pending') {
        await bot.sendMessage(chatId, 'Este pedido já foi processado.');
        return;
      }

      try {
        // Simular confirmação de pagamento (em produção, verificar blockchain)
        order.status = 'paid';
        order.transactionHash = crypto.randomBytes(32).toString('hex');

        // Atualizar estoque de todos os produtos do pedido
        for (const item of order.items) {
          const stockUpdated = await updateProductStock(item.productId, item.quantity);
          if (!stockUpdated) {
            console.log(`⚠️ Aviso: Erro ao atualizar estoque do produto ${item.productName}`);
          }
        }

        // Salvar pedido no banco de dados
        await saveOrderToDatabase(order);

        // Remover da lista temporária
        const index = tempOrders.findIndex(o => o.id === orderId);
        if (index !== -1) {
          tempOrders.splice(index, 1);
        }

        const confirmMessage = `
✅ **Pagamento Confirmado!**

📋 Pedido: ${order.id}
💰 Valor: ${order.total.toFixed(2)} tons
🔗 Hash da Transação: \`${order.transactionHash}\`

🎉 Obrigado pela compra!
        `;

        await bot.sendMessage(chatId, confirmMessage, {
          parse_mode: 'Markdown'
        });

        // Notificar vendedor (se implementado)
        // notifyVendor(order);
      } catch (error) {
        console.error('Erro ao confirmar pagamento:', error);
       await bot.sendMessage(chatId, '❌ Erro ao processar pagamento. Tente novamente.');
      }
    }

    else if (data.startsWith('cancel_order_')) {
      const orderId = data.replace('cancel_order_', '');
      const order = tempOrders.find(o => o.id === orderId);

      if (!order) {
       await bot.sendMessage(chatId, 'Pedido não encontrado.');
        return;
      }

      order.status = 'cancelled';
     await bot.sendMessage(chatId, '❌ Pedido cancelado com sucesso.');
    }

    else if (data === 'my_orders') {
      const userId = query.from.id;
      
      try {
        // Buscar pedidos do usuário no banco de dados
        const userOrders = await prisma.order.findMany({
          where: { userId: BigInt(userId) },
          include: {
            items: true
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        if (userOrders.length === 0) {
         await bot.sendMessage(chatId, 'Você ainda não fez nenhum pedido.');
          return;
        }

        let message = '🛍️ **Meus Pedidos:**\n\n';

        userOrders.forEach((order: any) => {
          const statusEmoji = order.status === 'paid' ? '✅' : order.status === 'pending' ? '⏳' : '❌';
          message += `${statusEmoji} **${order.id.substring(0, 8)}...**\n`;
          message += `💰 Total: ${order.total.toFixed(2)} tons\n`;
          message += `📅 Data: ${order.createdAt.toLocaleDateString('pt-BR')}\n`;
          
          if (order.items.length > 0) {
            message += '📦 Itens:\n';
            order.items.forEach((item: any) => {
              message += `  • ${item.productName} (${item.quantity}x) - ${(Number(item.price) * item.quantity).toFixed(2)} tons\n`;
            });
          }
          
          message += '\n';
        });

       await bot.sendMessage(chatId, message, {
          parse_mode: 'Markdown'
        });
      } catch (error) {
        console.error('Erro ao buscar pedidos:', error);
       await bot.sendMessage(chatId, '❌ Erro ao buscar seus pedidos. Tente novamente.');
      }
    }

    // Responder ao callback query
   await bot.answerCallbackQuery(query.id);
  } catch (error) {
    console.error('Erro no callback query:', error);
   await bot.sendMessage(chatId, 'Ocorreu um erro. Tente novamente.');
   await bot.answerCallbackQuery(query.id);
  }
});

// Comando para meus pedidos
bot.onText(/\/meus_pedidos/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;

  if (!userId) return;

  try {
    // Buscar pedidos do usuário no banco de dados
    const userOrders = await prisma.order.findMany({
      where: { userId: BigInt(userId) },
      include: {
        items: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (userOrders.length === 0) {
    await bot.sendMessage(chatId, 'Você ainda não fez nenhum pedido.');
      return;
    }

    let message = '🛍️ **Meus Pedidos:**\n\n';

    userOrders.forEach(order => {
      const statusEmoji = order.status === 'paid' ? '✅' : order.status === 'pending' ? '⏳' : '❌';
      message += `${statusEmoji} **${order.id.substring(0, 8)}...**\n`;
      message += `💰 Total: ${order.total.toFixed(2)} tons\n`;
      message += `📅 Data: ${order.createdAt.toLocaleDateString('pt-BR')}\n`;

      if (order.items.length > 0) {
        message += '📦 Itens:\n';
        order.items.forEach(item => {
          message += `  • ${item.productName} (${item.quantity}x) - ${(Number(item.price) * item.quantity).toFixed(2)} tons\n`;
        });
      }

      message += '\n';
    });

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown'
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
   await bot.sendMessage(chatId, '❌ Erro ao buscar seus pedidos. Tente novamente.');
  }
});

// Comando para abrir Mini App MODIFIQUEI
bot.onText(/\/app/, async(msg) => {
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

 await bot.sendMessage(chatId, '📱 Clique no botão abaixo para abrir o Mini App:', {
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

    // Create temporary order from WebApp data
    const order: TempOrder = {
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

    tempOrders.push(order);

    // Gerar QR Code
    const qrBuffer = await generatePaymentQR(order.paymentAddress!, order.total);

    const message = `
🛒 **Pedido Criado via Mini App!**
📋 ID: ${order.id}
💰 Total: ${order.total.toFixed(2)} tons

📦 **Itens:**
${order.items.map(item => `• ${item.productName} (${item.quantity}x) - ${(item.price * item.quantity).toFixed(2)} tons`).join('\n')}

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

   await bot.sendPhoto(chatId, qrBuffer, {
      caption: message,
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    console.error('Erro ao processar dados do WebApp:', error);
   await bot.sendMessage(chatId, 'Erro ao processar pedido. Tente novamente.');
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
  await new Promise((resolve) => setTimeout(resolve, 200));

  return { statusCode: 200, body: '' };
};
