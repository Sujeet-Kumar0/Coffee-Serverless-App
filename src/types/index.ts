export interface Order {
    orderId: string;
    customerName: string;
    items: OrderItem[];
    status: OrderStatus;
    totalPrice: number;
    createdAt: string;
    updatedAt: string;
}

export interface OrderItem {
    name: string;
    price: number;
    quantity: number;
    options?: string[];
}

export type OrderStatus = 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface CreateOrderRequest {
    customerName: string;
    items: OrderItem[];
}

export interface UpdateOrderRequest {
    customerName?: string;
    items?: OrderItem[];
    status?: OrderStatus;
}
