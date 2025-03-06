import {APIGatewayProxyEvent} from 'aws-lambda';

import {handler as createOrderHandler} from '../../src/functions/createOrder';
import {handler as getOrderHandler} from '../../src/functions/getOrder';
import {handler as listOrdersHandler} from '../../src/functions/listOrders';
import {handler as updateOrderHandler} from '../../src/functions/updateOrder';
import {handler as deleteOrderHandler} from '../../src/functions/deleteOrder';
// Import the mocked methods
import {
    createOrder,
    deleteOrder,
    getOrder,
    scanOrders,
    updateOrder
} from '@libs/dynamodb-client';

// Mock the DynamoDB client functions used in your handlers
jest.mock('../../src/libs/dynamodb-client', () => ({
    createOrder: jest.fn(),
    getOrder: jest.fn(),
    scanOrders: jest.fn(),
    updateOrder: jest.fn(),
    deleteOrder: jest.fn(),
}));

// Optionally, mock OrderModel if its behavior influences your handler logic
jest.mock('../../src/models/order', () => ({
    OrderModel: {
        create: jest.fn((data) => ({orderId: 'order1', ...data})),
    },
}));

describe('Lambda Handlers', () => {
    describe('createOrderHandler', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return 400 if required fields are missing', async () => {
            const event = {
                body: JSON.stringify({customerName: '', items: []}),
            } as unknown as APIGatewayProxyEvent;

            const result = await createOrderHandler(event);
            const body = JSON.parse(result.body);
            expect(result.statusCode).toBe(400);
            expect(body.message).toMatch(/Missing required fields/);
        });

        it('should create an order successfully', async () => {
            const orderData = {
                customerName: 'John Doe',
                items: [{productId: 'prod1', quantity: 2, price: 10}],
            };
            // Simulate successful DynamoDB creation
            (createOrder as jest.Mock).mockResolvedValue({
                orderId: 'order1',
                ...orderData,
                createdAt: expect.any(String),
                updatedAt: expect.any(String),
            });

            const event = {
                body: JSON.stringify(orderData),
            } as unknown as APIGatewayProxyEvent;

            const result = await createOrderHandler(event);
            expect(result.statusCode).toBe(201);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Order created successfully');
            expect(body.order).toHaveProperty('orderId', 'order1');
        });

        it('should handle errors during order creation', async () => {
            const orderData = {
                customerName: 'John Doe',
                items: [{productId: 'prod1', quantity: 2, price: 10}],
            };
            (createOrder as jest.Mock).mockRejectedValue(new Error('Database error'));

            const event = {
                body: JSON.stringify(orderData),
            } as unknown as APIGatewayProxyEvent;

            const result = await createOrderHandler(event);
            expect(result.statusCode).toBe(500);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Could not create order');
        });
    });

    describe('getOrderHandler', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return 400 if orderId is missing', async () => {
            const event = {
                pathParameters: {},
            } as unknown as APIGatewayProxyEvent;

            const result = await getOrderHandler(event);
            expect(result.statusCode).toBe(400);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Missing order ID');
        });

        it('should return 404 if order is not found', async () => {
            (getOrder as jest.Mock).mockResolvedValue(null);
            const event = {
                pathParameters: {orderId: 'order1'},
            } as unknown as APIGatewayProxyEvent;

            const result = await getOrderHandler(event);
            expect(result.statusCode).toBe(404);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Order not found');
        });

        it('should retrieve an order successfully', async () => {
            const order = {orderId: 'order1', customerName: 'John Doe', items: []};
            (getOrder as jest.Mock).mockResolvedValue(order);
            const event = {
                pathParameters: {orderId: 'order1'},
            } as unknown as APIGatewayProxyEvent;

            const result = await getOrderHandler(event);
            expect(result.statusCode).toBe(200);
            const body = JSON.parse(result.body);
            expect(body.order).toEqual(order);
        });

        it('should handle errors during order retrieval', async () => {
            (getOrder as jest.Mock).mockRejectedValue(new Error('Database error'));
            const event = {
                pathParameters: {orderId: 'order1'},
            } as unknown as APIGatewayProxyEvent;

            const result = await getOrderHandler(event);
            expect(result.statusCode).toBe(500);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Could not retrieve order');
        });
    });

    describe('listOrdersHandler', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should list orders successfully without lastKey', async () => {
            const orders = [{orderId: 'order1'}, {orderId: 'order2'}];
            // Return orders and no pagination key
            (scanOrders as jest.Mock).mockResolvedValue({items: orders, lastEvaluatedKey: null});

            const event = {
                queryStringParameters: {},
            } as unknown as APIGatewayProxyEvent;

            const result = await listOrdersHandler(event);
            expect(result.statusCode).toBe(200);

            const body = JSON.parse(result.body);
            expect(body.count).toBe(orders.length);
            expect(body.orders).toEqual(orders);
            expect(body.nextKey).toBeNull();

            // Ensure scanOrders is called with a null key and limit 10
            expect(scanOrders).toHaveBeenCalledWith(null, 10);
        });

        it('should list orders successfully with a valid lastKey', async () => {
            const orders = [{orderId: 'order3'}, {orderId: 'order4'}];
            const dummyLastKey = {orderId: 'order4'};
            // Return orders along with a dummy lastEvaluatedKey
            (scanOrders as jest.Mock).mockResolvedValue({items: orders, lastEvaluatedKey: dummyLastKey});

            // Simulate encoded lastKey from API query parameters
            const encodedLastKey = encodeURIComponent(JSON.stringify(dummyLastKey));
            const event = {
                queryStringParameters: {lastKey: encodedLastKey},
            } as unknown as APIGatewayProxyEvent;

            const result = await listOrdersHandler(event);
            expect(result.statusCode).toBe(200);

            const body = JSON.parse(result.body);
            expect(body.count).toBe(orders.length);
            expect(body.orders).toEqual(orders);
            // Expect nextKey to be the encoded dummyLastKey
            expect(body.nextKey).toEqual(encodedLastKey);

            // Ensure scanOrders is called with the parsed key and limit 10
            expect(scanOrders).toHaveBeenCalledWith(dummyLastKey, 10);
        });

        it('should handle errors during order listing', async () => {
            (scanOrders as jest.Mock).mockRejectedValue(new Error('Database error'));
            const event = {
                queryStringParameters: {},
            } as unknown as APIGatewayProxyEvent;

            const result = await listOrdersHandler(event);
            expect(result.statusCode).toBe(500);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Could not list orders');
        });
    });

    describe('updateOrderHandler', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return 400 if orderId is missing', async () => {
            const event = {
                pathParameters: {},
                body: JSON.stringify({customerName: 'Jane Doe'}),
            } as unknown as APIGatewayProxyEvent;

            const result = await updateOrderHandler(event);
            expect(result.statusCode).toBe(400);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Missing order ID');
        });

        it('should return 404 if order does not exist', async () => {
            (getOrder as jest.Mock).mockResolvedValue(null);
            const event = {
                pathParameters: {orderId: 'order1'},
                body: JSON.stringify({customerName: 'Jane Doe'}),
            } as unknown as APIGatewayProxyEvent;

            const result = await updateOrderHandler(event);
            expect(result.statusCode).toBe(404);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Order not found');
        });

        it('should update an order successfully', async () => {
            const existingOrder = {orderId: 'order1', customerName: 'John Doe', items: []};
            const updateData = {
                customerName: 'Jane Doe',
                items: [{productId: 'prod1', quantity: 2, price: 10}],
            };
            const updatedOrder = {
                orderId: 'order1',
                customerName: 'Jane Doe',
                items: updateData.items,
                totalPrice: 20,
            };

            (getOrder as jest.Mock).mockResolvedValue(existingOrder);
            (updateOrder as jest.Mock).mockResolvedValue(updatedOrder);

            const event = {
                pathParameters: {orderId: 'order1'},
                body: JSON.stringify(updateData),
            } as unknown as APIGatewayProxyEvent;

            const result = await updateOrderHandler(event);
            expect(result.statusCode).toBe(200);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Order updated successfully');
            expect(body.order).toEqual(updatedOrder);
        });

        it('should handle errors during order update', async () => {
            const existingOrder = {orderId: 'order1', customerName: 'John Doe', items: []};
            const updateData = {customerName: 'Jane Doe'};

            (getOrder as jest.Mock).mockResolvedValue(existingOrder);
            (updateOrder as jest.Mock).mockRejectedValue(new Error('Update error'));

            const event = {
                pathParameters: {orderId: 'order1'},
                body: JSON.stringify(updateData),
            } as unknown as APIGatewayProxyEvent;

            const result = await updateOrderHandler(event);
            expect(result.statusCode).toBe(500);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Could not update order');
        });
    });

    describe('deleteOrderHandler', () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        it('should return 400 if orderId is missing', async () => {
            const event = {
                pathParameters: {},
            } as unknown as APIGatewayProxyEvent;

            const result = await deleteOrderHandler(event);
            expect(result.statusCode).toBe(400);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Missing order ID');
        });

        it('should return 404 if order does not exist', async () => {
            (getOrder as jest.Mock).mockResolvedValue(null);
            const event = {
                pathParameters: {orderId: 'order1'},
            } as unknown as APIGatewayProxyEvent;

            const result = await deleteOrderHandler(event);
            expect(result.statusCode).toBe(404);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Order not found');
        });

        it('should delete an order successfully', async () => {
            const existingOrder = {orderId: 'order1', customerName: 'John Doe'};
            (getOrder as jest.Mock).mockResolvedValue(existingOrder);
            (deleteOrder as jest.Mock).mockResolvedValue(undefined);

            const event = {
                pathParameters: {orderId: 'order1'},
            } as unknown as APIGatewayProxyEvent;

            const result = await deleteOrderHandler(event);
            expect(result.statusCode).toBe(200);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Order deleted successfully');
        });

        it('should handle errors during order deletion', async () => {
            const existingOrder = {orderId: 'order1', customerName: 'John Doe'};
            (getOrder as jest.Mock).mockResolvedValue(existingOrder);
            (deleteOrder as jest.Mock).mockRejectedValue(new Error('Delete error'));

            const event = {
                pathParameters: {orderId: 'order1'},
            } as unknown as APIGatewayProxyEvent;

            const result = await deleteOrderHandler(event);
            expect(result.statusCode).toBe(500);
            const body = JSON.parse(result.body);
            expect(body.message).toBe('Could not delete order');
        });
    });
});
