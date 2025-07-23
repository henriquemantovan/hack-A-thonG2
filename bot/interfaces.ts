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