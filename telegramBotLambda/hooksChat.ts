// ///import { TelegramBot } from 'node-telegram-bot-api';
// import QRCode from 'qrcode';
// import crypto from 'crypto';

// interface Store {
//   id: string;
//   name: string;
//   description: string;
//   ownerId: number;
//   products: Product[];
// }

// interface Product {
//   id: string;
//   name: string;
//   price: number;
//   description: string;
//   storeId: string;
//   stock: number;
// }

// interface Order {
//   id: string;
//   userId: number;
//   items: OrderItem[];
//   total: number;
//   status: 'pending' | 'paid' | 'cancelled';
//   paymentAddress?: string;
//   transactionHash?: string;
//   createdAt: Date;
// }

// interface OrderItem {
//   productId: string;
//   productName: string;
//   quantity: number;
//   price: number;
// }


// let stores: Store[] = [
//   {
//     id: '1',
//     name: 'Loja da Maria',
//     description: 'Produtos artesanais e naturais',
//     ownerId: 123456789, // ID do usuário vendedor
//     products: [
//       { id: '1', name: 'Sabonete Artesanal', price: 15.99, description: 'Sabonete natural de lavanda', storeId: '1', stock: 10 },
//       { id: '2', name: 'Mel Orgânico', price: 25.50, description: 'Mel puro de abelhas', storeId: '1', stock: 5 },
//       { id: '3', name: 'Vela Aromática', price: 18.00, description: 'Vela de soja com óleo essencial', storeId: '1', stock: 8 }
//     ]
//   },
//   {
//     id: '2',
//     name: 'Tech Store',
//     description: 'Acessórios tecnológicos',
//     ownerId: 987654321, // ID do usuário vendedor
//     products: [
//       { id: '4', name: 'Cabo USB-C', price: 29.99, description: 'Cabo USB-C 2 metros', storeId: '2', stock: 20 },
//       { id: '5', name: 'Carregador Wireless', price: 45.00, description: 'Carregador sem fio 15W', storeId: '2', stock: 15 },
//       { id: '6', name: 'Fone Bluetooth', price: 89.99, description: 'Fone de ouvido sem fio', storeId: '2', stock: 12 }
//     ]
//   }
// ];

// let orders: Order[] = [];

// // Função para gerar endereço TON (mock)
// function generateTonAddress(): string {
//   return 'EQ' + crypto.randomBytes(32).toString('hex').substring(0, 44);
// }

// // Função para gerar QR Code de pagamento
// async function generatePaymentQR(address: string, amount: number): Promise<Buffer> {
//   const tonUrl = `ton://transfer/${address}?amount=${amount * 1000000000}`; // TON usa nano-tons
//   return await QRCode.toBuffer(tonUrl);
// }


// // Exporte uma função que recebe a instância do bot
// export function registerHandlers(bot: TelegramBot, WEBAPP_URL: string) {
//   // /start
//   bot.onText(/\/start/, async (msg) => {
//     const chatId = msg.chat.id;
//     await bot.sendMessage(chatId, 'Olá do Lambda!');
//   });

//   // /lojas
//   bot.onText(/\/lojas/, (msg) => {
//     const chatId = msg.chat.id;
//     // ... seu código para listar lojas
//   });

//   // callback_query
//   bot.on('callback_query', async (query) => {
//     // ... seu código de callback
//     await bot.answerCallbackQuery(query.id);
//   });

//   // web_app_data
//   bot.on('web_app_data', async (msg) => {
//     // ... seu código de WebApp
//   });

//   // outros handlers...
// }
