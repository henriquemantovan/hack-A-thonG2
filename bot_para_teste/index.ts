import TelegramBot from 'node-telegram-bot-api';
import QRCode from 'qrcode';
import crypto from 'crypto';
import 'dotenv/config'; 


// Configuração do bot
const BOT_TOKEN = process.env.BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
const WEBAPP_URL = process.env.WEBAPP_URL || 'https://your-webapp-url.com';

// Inicializar o bot
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// Interfaces
interface Store {
  id: string;
  name: string;
  description: string;
  ownerId: number;
  products: Product[];
}

interface Product {
  id: string;
  name: string;
  price: number;
  description: string;
  storeId: string;
  stock: number;
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

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// Dados em memória (em produção, usar banco de dados)
let stores: Store[] = [
  {
    id: '1',
    name: 'Loja da Maria',
    description: 'Produtos artesanais e naturais',
    ownerId: 123456789, // ID do usuário vendedor
    products: [
      { id: '1', name: 'Sabonete Artesanal', price: 15.99, description: 'Sabonete natural de lavanda', storeId: '1', stock: 10 },
      { id: '2', name: 'Mel Orgânico', price: 25.50, description: 'Mel puro de abelhas', storeId: '1', stock: 5 },
      { id: '3', name: 'Vela Aromática', price: 18.00, description: 'Vela de soja com óleo essencial', storeId: '1', stock: 8 }
    ]
  },
  {
    id: '2',
    name: 'Tech Store',
    description: 'Acessórios tecnológicos',
    ownerId: 987654321, // ID do usuário vendedor
    products: [
      { id: '4', name: 'Cabo USB-C', price: 29.99, description: 'Cabo USB-C 2 metros', storeId: '2', stock: 20 },
      { id: '5', name: 'Carregador Wireless', price: 45.00, description: 'Carregador sem fio 15W', storeId: '2', stock: 15 },
      { id: '6', name: 'Fone Bluetooth', price: 89.99, description: 'Fone de ouvido sem fio', storeId: '2', stock: 12 }
    ]
  }
];

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
  const welcomeMessage = `
🛒 **Bem-vindo ao TON E-Commerce!**

Escolha uma opção abaixo:

🏪 /lojas - Ver todas as lojas
📱 /app - Abrir Mini App
🛍️ /meus_pedidos - Ver meus pedidos
💰 /cadastrar_loja - Cadastrar nova loja (vendedores)
  `;

  const keyboard = {
    inline_keyboard: [
      [
        { text: '🏪 Ver Lojas', callback_data: 'list_stores' },
        { text: '📱 Mini App', web_app: { url: WEBAPP_URL } }
      ],
      [
        { text: '🛍️ Meus Pedidos', callback_data: 'my_orders' },
        { text: '💰 Cadastrar Loja', callback_data: 'register_store' }
      ]
    ]
  };

  bot.sendMessage(chatId, welcomeMessage, {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

// Listar lojas
bot.onText(/\/lojas/, (msg) => {
  const chatId = msg.chat.id;
  
  if (stores.length === 0) {
    bot.sendMessage(chatId, 'Nenhuma loja cadastrada ainda.');
    return;
  }

  const keyboard = {
    inline_keyboard: stores.map(store => [
      { text: `🏪 ${store.name}`, callback_data: `store_${store.id}` }
    ])
  };

  bot.sendMessage(chatId, '🏪 **Lojas Disponíveis:**', {
    parse_mode: 'Markdown',
    reply_markup: keyboard
  });
});

// Callback queries
bot.on('callback_query', async (query) => {
  const chatId = query.message?.chat.id;
  const data = query.data;
  
  if (!chatId || !data) return;

  try {
    if (data === 'list_stores') {
      // Listar lojas
      if (stores.length === 0) {
        bot.sendMessage(chatId, 'Nenhuma loja cadastrada ainda.');
        return;
      }

      const keyboard = {
        inline_keyboard: stores.map(store => [
          { text: `🏪 ${store.name}`, callback_data: `store_${store.id}` }
        ])
      };

      bot.sendMessage(chatId, '🏪 **Lojas Disponíveis:**', {
        parse_mode: 'Markdown',
        reply_markup: keyboard
      });
    }
    
    else if (data.startsWith('store_')) {
      const storeId = data.replace('store_', '');
      const store = stores.find(s => s.id === storeId);
      
      if (!store) {
        bot.sendMessage(chatId, 'Loja não encontrada.');
        return;
      }

      let message = `🏪 **${store.name}**\n${store.description}\n\n📦 **Produtos:**\n\n`;
      
      const keyboard = {
        inline_keyboard: store.products.map(product => [
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
      const product = stores.flatMap(s => s.products).find(p => p.id === productId);
      
      if (!product) {
        bot.sendMessage(chatId, 'Produto não encontrado.');
        return;
      }

      const store = stores.find(s => s.id === product.storeId);
      
      const message = `
📦 **${product.name}**
💰 Preço: R$ ${product.price.toFixed(2)}
📋 Descrição: ${product.description}
🏪 Loja: ${store?.name}
📊 Estoque: ${product.stock} unidades
      `;

      const keyboard = {
        inline_keyboard: [
          [
            { text: '🛒 Comprar Agora', callback_data: `buy_${product.id}` }
          ],
          [
            { text: '🔙 Voltar à Loja', callback_data: `store_${product.storeId}` }
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
      const product = stores.flatMap(s => s.products).find(p => p.id === productId);
      
      if (!product) {
        bot.sendMessage(chatId, 'Produto não encontrado.');
        return;
      }

      // Criar pedido
      const order: Order = {
        id: crypto.randomUUID(),
        userId: query.from.id,
        items: [{
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price
        }],
        total: product.price,
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
    
    else if (data === 'register_store') {
      bot.sendMessage(chatId, `
💰 **Cadastro de Loja**

Para cadastrar uma nova loja, envie as informações no formato:

\`/nova_loja Nome da Loja | Descrição da loja\`

Exemplo:
\`/nova_loja Minha Loja | Vendemos produtos incríveis\`
      `, {
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

// Cadastrar nova loja
bot.onText(/\/nova_loja (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  
  if (!match || !userId) {
    bot.sendMessage(chatId, 'Formato inválido. Use: /nova_loja Nome da Loja | Descrição');
    return;
  }

  const [storeName, storeDescription] = match[1].split('|').map(s => s.trim());
  
  if (!storeName || !storeDescription) {
    bot.sendMessage(chatId, 'Formato inválido. Use: /nova_loja Nome da Loja | Descrição');
    return;
  }

  const newStore: Store = {
    id: crypto.randomUUID(),
    name: storeName,
    description: storeDescription,
    ownerId: userId,
    products: []
  };

  stores.push(newStore);

  bot.sendMessage(chatId, `
✅ **Loja cadastrada com sucesso!**

🏪 Nome: ${storeName}
📋 Descrição: ${storeDescription}
🆔 ID: ${newStore.id}

Para adicionar produtos, use:
\`/produto ${newStore.id} | Nome do Produto | Preço | Descrição | Estoque\`
  `, {
    parse_mode: 'Markdown'
  });
});

// Adicionar produto
bot.onText(/\/produto (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const userId = msg.from?.id;
  
  if (!match || !userId) {
    bot.sendMessage(chatId, 'Formato inválido.');
    return;
  }

  const parts = match[1].split('|').map(s => s.trim());
  
  if (parts.length !== 5) {
    bot.sendMessage(chatId, 'Formato inválido. Use: /produto ID_LOJA | Nome | Preço | Descrição | Estoque');
    return;
  }

  const [storeId, productName, priceStr, productDescription, stockStr] = parts;
  const price = parseFloat(priceStr);
  const stock = parseInt(stockStr);

  if (isNaN(price) || isNaN(stock)) {
    bot.sendMessage(chatId, 'Preço e estoque devem ser números válidos.');
    return;
  }

  const store = stores.find(s => s.id === storeId);
  
  if (!store) {
    bot.sendMessage(chatId, 'Loja não encontrada.');
    return;
  }

  if (store.ownerId !== userId) {
    bot.sendMessage(chatId, 'Você não tem permissão para adicionar produtos nesta loja.');
    return;
  }

  const newProduct: Product = {
    id: crypto.randomUUID(),
    name: productName,
    price: price,
    description: productDescription,
    storeId: storeId,
    stock: stock
  };

  store.products.push(newProduct);

  bot.sendMessage(chatId, `
✅ **Produto adicionado com sucesso!**

📦 Nome: ${productName}
💰 Preço: R$ ${price.toFixed(2)}
📋 Descrição: ${productDescription}
📊 Estoque: ${stock} unidades
🏪 Loja: ${store.name}
  `, {
    parse_mode: 'Markdown'
  });
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

// Comando para abrir Mini App
bot.onText(/\/app/, (msg) => {
  const chatId = msg.chat.id;
  
  const keyboard = {
    inline_keyboard: [
      [
        { text: '📱 Abrir Mini App', web_app: { url: WEBAPP_URL } }
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
  
  if (!userId) return;

  try {
    const orderData = JSON.parse(msg.web_app_data.data);
    
    // Criar pedido a partir dos dados do WebApp
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