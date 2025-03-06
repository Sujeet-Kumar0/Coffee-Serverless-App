import { v4 as uuidv4 } from 'uuid';
import { Order, CreateOrderRequest, OrderStatus } from '../types';

export class OrderModel {
    static create(data: CreateOrderRequest): Order {
        const timestamp = new Date().toISOString();

        // Calculate total price
        const totalPrice = data.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );

        return {
            orderId: uuidv4(),
            customerName: data.customerName,
            items: data.items,
            status: 'pending' as OrderStatus,
            totalPrice,
            createdAt: timestamp,
            updatedAt: timestamp
        };
    }
}